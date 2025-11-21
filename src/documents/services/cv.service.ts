import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType } from '../entities/document.entity';
import { EORProfile } from '../../profiles/entities/eor-profile.entity';
import { User } from '../../auth/entities/user.entity';
import { StorageService } from './storage.service';
import { AuditService } from '../../audit/audit.service';
import { ProfileCompletionService } from '../../profiles/services/profile-completion.service';

export interface UploadCVResult {
  id: string;
  versionId: string;
  fileName: string;
  isCurrent: boolean;
  uploadedAt: Date;
}

export interface CVListItem {
  id: string;
  versionId: string;
  fileName: string;
  isCurrent: boolean;
  uploadedAt: Date;
}

export type UserType = 'candidate' | 'eor';

export interface CVOwner {
  userId?: string;
  eorProfileId?: string;
  userType: UserType;
}

@Injectable()
export class CVService {
  private readonly logger = new Logger(CVService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(EORProfile)
    private readonly eorProfileRepository: Repository<EORProfile>,
    private readonly storageService: StorageService,
    private readonly auditService: AuditService,
    @Inject(forwardRef(() => ProfileCompletionService))
    private readonly profileCompletionService: ProfileCompletionService,
  ) {}

  /**
   * Upload a new CV version
   * Supports both candidates (userId) and EOR employees (eorProfileId)
   */
  async uploadCV(
    owner: CVOwner,
    file: any,
    actorUserId: string,
    userRole: string,
  ): Promise<UploadCVResult> {
    try {
      // Validate file
      this.validateCVFile(file);

      // Generate version ID
      const versionId = this.storageService.generateVersionId();

      // Upload to storage with appropriate path
      const uploadResult = await this.storageService.uploadCV(
        owner.eorProfileId || owner.userId!,
        versionId,
        file.buffer,
        file.originalname,
        file.mimetype,
        owner.userType,
      );

      // Mark previous CVs as not current
      await this.markPreviousCVsAsNotCurrent(owner);

      // Create document record with appropriate owner field
      const documentData: Partial<Document> = {
        documentType: DocumentType.CV,
        fileName: file.originalname,
        filePath: uploadResult.filePath,
        contentType: file.mimetype,
        fileSize: uploadResult.fileSize,
        sha256Checksum: uploadResult.sha256Checksum,
        versionId,
        isCurrent: true,
        uploadedBy: actorUserId,
        uploadedByRole: userRole,
      };

      // Set the appropriate owner field
      if (owner.userType === 'eor') {
        documentData.eorProfileId = owner.eorProfileId;
      } else {
        documentData.userId = owner.userId;
      }

      // Validate that we have an owner ID
      if (!documentData.eorProfileId && !documentData.userId) {
        this.logger.error(`Missing owner ID! Owner object: ${JSON.stringify(owner)}`);
        throw new BadRequestException('Cannot upload CV: missing user or EOR profile ID');
      }

      const document = this.documentRepository.create(documentData);
      const savedDocument = await this.documentRepository.save(document);

      // Log audit event
      await this.auditService.log({
        actorUserId,
        actorRole: userRole,
        action: 'cv_uploaded',
        entityType: 'Document',
        entityId: savedDocument.id,
        changes: {
          fileName: file.originalname,
          fileSize: uploadResult.fileSize,
          contentType: file.mimetype,
          versionId,
          userType: owner.userType,
        },
      });

      // Update profile completion for EOR users only
      if (owner.userType === 'eor' && owner.eorProfileId) {
        await this.updateProfileCompletion(owner.eorProfileId);
      }

      const ownerLog = owner.userType === 'eor' 
        ? `EOR profile ${owner.eorProfileId}` 
        : `User ${owner.userId}`;
      this.logger.log(`CV uploaded successfully for ${ownerLog}: ${savedDocument.id}`);

      return {
        id: savedDocument.id,
        versionId: savedDocument.versionId,
        fileName: savedDocument.fileName,
        isCurrent: savedDocument.isCurrent,
        uploadedAt: savedDocument.uploadedAt,
      };
    } catch (error) {
      const ownerLog = owner.userType === 'eor' 
        ? `EOR profile ${owner.eorProfileId}` 
        : `User ${owner.userId}`;
      this.logger.error(`Failed to upload CV for ${ownerLog}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`CV upload failed: ${error.message}`);
    }
  }

  /**
   * List all CV versions for a user (candidate or EOR)
   */
  async listCVs(owner: CVOwner): Promise<CVListItem[]> {
    try {
      const whereClause: any = {
        documentType: DocumentType.CV,
      };

      // Add appropriate owner filter
      if (owner.userType === 'eor') {
        whereClause.eorProfileId = owner.eorProfileId;
      } else {
        whereClause.userId = owner.userId;
      }

      const documents = await this.documentRepository.find({
        where: whereClause,
        order: {
          uploadedAt: 'DESC',
        },
      });

      const ownerLog = owner.userType === 'eor' 
        ? `EOR profile ${owner.eorProfileId}` 
        : `User ${owner.userId}`;
      this.logger.log(`Listed ${documents.length} CVs for ${ownerLog}`);

      return documents.map((doc) => ({
        id: doc.id,
        versionId: doc.versionId,
        fileName: doc.fileName,
        isCurrent: doc.isCurrent,
        uploadedAt: doc.uploadedAt,
      }));
    } catch (error) {
      const ownerLog = owner.userType === 'eor' 
        ? `EOR profile ${owner.eorProfileId}` 
        : `User ${owner.userId}`;
      this.logger.error(`Failed to list CVs for ${ownerLog}:`, error);
      throw new BadRequestException(`Failed to retrieve CV list: ${error.message}`);
    }
  }

  /**
   * Delete a CV version
   */
  async deleteCV(
    owner: CVOwner,
    versionId: string,
    actorUserId: string,
    userRole: string,
  ): Promise<void> {
    try {
      const whereClause: any = {
        documentType: DocumentType.CV,
        versionId,
      };

      // Add appropriate owner filter
      if (owner.userType === 'eor') {
        whereClause.eorProfileId = owner.eorProfileId;
      } else {
        whereClause.userId = owner.userId;
      }

      const document = await this.documentRepository.findOne({
        where: whereClause,
      });

      if (!document) {
        throw new NotFoundException(`CV version ${versionId} not found`);
      }

      // Delete from storage
      await this.storageService.deleteFile(document.filePath);

      // Delete from database
      await this.documentRepository.remove(document);

      const ownerLog = owner.userType === 'eor' 
        ? `EOR profile ${owner.eorProfileId}` 
        : `User ${owner.userId}`;
      this.logger.log(`CV ${versionId} deleted for ${ownerLog}`);

      // Log audit event
      await this.auditService.log({
        actorUserId,
        actorRole: userRole,
        action: 'delete',
        entityType: 'cv',
        entityId: document.id,
        changes: {
          fileName: document.fileName,
          versionId: document.versionId,
          ownerType: owner.userType,
          ownerId: owner.userType === 'eor' ? owner.eorProfileId : owner.userId,
        },
      });
    } catch (error) {
      const ownerLog = owner.userType === 'eor' 
        ? `EOR profile ${owner.eorProfileId}` 
        : `User ${owner.userId}`;
      this.logger.error(`Failed to delete CV for ${ownerLog}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete CV: ${error.message}`);
    }
  }

  /**
   * Get download URL for a specific CV version
   */
  async getDownloadUrl(
    owner: CVOwner,
    versionId: string,
    actorUserId: string,
    userRole: string,
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    try {
      const whereClause: any = {
        versionId,
        documentType: DocumentType.CV,
      };

      // Add appropriate owner filter
      if (owner.userType === 'eor') {
        whereClause.eorProfileId = owner.eorProfileId;
      } else {
        whereClause.userId = owner.userId;
      }

      // Find the document
      const document = await this.documentRepository.findOne({
        where: whereClause,
      });

      if (!document) {
        throw new NotFoundException(`CV version ${versionId} not found`);
      }

      // Generate signed URL
      const signedUrlResult = await this.storageService.generateSignedUrl(document.filePath);

      // Log audit event
      await this.auditService.log({
        actorUserId,
        actorRole: userRole,
        action: 'cv_downloaded',
        entityType: 'Document',
        entityId: document.id,
        changes: {
          fileName: document.fileName,
          versionId: document.versionId,
          expiresAt: signedUrlResult.expiresAt.toISOString(),
          userType: owner.userType,
        },
      });

      this.logger.log(`Download URL generated for CV ${document.id} by user ${actorUserId}`);

      return signedUrlResult;
    } catch (error) {
      this.logger.error(`Failed to generate download URL for CV ${versionId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to generate download URL: ${error.message}`);
    }
  }

  /**
   * Check if user has a current CV
   */
  async hasCurrentCV(owner: CVOwner): Promise<boolean> {
    const whereClause: any = {
      documentType: DocumentType.CV,
      isCurrent: true,
    };

    if (owner.userType === 'eor') {
      whereClause.eorProfileId = owner.eorProfileId;
    } else {
      whereClause.userId = owner.userId;
    }

    const count = await this.documentRepository.count({
      where: whereClause,
    });
    return count > 0;
  }

  /**
   * Validate CV file upload
   */
  private validateCVFile(file: any): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size
    if (!this.storageService.isValidFileSize(file.size)) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Validate file type
    if (!this.storageService.isValidCVFileType(file.mimetype, file.originalname)) {
      throw new BadRequestException('Invalid file type. Only PDF and DOCX files are allowed');
    }

    // Basic virus scanning placeholder
    if (this.containsSuspiciousContent(file)) {
      throw new BadRequestException('File failed security scan');
    }
  }

  /**
   * Mark all previous CVs as not current
   */
  private async markPreviousCVsAsNotCurrent(owner: CVOwner): Promise<void> {
    const whereClause: any = {
      documentType: DocumentType.CV,
      isCurrent: true,
    };

    if (owner.userType === 'eor') {
      whereClause.eorProfileId = owner.eorProfileId;
    } else {
      whereClause.userId = owner.userId;
    }

    await this.documentRepository.update(whereClause, {
      isCurrent: false,
    });
  }

  /**
   * Update profile completion percentage after CV upload
   */
  private async updateProfileCompletion(eorProfileId: string): Promise<void> {
    try {
      const eorProfile = await this.eorProfileRepository.findOne({
        where: { id: eorProfileId },
      });

      if (eorProfile) {
        const completion = await this.profileCompletionService.calculateCompletion(eorProfile);
        
        await this.eorProfileRepository.update(eorProfileId, {
          profileCompletionPercentage: completion.percentage,
          isProfileComplete: completion.isComplete,
          profileStatus: completion.status,
        });

        this.logger.log(`Profile completion updated for EOR ${eorProfileId}: ${completion.percentage}% (${completion.status})`);
      }
    } catch (error) {
      this.logger.error(`Failed to update profile completion for EOR ${eorProfileId}:`, error);
      // Don't throw here to avoid breaking CV upload
    }
  }

  /**
   * Basic virus/malware scanning placeholder
   * TODO: Implement actual virus scanning integration
   */
  private containsSuspiciousContent(file: any): boolean {
    // Placeholder for virus scanning logic
    // In production, integrate with actual antivirus service
    const suspiciousPatterns = [
      'eval(',
      'document.write',
      '<script>',
      'javascript:',
    ];

    const fileContent = file.buffer.toString('utf-8', 0, Math.min(1024, file.size));
    return suspiciousPatterns.some((pattern) => fileContent.toLowerCase().includes(pattern));
  }
}