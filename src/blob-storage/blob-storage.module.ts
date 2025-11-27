import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ObjectStorageService } from './object-storage.service';
import { AzureBlobStorageService } from './azure-blob-storage.service';
import { BlobStorageController } from './blob-storage.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
  ],
  providers: [ObjectStorageService, AzureBlobStorageService],
  controllers: [BlobStorageController],
  exports: [ObjectStorageService, AzureBlobStorageService],
})
export class BlobStorageModule {}
