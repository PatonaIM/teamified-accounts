import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ObjectStorageService, ObjectNotFoundError } from './object-storage.service';
import { ObjectPermission } from './object-acl.service';

@Controller('objects')
export class BlobStorageController {
  constructor(private readonly objectStorageService: ObjectStorageService) {}

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
