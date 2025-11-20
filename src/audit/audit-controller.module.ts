import { Module } from '@nestjs/common';
import { AuditController } from './controllers/audit.controller';
import { AuditModule } from './audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuditModule,
    AuthModule,
  ],
  controllers: [AuditController],
})
export class AuditControllerModule {}
