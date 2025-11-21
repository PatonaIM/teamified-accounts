import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { put, del, head } from '@vercel/blob';

export interface UploadResult {
  filePath: string;
  sha256Checksum: string;
  fileSize: number;
}

export interface SignedUrlResult {
  downloadUrl: string;
  expiresAt: Date;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly defaultExpirationHours = 1;
  private readonly storageBasePath = path.join(process.cwd(), 'storage');
  private readonly writeFile = promisify(fs.writeFile);
  private readonly readFile = promisify(fs.readFile);
  private readonly unlink = promisify(fs.unlink);
  private readonly mkdir = promisify(fs.mkdir);
  private readonly stat = promisify(fs.stat);
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  constructor() {
    if (this.isProduction && !this.blobToken) {
      this.logger.warn('⚠️  BLOB_READ_WRITE_TOKEN not set - file uploads will fail in production!');
    } else if (this.isProduction) {
      this.logger.log('✅ Vercel Blob storage configured for production');
    } else {
      this.logger.log('📁 Using local file storage for development');
    }
  }

  /**
   * Upload file to storage with CV-specific path structure
   * Supports both candidates (users) and EOR employees
   * @param ownerId User ID or EOR profile ID
   * @param versionId Version ID for the file
   * @param file File buffer to upload
   * @param fileName Original file name
   * @param contentType File content type
   * @param userType Type of user ('candidate' or 'eor')
   */
  async uploadCV(
    ownerId: string,
    versionId: string,
    file: Buffer,
    fileName: string,
    contentType: string,
    userType: 'candidate' | 'eor' = 'eor',
  ): Promise<UploadResult> {
    try {
      // Generate SHA-256 checksum
      const sha256Checksum = crypto.createHash('sha256').update(file).digest('hex');
      
      // Determine file extension from content type or filename
      const extension = this.getFileExtension(fileName, contentType);
      
      // Generate path based on user type
      const pathPrefix = userType === 'candidate' ? 'cvs/users' : 'cvs/eor-profiles';
      const blobPath = `${pathPrefix}/${ownerId}/${versionId}${extension}`;
      
      let filePath: string;
      
      if (this.isProduction) {
        // Upload to Vercel Blob and get the URL
        const blobUrl = await this.uploadToBlob(blobPath, file, contentType);
        filePath = blobUrl; // Store the full blob URL
        this.logger.log(`File uploaded to Vercel Blob (${userType}): ${blobUrl} (${file.length} bytes)`);
      } else {
        // Upload to local storage
        await this.uploadToLocalStorage(blobPath, file);
        filePath = blobPath; // Store the relative path
        this.logger.log(`File uploaded to local storage (${userType}): ${blobPath} (${file.length} bytes)`);
      }
      
      return {
        filePath,
        sha256Checksum,
        fileSize: file.length,
      };
    } catch (error) {
      this.logger.error(`Failed to upload CV for ${userType} ${ownerId}:`, error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }
  }

  /**
   * Upload file to Vercel Blob
   * Returns the blob URL for storage in database
   */
  private async uploadToBlob(filePath: string, file: Buffer, contentType: string): Promise<string> {
    try {
      const blob = await put(filePath, file, {
        access: 'public',
        contentType,
        token: this.blobToken,
      });
      this.logger.log(`Blob uploaded: ${blob.url}`);
      return blob.url;
    } catch (error) {
      this.logger.error(`Vercel Blob upload failed:`, error);
      throw error;
    }
  }

  /**
   * Upload file to local storage
   */
  private async uploadToLocalStorage(filePath: string, file: Buffer): Promise<void> {
    const fullPath = path.join(this.storageBasePath, filePath);
    const directory = path.dirname(fullPath);
    
    // Ensure directory exists
    await this.ensureDirectoryExists(directory);
    
    // Write file to storage
    await this.writeFile(fullPath, file);
  }

  /**
   * Generate signed URL for secure file download
   * @param filePath File path in storage (or blob URL in production)
   * @param expirationHours Optional expiration in hours (default: 1)
   */
  async generateSignedUrl(
    filePath: string,
    expirationHours: number = this.defaultExpirationHours,
  ): Promise<SignedUrlResult> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);
      
      // Check if filePath is already a blob URL (starts with https://)
      if (filePath.startsWith('https://')) {
        // It's already a blob URL, return it directly
        this.logger.log(`Using existing Vercel Blob URL: ${filePath}`);
        
        return {
          downloadUrl: filePath,
          expiresAt,
        };
      } else {
        // For local storage, generate a signed token
        const token = crypto.createHash('sha256')
          .update(`${filePath}-${expiresAt.getTime()}-${process.env.JWT_SECRET || 'default-secret'}`)
          .digest('hex');
        
        const downloadUrl = `/api/v1/files/download/${encodeURIComponent(filePath)}?token=${token}&expires=${expiresAt.getTime()}`;
        
        this.logger.log(`Generated signed URL for ${filePath}, expires: ${expiresAt.toISOString()}`);
        
        return {
          downloadUrl,
          expiresAt,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to generate signed URL for ${filePath}:`, error);
      throw new Error(`Signed URL generation failed: ${error.message}`);
    }
  }

  /**
   * Delete file from storage
   * @param filePath File path in storage (or blob URL in production)
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      if (filePath.startsWith('https://')) {
        // It's a blob URL, delete from Vercel Blob
        await del(filePath, { token: this.blobToken });
        this.logger.log(`File deleted from Vercel Blob: ${filePath}`);
      } else {
        // Delete from local storage
        const fullPath = path.join(this.storageBasePath, filePath);
        
        try {
          await this.stat(fullPath);
          await this.unlink(fullPath);
          this.logger.log(`File deleted from local storage: ${filePath}`);
        } catch (error) {
          if (error.code === 'ENOENT') {
            this.logger.warn(`File not found for deletion: ${filePath}`);
            return;
          }
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(`Failed to delete file ${filePath}:`, error);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Validate file type for CV uploads
   * @param contentType File content type
   * @param fileName Original file name
   */
  isValidCVFileType(contentType: string, fileName: string): boolean {
    const validContentTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    ];
    
    const validExtensions = ['.pdf', '.docx'];
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    
    return validContentTypes.includes(contentType) && validExtensions.includes(fileExtension);
  }

  /**
   * Validate file size (max 10MB for CVs)
   * @param fileSize File size in bytes
   */
  isValidFileSize(fileSize: number): boolean {
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    return fileSize <= maxSizeBytes;
  }

  /**
   * Generate version ID for file versioning
   */
  generateVersionId(): string {
    return `v${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Get file extension based on content type or filename
   */
  private getFileExtension(fileName: string, contentType: string): string {
    if (contentType === 'application/pdf') {
      return '.pdf';
    } else if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return '.docx';
    } else {
      // Fallback to filename extension
      const dotIndex = fileName.lastIndexOf('.');
      return dotIndex !== -1 ? fileName.substring(dotIndex) : '';
    }
  }

  /**
   * Ensure directory exists, create if it doesn't
   */
  private async ensureDirectoryExists(directoryPath: string): Promise<void> {
    try {
      await this.stat(directoryPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Directory doesn't exist, create it recursively
        await this.mkdir(directoryPath, { recursive: true });
      } else {
        throw error;
      }
    }
  }

  /**
   * Read file from storage
   * @param filePath File path in storage (or blob URL in production)
   */
  async readFileFromStorage(filePath: string): Promise<Buffer> {
    try {
      if (filePath.startsWith('https://')) {
        // Fetch from Vercel Blob URL
        const response = await fetch(filePath);
        
        if (!response.ok) {
          throw new Error(`Blob fetch failed: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } else {
        // Read from local storage
        const fullPath = path.join(this.storageBasePath, filePath);
        return await this.readFile(fullPath);
      }
    } catch (error) {
      this.logger.error(`Failed to read file ${filePath}:`, error);
      throw new Error(`File read failed: ${error.message}`);
    }
  }

  /**
   * Check if file exists in storage
   * @param filePath File path in storage (or blob URL in production)
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      if (filePath.startsWith('https://')) {
        // Check Vercel Blob
        try {
          await head(filePath, { token: this.blobToken });
          return true;
        } catch (error) {
          return false;
        }
      } else {
        // Check local storage
        const fullPath = path.join(this.storageBasePath, filePath);
        await this.stat(fullPath);
        return true;
      }
    } catch (error) {
      return false;
    }
  }
}
