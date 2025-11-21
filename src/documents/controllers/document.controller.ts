import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpStatus,
  HttpException,
  Query,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { DocumentService } from '../services/document.service';
import { DocumentType } from '../entities/document.entity';

@ApiTags('documents')
@Controller('v1/documents')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard, RolesGuard)
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  /**
   * Upload a new document
   * POST /v1/documents
   */
  @Post()
  @Roles('admin', 'hr', 'candidate', 'eor')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a new document',
    description: 'Upload a general document (HR document, policy, identity, employment, education, etc.). Supports PDF, DOC, DOCX, TXT, JPG, PNG files up to 10MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document file upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file - Max size: 10MB',
        },
        category: {
          type: 'string',
          description: 'Document category for classification (cv, identity, employment, education)',
          example: 'identity',
        },
        description: {
          type: 'string',
          description: 'Document description (optional)',
          example: 'Passport copy',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        fileName: { type: 'string', example: 'employee-handbook.pdf' },
        fileSize: { type: 'number', example: 1024000 },
        uploadedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file or validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Email not verified',
  })
  async uploadDocument(
    @CurrentUser() user: any,
    @UploadedFile() file: any,
    @Body() body: { category?: string; description?: string },
  ) {
    try {
      // Map category to document type
      // CVs should use DocumentType.CV for compatibility with CV Management page
      // Other categories use DocumentType.HR_DOCUMENT
      const documentType = body?.category === 'cv' 
        ? DocumentType.CV 
        : DocumentType.HR_DOCUMENT;

      const result = await this.documentService.uploadDocument(
        user.id || user.sub,
        file,
        documentType,
        {
          category: body?.category,
          description: body?.description,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          type: 'https://teamified.com/problems/upload-failed',
          title: 'Document Upload Failed',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          detail: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List all documents
   * GET /v1/documents
   */
  @Get()
  @Roles('admin', 'hr', 'candidate', 'eor')
  @ApiOperation({
    summary: 'List all documents',
    description: 'Retrieve a list of all documents for the authenticated user, ordered by upload date (newest first).',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: DocumentType,
    description: 'Filter by document type',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by document category (cv, identity, employment, education)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of documents retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        documents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              fileName: { type: 'string' },
              fileSize: { type: 'number' },
              contentType: { type: 'string' },
              uploadedAt: { type: 'string', format: 'date-time' },
              category: { type: 'string' },
              status: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Email not verified',
  })
  async listDocuments(
    @CurrentUser() user: any,
    @Query('type') type?: DocumentType,
    @Query('category') category?: string,
  ) {
    try {
      const documents = await this.documentService.listDocuments(
        user.id || user.sub,
        type,
        category,
      );

      return { documents };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          type: 'https://teamified.com/problems/list-failed',
          title: 'Document List Failed',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          detail: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get download URL for a document
   * GET /v1/documents/:id/download
   * Admin and HR users can access any document, other users can only access their own documents
   */
  @Get(':id/download')
  @ApiOperation({
    summary: 'Get download URL for document',
    description: 'Generate a secure, time-limited download URL for a specific document. The URL expires after 1 hour for security. Admin and HR users can access any document.',
  })
  @ApiParam({
    name: 'id',
    description: 'Document ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Document not found',
  })
  async getDownloadUrl(
    @CurrentUser() user: any,
    @Param('id') documentId: string,
  ) {
    try {
      // Admin and HR users can access any document (pass null to skip userId check)
      // Other users can only access their own documents
      const userRoles = user.roles || [];
      const isAdminOrHR = userRoles.includes('admin') || userRoles.includes('hr');
      const userId = isAdminOrHR ? null : (user.id || user.sub);

      const result = await this.documentService.getDownloadUrl(
        userId,
        documentId,
      );

      return {
        downloadUrl: result.downloadUrl,
        expiresAt: result.expiresAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          type: 'https://teamified.com/problems/download-failed',
          title: 'Download URL Generation Failed',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          detail: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all versions of a document
   * GET /v1/documents/:id/versions
   */
  @Get(':id/versions')
  @Roles('admin', 'hr', 'candidate', 'eor')
  @ApiOperation({
    summary: 'Get document versions',
    description: 'Retrieve all versions of a document (by fileName and category), ordered by upload date (newest first).',
  })
  @ApiParam({
    name: 'id',
    description: 'Document ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Document versions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        versions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              fileName: { type: 'string' },
              fileSize: { type: 'number' },
              contentType: { type: 'string' },
              uploadedAt: { type: 'string', format: 'date-time' },
              uploadedBy: { type: 'string' },
              uploadedByRole: { type: 'string' },
              status: { type: 'string' },
              isCurrent: { type: 'boolean' },
              reviewNotes: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Document not found',
  })
  async getDocumentVersions(
    @CurrentUser() user: any,
    @Param('id') documentId: string,
  ) {
    try {
      const versions = await this.documentService.getDocumentVersions(
        user.id || user.sub,
        documentId,
      );

      return { versions };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          type: 'https://teamified.com/problems/versions-failed',
          title: 'Document Versions Retrieval Failed',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          detail: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a document
   * DELETE /v1/documents/:id
   */
  @Delete(':id')
  @Roles('admin', 'hr', 'candidate', 'eor')
  @ApiOperation({
    summary: 'Delete a document',
    description: 'Delete a specific document. This will remove the file from storage and the database record.',
  })
  @ApiParam({
    name: 'id',
    description: 'Document ID to delete',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Document deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Document not found',
  })
  async deleteDocument(
    @CurrentUser() user: any,
    @Param('id') documentId: string,
  ) {
    try {
      await this.documentService.deleteDocument(
        user.id || user.sub,
        documentId,
      );

      return {
        message: 'Document deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          type: 'https://teamified.com/problems/delete-failed',
          title: 'Document Deletion Failed',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          detail: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

