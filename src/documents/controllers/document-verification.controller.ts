import {
  Controller,
  Patch,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { VerifyDocumentDto, VerificationAction } from '../dto/verify-document.dto';
import { BulkVerifyDto } from '../dto/bulk-verify.dto';
import { RevokeVerificationDto } from '../dto/revoke-verification.dto';
import { DocumentService } from '../services/document.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { AuditService } from '../../audit/audit.service';
import { AuditLog } from '../../audit/entities/audit-log.entity';
import { User } from '../../auth/entities/user.entity';

@ApiTags('Document Verification')
@ApiBearerAuth()
@Controller('v1/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentVerificationController {
  private readonly logger = new Logger(DocumentVerificationController.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly documentService: DocumentService,
    private readonly auditService: AuditService,
  ) {}

  @Patch(':id/verify')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Verify a document (HR/Admin only)' })
  @ApiResponse({ status: 200, description: 'Document verified successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires HR or Admin role' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async verifyDocument(
    @Param('id') documentId: string,
    @Body() verifyDto: VerifyDocumentDto,
    @Request() req: any,
  ) {
    try {
      const document = await this.documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }

      // Store previous status for audit
      const previousStatus = document.status;

      // Map verification action to document status
      let newStatus: 'approved' | 'rejected' | 'needs_changes';
      switch (verifyDto.action) {
        case VerificationAction.APPROVE:
          newStatus = 'approved';
          break;
        case VerificationAction.REJECT:
          newStatus = 'rejected';
          break;
        case VerificationAction.NEEDS_CHANGES:
          newStatus = 'needs_changes';
          break;
      }

      // Update document
      document.status = newStatus;
      document.reviewedBy = req.user.sub;
      document.reviewedAt = new Date();
      document.reviewNotes = verifyDto.notes;

      const updatedDocument = await this.documentRepository.save(document);

      // Log audit event
      await this.auditService.log({
        actorUserId: req.user.sub,
        actorRole: req.user.roles?.[0] || 'hr',
        action: `verify_document_${verifyDto.action}`,
        entityType: 'Document',
        entityId: documentId,
        changes: {
          documentId,
          fileName: document.fileName,
          category: document.category,
          action: verifyDto.action,
          notes: verifyDto.notes,
          previousStatus,
          newStatus,
        },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      this.logger.log(
        `Document ${documentId} ${verifyDto.action}d by user ${req.user.sub}`,
      );

      return {
        id: updatedDocument.id,
        status: updatedDocument.status,
        reviewedBy: updatedDocument.reviewedBy,
        reviewedAt: updatedDocument.reviewedAt,
        reviewNotes: updatedDocument.reviewNotes,
      };
    } catch (error) {
      this.logger.error(`Failed to verify document ${documentId}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to verify document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('bulk-verify')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Verify multiple documents at once (HR/Admin only)' })
  @ApiResponse({ status: 200, description: 'Bulk verification completed' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires HR or Admin role' })
  async bulkVerifyDocuments(
    @Body() bulkVerifyDto: BulkVerifyDto,
    @Request() req: any,
  ) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ documentId: string; error: string }>,
    };

    // Map verification action to document status
    let newStatus: 'approved' | 'rejected' | 'needs_changes';
    switch (bulkVerifyDto.action) {
      case VerificationAction.APPROVE:
        newStatus = 'approved';
        break;
      case VerificationAction.REJECT:
        newStatus = 'rejected';
        break;
      case VerificationAction.NEEDS_CHANGES:
        newStatus = 'needs_changes';
        break;
    }

    for (const documentId of bulkVerifyDto.documentIds) {
      try {
        const document = await this.documentRepository.findOne({
          where: { id: documentId },
        });

        if (!document) {
          results.failed++;
          results.errors.push({
            documentId,
            error: 'Document not found',
          });
          continue;
        }

        const previousStatus = document.status;

        // Update document
        document.status = newStatus;
        document.reviewedBy = req.user.sub;
        document.reviewedAt = new Date();
        document.reviewNotes = bulkVerifyDto.notes;

        await this.documentRepository.save(document);

        // Log audit event for each document
        await this.auditService.log({
          actorUserId: req.user.sub,
          actorRole: req.user.roles?.[0] || 'hr',
          action: `verify_document_${bulkVerifyDto.action}`,
          entityType: 'Document',
          entityId: documentId,
          changes: {
            documentId,
            fileName: document.fileName,
            category: document.category,
            action: bulkVerifyDto.action,
            notes: bulkVerifyDto.notes,
            previousStatus,
            newStatus,
            bulkOperation: true,
          },
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          documentId,
          error: error.message || 'Unknown error',
        });
        this.logger.error(
          `Failed to verify document ${documentId} in bulk operation:`,
          error,
        );
      }
    }

    this.logger.log(
      `Bulk verification completed: ${results.success} successful, ${results.failed} failed`,
    );

    return results;
  }

  @Post(':id/revoke-verification')
  @Roles('admin')
  @ApiOperation({
    summary: 'Revoke document verification (Admin only)',
    description:
      'Reverts a verified document back to pending status. Only admins can perform this action.',
  })
  @ApiResponse({ status: 200, description: 'Verification revoked successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires Admin role' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async revokeVerification(
    @Param('id') documentId: string,
    @Body() revokeDto: RevokeVerificationDto,
    @Request() req: any,
  ) {
    try {
      const document = await this.documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }

      if (document.status !== 'approved') {
        throw new HttpException(
          'Can only revoke verification for approved documents',
          HttpStatus.BAD_REQUEST,
        );
      }

      const previousStatus = document.status;
      const previousReviewedBy = document.reviewedBy;
      const previousReviewedAt = document.reviewedAt;
      const previousReviewNotes = document.reviewNotes;

      // Revert to pending status
      document.status = 'pending';
      document.reviewedBy = null;
      document.reviewedAt = null;
      // Preserve review_notes for history

      const updatedDocument = await this.documentRepository.save(document);

      // Log audit event for revocation
      await this.auditService.log({
        actorUserId: req.user.sub,
        actorRole: req.user.roles?.[0] || 'admin',
        action: 'revoke_verification',
        entityType: 'Document',
        entityId: documentId,
        changes: {
          documentId,
          fileName: document.fileName,
          category: document.category,
          reason: revokeDto.reason,
          previousStatus,
          newStatus: 'pending',
          previousReviewedBy,
          previousReviewedAt,
          preservedReviewNotes: previousReviewNotes,
        },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      this.logger.log(
        `Verification revoked for document ${documentId} by admin ${req.user.sub}`,
      );

      return {
        id: updatedDocument.id,
        status: updatedDocument.status,
        reviewedBy: updatedDocument.reviewedBy,
        reviewedAt: updatedDocument.reviewedAt,
        reviewNotes: updatedDocument.reviewNotes,
      };
    } catch (error) {
      this.logger.error(`Failed to revoke verification for document ${documentId}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to revoke verification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/audit-history')
  @Roles('admin', 'hr')
  @ApiOperation({
    summary: 'Get verification audit history for a document (HR/Admin only)',
    description: 'Returns a timeline of all verification actions for a specific document',
  })
  @ApiResponse({ status: 200, description: 'Audit history retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires HR or Admin role' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentAuditHistory(@Param('id') documentId: string) {
    try {
      // Verify document exists
      const document = await this.documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }

      // Fetch audit logs for this document
      const auditLogs = await this.auditLogRepository.find({
        where: {
          entityType: 'Document',
          entityId: documentId,
        },
        order: {
          at: 'DESC',
        },
      });

      // Enrich audit logs with user information
      const enrichedLogs = await Promise.all(
        auditLogs.map(async (log) => {
          let actorName = 'Unknown User';
          let actorRole = log.actorRole;

          if (log.actorUserId) {
            const user = await this.userRepository.findOne({
              where: { id: log.actorUserId },
            });
            if (user) {
              actorName = `${user.firstName} ${user.lastName}`;
            }
          }

          return {
            id: log.id,
            action: log.action,
            actorUserId: log.actorUserId,
            actorName,
            actorRole,
            timestamp: log.at,
            notes: log.changes?.notes || null,
            previousStatus: log.changes?.previousStatus || null,
            newStatus: log.changes?.newStatus || null,
            ipAddress: log.ip || null,
          };
        }),
      );

      return enrichedLogs;
    } catch (error) {
      this.logger.error(`Failed to fetch audit history for document ${documentId}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch audit history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
