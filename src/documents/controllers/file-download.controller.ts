import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { StorageService } from '../services/storage.service';
import { Document, DocumentType } from '../entities/document.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as path from 'path';

@ApiTags('files')
@Controller('v1/files')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
export class FileDownloadController {
  constructor(
    private readonly storageService: StorageService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  /**
   * Download file with secure token validation
   * GET /v1/files/download/:filePath
   */
  @Get('download/:filePath(*)')
  @ApiOperation({
    summary: 'Download file with secure token',
    description: 'Download a file using a secure token. The token must be valid and not expired.',
  })
  @ApiParam({
    name: 'filePath',
    description: 'Encoded file path in storage',
    example: 'cvs%2Fusers%2F123%2Fv1234567890-abc123.pdf',
  })
  @ApiQuery({
    name: 'token',
    description: 'Secure download token',
    example: 'a1b2c3d4e5f6...',
  })
  @ApiQuery({
    name: 'expires',
    description: 'Token expiration timestamp',
    example: '1640995200000',
  })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
    content: {
      'application/pdf': {
        schema: { type: 'string', format: 'binary' },
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        schema: { type: 'string', format: 'binary' },
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
  @ApiResponse({
    status: 404,
    description: 'Not Found - File not found or token invalid',
  })
  @ApiResponse({
    status: 410,
    description: 'Gone - Download token has expired',
  })
  async downloadFile(
    @Param('filePath') filePath: string,
    @Query('token') token: string,
    @Query('expires') expires: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Validate required parameters
      if (!token || !expires) {
        throw new HttpException('Missing required parameters', HttpStatus.BAD_REQUEST);
      }

      // Decode file path
      const decodedFilePath = decodeURIComponent(filePath);

      // Validate token expiration
      const expirationTime = parseInt(expires, 10);
      const now = Date.now();
      
      if (now > expirationTime) {
        throw new HttpException('Download token has expired', HttpStatus.GONE);
      }

      // Validate token
      const expectedToken = crypto.createHash('sha256')
        .update(`${decodedFilePath}-${expirationTime}-${process.env.JWT_SECRET || 'default-secret'}`)
        .digest('hex');

      if (token !== expectedToken) {
        throw new HttpException('Invalid download token', HttpStatus.UNAUTHORIZED);
      }

      // Check if file exists in storage
      const fileExists = await this.storageService.fileExists(decodedFilePath);
      if (!fileExists) {
        throw new NotFoundException('File not found');
      }

      // Get file from storage
      const fileBuffer = await this.storageService.readFileFromStorage(decodedFilePath);

      // Determine content type based on file extension
      const fileExtension = path.extname(decodedFilePath).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (fileExtension === '.pdf') {
        contentType = 'application/pdf';
      } else if (fileExtension === '.docx') {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (fileExtension === '.doc') {
        contentType = 'application/msword';
      }

      // Set response headers
      res.set({
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="${path.basename(decodedFilePath)}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });

      // Send file
      res.send(fileBuffer);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'File download failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
