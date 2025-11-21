import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  HttpStatus,
  HttpException,
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
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CVService, CVOwner, UserType } from '../services/cv.service';
import { UploadCVResponseDto } from '../dto/upload-cv-response.dto';
import { CVListResponseDto } from '../dto/cv-list-response.dto';
import { DownloadUrlResponseDto } from '../dto/download-url-response.dto';
import { User } from '../../auth/entities/user.entity';
import { ErrorResponseDto, ValidationErrorResponseDto, BusinessErrorResponseDto } from '../../common/dto/error-response.dto';
import { CreatedResponseDto, ApiResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('documents')
@Controller('v1/users/me/profile/cv')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
export class CVController {
  constructor(private readonly cvService: CVService) {}

  /**
   * Helper method to determine user type and create CVOwner object
   */
  private getCVOwner(user: any): CVOwner {
    // Use sub (from JWT payload) if id is not available
    const userId = user.id || user.sub;
    
    if (user.eorProfile?.id) {
      return {
        eorProfileId: user.eorProfile.id,
        userType: 'eor',
      };
    }
    
    return {
      userId: userId,
      userType: 'candidate',
    };
  }

  /**
   * Upload a new CV version
   * POST /v1/users/me/profile/cv
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a new CV version',
    description: 'Upload a new CV file for the authenticated user. The file will be stored securely and versioned automatically.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CV file upload',
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CV file (PDF, DOC, DOCX) - Max size: 10MB',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'CV uploaded successfully',
    type: CreatedResponseDto<UploadCVResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file or validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Email not verified',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 413,
    description: 'Payload Too Large - File size exceeds limit',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 415,
    description: 'Unsupported Media Type - Invalid file format',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Upload failed',
    type: ErrorResponseDto,
  })
  async uploadCV(
    @CurrentUser() user: any,  // JWT payload with sub field
    @UploadedFile() file: any,
  ): Promise<UploadCVResponseDto> {
    try {
      // Determine user type (candidate or EOR) - no longer requires EOR profile
      const owner = this.getCVOwner(user);

      const result = await this.cvService.uploadCV(
        owner,
        file,
        user.id || user.sub,  // Use sub (from JWT) as fallback
        owner.userType === 'eor' ? 'EOR' : 'candidate',
      );

      return {
        id: result.id,
        versionId: result.versionId,
        fileName: result.fileName,
        isCurrent: result.isCurrent,
        uploadedAt: result.uploadedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          type: 'https://teamified.com/problems/upload-failed',
          title: 'CV Upload Failed',
          status: HttpStatus.BAD_REQUEST,
          detail: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * List all CV versions
   * GET /v1/users/me/profile/cv
   */
  @Get()
  @ApiOperation({
    summary: 'List all CV versions',
    description: 'Retrieve a list of all CV versions for the authenticated user, ordered by upload date (newest first).',
  })
  @ApiResponse({
    status: 200,
    description: 'CV list retrieved successfully',
    type: ApiResponseDto<CVListResponseDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Email not verified',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Failed to retrieve CV list',
    type: ErrorResponseDto,
  })
  async listCVs(@CurrentUser() user: User): Promise<CVListResponseDto> {
    try {
      // Determine user type (candidate or EOR) - no longer requires EOR profile
      const owner = this.getCVOwner(user);

      const cvs = await this.cvService.listCVs(owner);

      return { 
        cvs: cvs.map(cv => ({
          ...cv,
          uploadedAt: cv.uploadedAt.toISOString(),
        }))
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          type: 'https://teamified.com/problems/list-failed',
          title: 'CV List Failed',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          detail: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get download URL for specific CV version
   * GET /v1/users/me/profile/cv/:versionId
   */
  @Get(':versionId')
  @ApiOperation({
    summary: 'Get download URL for CV version',
    description: 'Generate a secure, time-limited download URL for a specific CV version. The URL expires after 1 hour for security.',
  })
  @ApiParam({
    name: 'versionId',
    description: 'Unique identifier for the CV version',
    example: 'cv_123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated successfully',
    type: ApiResponseDto<DownloadUrlResponseDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Email not verified',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - CV version not found',
    type: BusinessErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Failed to generate download URL',
    type: ErrorResponseDto,
  })
  async getDownloadUrl(
    @CurrentUser() user: User,
    @Param('versionId') versionId: string,
  ): Promise<DownloadUrlResponseDto> {
    try {
      // Determine user type (candidate or EOR) - no longer requires EOR profile
      const owner = this.getCVOwner(user);

      const result = await this.cvService.getDownloadUrl(
        owner,
        versionId,
        user.id,
        owner.userType === 'eor' ? 'EOR' : 'candidate',
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
   * Delete a CV version
   * DELETE /v1/users/me/profile/cv/:versionId
   */
  @Delete(':versionId')
  @ApiOperation({
    summary: 'Delete a CV version',
    description: 'Delete a specific CV version. This will remove the file from storage and the database record.',
  })
  @ApiParam({
    name: 'versionId',
    description: 'Unique identifier for the CV version to delete',
    example: 'cv_123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'CV deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'CV deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Email not verified',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - CV version not found',
    type: BusinessErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Failed to delete CV',
    type: ErrorResponseDto,
  })
  async deleteCV(
    @CurrentUser() user: any,  // JWT payload with sub field
    @Param('versionId') versionId: string,
  ): Promise<{ message: string }> {
    try {
      // Determine user type (candidate or EOR)
      const owner = this.getCVOwner(user);

      await this.cvService.deleteCV(
        owner,
        versionId,
        user.id || user.sub,
        owner.userType === 'eor' ? 'EOR' : 'candidate',
      );

      return {
        message: 'CV deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          type: 'https://teamified.com/problems/delete-failed',
          title: 'CV Deletion Failed',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          detail: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}