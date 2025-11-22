import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType } from '../entities/document.entity';
import { StorageService, UploadResult } from './storage.service';
import { PayslipNotificationService } from '../../payroll/services/payslip-notification.service';

/**
 * TaxDocumentService
 * Extends existing DocumentsModule patterns for tax document management
 */
@Injectable()
export class TaxDocumentService {
  private readonly logger = new Logger(TaxDocumentService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => PayslipNotificationService))
    private readonly notificationService: PayslipNotificationService,
  ) {}

  /**
   * Upload tax document
   */
  async uploadTaxDocument(
    eorProfileId: string,
    file: Buffer,
    fileName: string,
    contentType: string,
    metadata: {
      category: string;
      taxYear: string;
      countryCode: string;
    },
  ): Promise<Document> {
    try {
      this.logger.log(`Uploading tax document for EOR profile ${eorProfileId}`);

      // Generate version ID
      const versionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Upload to storage
      const uploadResult: UploadResult = await this.storageService.uploadCV(
        eorProfileId,
        versionId,
        file,
        fileName,
        contentType,
      );

      // Create document record
      const document = this.documentRepository.create({
        eorProfileId,
        documentType: DocumentType.TAX_DOCUMENT,
        fileName,
        filePath: uploadResult.filePath,
        contentType,
        fileSize: uploadResult.fileSize,
        sha256Checksum: uploadResult.sha256Checksum,
        versionId,
        isCurrent: true,
        status: 'pending',
      });

      const saved = await this.documentRepository.save(document);
      this.logger.log(`Tax document uploaded successfully: ${saved.id}`);

      return saved;
    } catch (error) {
      this.logger.error(`Failed to upload tax document: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload tax document: ${error.message}`);
    }
  }

  /**
   * Get tax documents for an EOR profile
   */
  async getTaxDocuments(eorProfileId: string): Promise<Document[]> {
    return await this.documentRepository.find({
      where: {
        eorProfileId,
        documentType: DocumentType.TAX_DOCUMENT,
      },
      order: { uploadedAt: 'DESC' },
    });
  }

  /**
   * Get single tax document
   */
  async getTaxDocument(documentId: string, eorProfileId: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: {
        id: documentId,
        eorProfileId,
        documentType: DocumentType.TAX_DOCUMENT,
      },
    });

    if (!document) {
      throw new NotFoundException(`Tax document with ID ${documentId} not found`);
    }

    return document;
  }

  /**
   * Update tax document status (Admin/HR only)
   */
  async updateStatus(
    documentId: string,
    status: 'pending' | 'approved' | 'rejected',
    reviewedBy: string,
    reviewNotes?: string,
  ): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, documentType: DocumentType.TAX_DOCUMENT },
      relations: ['eorProfile'],
    });

    if (!document) {
      throw new NotFoundException(`Tax document with ID ${documentId} not found`);
    }

    document.status = status;
    document.reviewedBy = reviewedBy;
    document.reviewedAt = new Date();
    document.reviewNotes = reviewNotes || null;

    const updated = await this.documentRepository.save(document);
    this.logger.log(`Tax document ${documentId} status updated to ${status} by ${reviewedBy}`);

    // Send notification to employee
    if (status === 'approved' || status === 'rejected') {
      // Get userId from eorProfile
      const userId = document.eorProfile?.userId;
      if (userId) {
        await this.notificationService.notifyTaxDocumentStatus(
          userId,
          documentId,
          status,
          reviewNotes,
        );
      }
    }

    return updated;
  }

  /**
   * Delete tax document
   */
  async deleteTaxDocument(documentId: string, eorProfileId: string): Promise<void> {
    const document = await this.getTaxDocument(documentId, eorProfileId);

    // Delete from storage
    await this.storageService.deleteFile(document.filePath);

    // Delete from database
    await this.documentRepository.remove(document);
    this.logger.log(`Tax document ${documentId} deleted`);
  }

  /**
   * Get download URL for tax document
   */
  async getDownloadUrl(documentId: string, eorProfileId: string): Promise<string> {
    const document = await this.getTaxDocument(documentId, eorProfileId);

    const signedUrl = await this.storageService.generateSignedUrl(document.filePath);
    return signedUrl.downloadUrl;
  }

  /**
   * Get all pending tax documents (Admin/HR only)
   */
  async getPendingDocuments(): Promise<Document[]> {
    return await this.documentRepository.find({
      where: {
        documentType: DocumentType.TAX_DOCUMENT,
        status: 'pending',
      },
      order: { uploadedAt: 'ASC' },
    });
  }
}

