import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TaxDocumentService } from '../services/tax-document.service';

/**
 * TaxDocumentController
 * Handles tax document upload and management
 */
@ApiTags('Tax Documents')
@Controller('v1/payroll/tax-documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TaxDocumentController {
  constructor(private readonly taxDocumentService: TaxDocumentService) {}

  /**
   * Upload tax document
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin', 'hr', 'eor', 'candidate')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload tax document',
    description: 'Upload tax document (TDS proof, tax forms, etc.)',
  })
  @ApiResponse({
    status: 201,
    description: 'Tax document uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadTaxDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req: any,
  ): Promise<any> {
    // TODO: Get eorProfileId from user profile
    const eorProfileId = req.user.eorProfileId || req.user.sub;

    const document = await this.taxDocumentService.uploadTaxDocument(
      eorProfileId,
      file.buffer,
      file.originalname,
      file.mimetype,
      {
        category: body.category || 'TAX_DOCUMENT',
        taxYear: body.taxYear || new Date().getFullYear().toString(),
        countryCode: body.countryCode || 'IN',
      },
    );

    return document;
  }

  /**
   * List tax documents for current user
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'eor', 'candidate')
  @ApiOperation({
    summary: 'List tax documents',
    description: 'Get list of tax documents for authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Tax documents retrieved successfully',
  })
  async listTaxDocuments(@Request() req: any): Promise<any[]> {
    const eorProfileId = req.user.eorProfileId || req.user.sub;
    return await this.taxDocumentService.getTaxDocuments(eorProfileId);
  }

  /**
   * Get single tax document
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'eor', 'candidate')
  @ApiOperation({
    summary: 'Get tax document',
    description: 'Get single tax document details',
  })
  @ApiParam({
    name: 'id',
    description: 'Tax document UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Tax document retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Tax document not found',
  })
  async getTaxDocument(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    const eorProfileId = req.user.eorProfileId || req.user.sub;
    return await this.taxDocumentService.getTaxDocument(id, eorProfileId);
  }

  /**
   * Update tax document status (Admin/HR only)
   */
  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr')
  @ApiOperation({
    summary: 'Update tax document status',
    description: 'Approve or reject tax document (Admin/HR only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Tax document UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Tax document status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Tax document not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'pending' | 'approved' | 'rejected'; reviewNotes?: string },
    @Request() req: any,
  ): Promise<any> {
    return await this.taxDocumentService.updateStatus(
      id,
      body.status,
      req.user.sub,
      body.reviewNotes,
    );
  }

  /**
   * Delete tax document
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'hr', 'eor', 'candidate')
  @ApiOperation({
    summary: 'Delete tax document',
    description: 'Delete tax document',
  })
  @ApiParam({
    name: 'id',
    description: 'Tax document UUID',
  })
  @ApiResponse({
    status: 204,
    description: 'Tax document deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Tax document not found',
  })
  async deleteTaxDocument(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    const eorProfileId = req.user.eorProfileId || req.user.sub;
    await this.taxDocumentService.deleteTaxDocument(id, eorProfileId);
  }

  /**
   * Get download URL for tax document
   */
  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'eor', 'candidate')
  @ApiOperation({
    summary: 'Get tax document download URL',
    description: 'Get signed download URL for tax document',
  })
  @ApiParam({
    name: 'id',
    description: 'Tax document UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Tax document not found',
  })
  async getDownloadUrl(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ downloadUrl: string }> {
    const eorProfileId = req.user.eorProfileId || req.user.sub;
    const downloadUrl = await this.taxDocumentService.getDownloadUrl(id, eorProfileId);
    return { downloadUrl };
  }

  /**
   * Get pending tax documents (Admin/HR only)
   */
  @Get('pending/list')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr')
  @ApiOperation({
    summary: 'Get pending tax documents',
    description: 'Get list of pending tax documents for review (Admin/HR only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending tax documents retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getPendingDocuments(): Promise<any[]> {
    return await this.taxDocumentService.getPendingDocuments();
  }
}

