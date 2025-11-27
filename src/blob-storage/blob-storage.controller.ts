import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  UseGuards,
  Request,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ObjectStorageService, ObjectNotFoundError } from './object-storage.service';
import { AzureBlobStorageService } from './azure-blob-storage.service';
import { ObjectPermission } from './object-acl.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Storage')
@Controller('objects')
export class BlobStorageController {
  constructor(
    private readonly objectStorageService: ObjectStorageService,
    private readonly azureBlobStorageService: AzureBlobStorageService,
  ) {}

  @Get('azure/:blobPath(*)')
  @ApiOperation({ summary: 'Proxy Azure Blob Storage images (public access)' })
  async proxyAzureBlob(
    @Param('blobPath') blobPath: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.azureBlobStorageService.downloadBlob(blobPath);
      
      if (!result) {
        return res.status(404).json({ message: 'Image not found' });
      }

      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(result.buffer);
    } catch (error) {
      console.error('Error proxying Azure blob:', error);
      return res.status(500).json({ message: 'Failed to load image' });
    }
  }

  @Get('storage/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check Azure Blob Storage configuration status' })
  @ApiBearerAuth()
  async getStorageStatus() {
    return {
      azureBlobStorage: {
        configured: this.azureBlobStorageService.isConfigured(),
        containerUrl: 'https://tmfprdfilestorage.blob.core.windows.net/teamified-accounts',
      },
    };
  }

  @Post('users/:userId/profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload user profile picture to Azure Blob Storage' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadUserProfilePicture(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.azureBlobStorageService.uploadUserProfilePicture(
      userId,
      file.buffer,
      file.originalname,
    );

    return {
      success: true,
      url: result.url,
      path: result.path,
    };
  }

  @Post('organizations/:organizationId/logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload organization logo to Azure Blob Storage' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadOrganizationLogo(
    @Param('organizationId') organizationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.azureBlobStorageService.uploadOrganizationLogo(
      organizationId,
      file.buffer,
      file.originalname,
    );

    return {
      success: true,
      url: result.url,
      path: result.path,
    };
  }

  @Get(':objectPath(*)')
  @UseGuards(JwtAuthGuard)
  async getObject(
    @Param('objectPath') objectPath: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    const fullPath = `/objects/${objectPath}`;

    try {
      const objectFile = await this.objectStorageService.getObjectEntityFile(fullPath);
      const canAccess = await this.objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });

      if (!canAccess) {
        throw new UnauthorizedException('Access denied');
      }

      await this.objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error('Error checking object access:', error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      if (error instanceof UnauthorizedException) {
        return res.sendStatus(401);
      }
      return res.sendStatus(500);
    }
  }
}
