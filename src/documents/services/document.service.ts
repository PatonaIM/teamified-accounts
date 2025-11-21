import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType } from '../entities/document.entity';
import { EmploymentRecord } from '../../employment-records/entities/employment-record.entity';
import { StorageService } from './storage.service';
import { AuditService } from '../../audit/audit.service';

export interface UploadDocumentResult {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface DocumentListItem {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: Date;
  category?: string;
  description?: string;
}

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(EmploymentRecord)
    private readonly employmentRecordRepository: Repository<EmploymentRecord>,
    private readonly storageService: StorageService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Upload a general document (HR documents, policies, etc.)
   */
  async uploadDocument(
    userId: string,
    file: any,
    documentType: DocumentType,
    metadata?: {
      category?: string;
      description?: string;
    },
  ): Promise<UploadDocumentResult> {
    try {
      // Validate file
      this.validateDocumentFile(file);

      // Check if user has submitted their onboarding (prevent uploads after submission)
      const employmentRecord = await this.employmentRecordRepository.findOne({
        where: { userId, status: 'onboarding' },
      });

      if (employmentRecord && employmentRecord.onboardingSubmittedAt) {
        throw new ForbiddenException(
          'Cannot upload documents after onboarding has been submitted. Please contact HR if you need to update your documents.'
        );
      }

      // Generate version ID
      const versionId = this.storageService.generateVersionId();

      // Upload to storage
      const uploadResult = await this.storageService.uploadCV(
        userId,
        versionId,
        file.buffer,
        file.originalname,
        file.mimetype,
        'candidate', // General documents are for candidates/users
      );

      // Create document record
      const documentData: Partial<Document> = {
        userId,
        documentType,
        category: metadata?.category || null,
        fileName: file.originalname,
        filePath: uploadResult.filePath,
        contentType: file.mimetype,
        fileSize: uploadResult.fileSize,
        sha256Checksum: uploadResult.sha256Checksum,
        versionId,
        isCurrent: true,
        uploadedBy: userId,
        uploadedByRole: 'candidate',
      };

      const document = this.documentRepository.create(documentData);
      const savedDocument = await this.documentRepository.save(document);

      // Log audit event
      await this.auditService.log({
        actorUserId: userId,
        actorRole: 'candidate',
        action: 'upload',
        entityType: 'document',
        entityId: savedDocument.id,
        changes: {
          fileName: file.originalname,
          documentType,
          fileSize: uploadResult.fileSize,
          ...metadata,
        },
      });

      this.logger.log(`Document uploaded: ${savedDocument.id} for user ${userId}`);

      return {
        id: savedDocument.id,
        fileName: savedDocument.fileName,
        fileSize: savedDocument.fileSize,
        uploadedAt: savedDocument.uploadedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to upload document for user ${userId}:`, error);
      throw new BadRequestException(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * List all documents for a user
   */
  async listDocuments(
    userId: string,
    documentType?: DocumentType,
    category?: string,
  ): Promise<Document[]> {
    try {
      const whereClause: any = {
        userId,
      };

      if (documentType) {
        whereClause.documentType = documentType;
      } else {
        // Map category to document type for cross-page compatibility
        // CVs use DocumentType.CV for CV Management page compatibility
        // Other categories use DocumentType.HR_DOCUMENT
        if (category === 'cv') {
          whereClause.documentType = DocumentType.CV;
        } else if (category) {
          whereClause.documentType = DocumentType.HR_DOCUMENT;
        } else {
          // When no category specified, exclude CVs as they have their own page
          whereClause.documentType = DocumentType.HR_DOCUMENT;
        }
      }

      if (category) {
        whereClause.category = category;
      }

      const documents = await this.documentRepository.find({
        where: whereClause,
        order: {
          uploadedAt: 'DESC',
        },
      });

      this.logger.log(`Listed ${documents.length} documents for user ${userId} (category: ${category || 'all'})`);

      return documents;
    } catch (error) {
      this.logger.error(`Failed to list documents for user ${userId}:`, error);
      throw new BadRequestException(`Failed to retrieve document list: ${error.message}`);
    }
  }

  /**
   * Get download URL for a specific document
   * If userId is provided, enforces ownership check
   * If userId is null/undefined (for admin/HR), allows access to any document
   */
  async getDownloadUrl(
    userId: string | null,
    documentId: string,
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    try {
      const whereClause: any = {
        id: documentId,
      };

      // Only enforce userId check if userId is provided (non-admin/HR users)
      if (userId) {
        whereClause.userId = userId;
      }

      const document = await this.documentRepository.findOne({
        where: whereClause,
      });

      if (!document) {
        throw new NotFoundException(`Document ${documentId} not found`);
      }

      const result = await this.storageService.generateSignedUrl(document.filePath);

      this.logger.log(`Generated download URL for document ${documentId}${userId ? ` (user: ${userId})` : ' (admin/HR access)'}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to generate download URL for document ${documentId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to generate download URL: ${error.message}`);
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(userId: string, documentId: string): Promise<void> {
    try {
      const document = await this.documentRepository.findOne({
        where: {
          id: documentId,
          userId,
        },
      });

      if (!document) {
        throw new NotFoundException(`Document ${documentId} not found`);
      }

      // Prevent deletion of verified documents
      if (document.status === 'approved') {
        throw new BadRequestException(
          'Verified documents cannot be deleted. Please contact HR if you need to update this document.',
        );
      }

      // Delete from storage
      await this.storageService.deleteFile(document.filePath);

      // Delete from database
      await this.documentRepository.remove(document);

      this.logger.log(`Document ${documentId} deleted for user ${userId}`);

      // Log audit event
      await this.auditService.log({
        actorUserId: userId,
        actorRole: 'candidate',
        action: 'delete',
        entityType: 'document',
        entityId: document.id,
        changes: {
          fileName: document.fileName,
          documentType: document.documentType,
          category: document.category,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to delete document for user ${userId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Get all versions of a document (by fileName + category)
   */
  async getDocumentVersions(userId: string, documentId: string): Promise<Document[]> {
    try {
      // First, get the document to find its fileName and category
      const document = await this.documentRepository.findOne({
        where: {
          id: documentId,
          userId,
        },
      });

      if (!document) {
        throw new NotFoundException(`Document ${documentId} not found`);
      }

      // Find all versions with the same fileName and category
      const versions = await this.documentRepository.find({
        where: {
          userId,
          fileName: document.fileName,
          category: document.category,
        },
        order: {
          uploadedAt: 'DESC',
        },
      });

      this.logger.log(`Found ${versions.length} versions for document ${documentId}`);

      return versions;
    } catch (error) {
      this.logger.error(`Failed to get document versions for user ${userId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve document versions: ${error.message}`);
    }
  }

  /**
   * Find all documents by user ID
   */
  async findByUserId(userId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { userId },
      order: { uploadedAt: 'DESC' },
    });
  }

  /**
   * Validate document file
   */
  private validateDocumentFile(file: any): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Max file size: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed types: PDF, DOC, DOCX, TXT, JPG, PNG',
      );
    }
  }
}

