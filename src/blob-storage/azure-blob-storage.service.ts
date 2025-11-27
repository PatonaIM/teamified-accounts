import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  path: string;
}

@Injectable()
export class AzureBlobStorageService {
  private readonly logger = new Logger(AzureBlobStorageService.name);
  private blobServiceClient: BlobServiceClient | null = null;
  private containerClient: ContainerClient | null = null;
  
  private readonly containerName = 'teamified-accounts';
  private readonly baseUrl = 'https://tmfprdfilestorage.blob.core.windows.net/teamified-accounts';
  
  private readonly allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  private readonly allowedLogoExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  private readonly maxFileSizeBytes = 5 * 1024 * 1024; // 5MB

  constructor(private readonly configService: ConfigService) {
    this.initializeClient();
  }

  private initializeClient() {
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    
    if (!connectionString) {
      this.logger.warn('AZURE_STORAGE_CONNECTION_STRING not configured. Azure Blob Storage features will be unavailable.');
      return;
    }

    try {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      this.logger.log('Azure Blob Storage client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Azure Blob Storage client:', error);
    }
  }

  private ensureInitialized(): void {
    if (!this.containerClient) {
      throw new BadRequestException(
        'Azure Blob Storage is not configured. Please set the AZURE_STORAGE_CONNECTION_STRING environment variable.'
      );
    }
  }

  private validateFileExtension(extension: string, allowedExtensions: string[]): string {
    const normalizedExtension = extension.toLowerCase().replace(/^\./, '');
    
    if (!allowedExtensions.includes(normalizedExtension)) {
      throw new BadRequestException(
        `Invalid file extension "${normalizedExtension}". Allowed: ${allowedExtensions.join(', ')}`
      );
    }
    
    return normalizedExtension;
  }

  private getContentType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  async uploadUserProfilePicture(
    userId: string,
    fileBuffer: Buffer,
    originalFilename: string,
  ): Promise<UploadResult> {
    this.ensureInitialized();

    if (fileBuffer.length > this.maxFileSizeBytes) {
      throw new BadRequestException(`File size exceeds maximum of ${this.maxFileSizeBytes / (1024 * 1024)}MB`);
    }

    const extension = originalFilename.split('.').pop() || '';
    const validExtension = this.validateFileExtension(extension, this.allowedImageExtensions);
    
    const timestamp = Date.now();
    const filename = `profile_${timestamp}.${validExtension}`;
    const blobPath = `users/${userId}/${filename}`;

    await this.uploadBlob(blobPath, fileBuffer, validExtension);

    const url = `${this.baseUrl}/${blobPath}`;
    
    this.logger.log(`Uploaded profile picture for user ${userId}: ${blobPath}`);
    
    return {
      url,
      path: blobPath,
    };
  }

  async uploadOrganizationLogo(
    organizationId: string,
    fileBuffer: Buffer,
    originalFilename: string,
  ): Promise<UploadResult> {
    this.ensureInitialized();

    if (fileBuffer.length > this.maxFileSizeBytes) {
      throw new BadRequestException(`File size exceeds maximum of ${this.maxFileSizeBytes / (1024 * 1024)}MB`);
    }

    const extension = originalFilename.split('.').pop() || '';
    const validExtension = this.validateFileExtension(extension, this.allowedLogoExtensions);
    
    const timestamp = Date.now();
    const filename = `logo_${timestamp}.${validExtension}`;
    const blobPath = `organizations/${organizationId}/${filename}`;

    await this.uploadBlob(blobPath, fileBuffer, validExtension);

    const url = `${this.baseUrl}/${blobPath}`;
    
    this.logger.log(`Uploaded logo for organization ${organizationId}: ${blobPath}`);
    
    return {
      url,
      path: blobPath,
    };
  }

  private async uploadBlob(blobPath: string, fileBuffer: Buffer, extension: string): Promise<void> {
    const blockBlobClient = this.containerClient!.getBlockBlobClient(blobPath);
    const contentType = this.getContentType(extension);

    try {
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
          blobContentType: contentType,
          blobCacheControl: 'public, max-age=31536000', // 1 year cache
        },
      });
    } catch (error) {
      this.logger.error(`Failed to upload blob ${blobPath}:`, error);
      throw new BadRequestException('Failed to upload file to storage');
    }
  }

  async checkFolderExists(folderPath: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      const iterator = this.containerClient!.listBlobsFlat({
        prefix: folderPath.endsWith('/') ? folderPath : `${folderPath}/`,
      });
      
      const result = await iterator.next();
      return !result.done;
    } catch (error) {
      this.logger.error(`Error checking folder ${folderPath}:`, error);
      return false;
    }
  }

  async listUserPictures(userId: string): Promise<string[]> {
    this.ensureInitialized();

    const pictures: string[] = [];
    const prefix = `users/${userId}/`;

    try {
      for await (const blob of this.containerClient!.listBlobsFlat({ prefix })) {
        pictures.push(`${this.baseUrl}/${blob.name}`);
      }
    } catch (error) {
      this.logger.error(`Error listing pictures for user ${userId}:`, error);
    }

    return pictures;
  }

  async listOrganizationLogos(organizationId: string): Promise<string[]> {
    this.ensureInitialized();

    const logos: string[] = [];
    const prefix = `organizations/${organizationId}/`;

    try {
      for await (const blob of this.containerClient!.listBlobsFlat({ prefix })) {
        logos.push(`${this.baseUrl}/${blob.name}`);
      }
    } catch (error) {
      this.logger.error(`Error listing logos for organization ${organizationId}:`, error);
    }

    return logos;
  }

  getPublicUrl(blobPath: string): string {
    if (!blobPath) return '';
    if (blobPath.startsWith('http://') || blobPath.startsWith('https://')) {
      return blobPath;
    }
    return `${this.baseUrl}/${blobPath}`;
  }

  isConfigured(): boolean {
    return this.containerClient !== null;
  }
}
