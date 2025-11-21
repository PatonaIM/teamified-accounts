import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeysService } from './services/api-keys.service';
import { ApiKeysController } from './controllers/api-keys.controller';
import { ApiKey } from './entities/api-key.entity';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    AuthModule, // Required for JwtAuthGuard
    AuditModule, // Required for audit logging
  ],
  controllers: [ApiKeysController],
  providers: [ApiKeysService],
  exports: [ApiKeysService], // Export for use in guards
})
export class ApiKeysModule {}
