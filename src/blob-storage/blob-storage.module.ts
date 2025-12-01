import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectStorageService } from './object-storage.service';
import { AzureBlobStorageService } from './azure-blob-storage.service';
import { BlobStorageController } from './blob-storage.controller';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
  ],
  providers: [ObjectStorageService, AzureBlobStorageService],
  controllers: [BlobStorageController],
  exports: [ObjectStorageService, AzureBlobStorageService],
})
export class BlobStorageModule {}
