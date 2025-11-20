import { Module, forwardRef } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';
import { BlobStorageController } from './blob-storage.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [ObjectStorageService],
  controllers: [BlobStorageController],
  exports: [ObjectStorageService],
})
export class BlobStorageModule {}
