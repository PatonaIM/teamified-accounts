import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmploymentRecord } from './entities/employment-record.entity';
import { User } from '../auth/entities/user.entity';
import { Document } from '../documents/entities/document.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { EmploymentRecordService } from './services/employment-record.service';
import { HROnboardingService } from './services/hr-onboarding.service';
import { EmploymentRecordController } from './controllers/employment-record.controller';
import { HROnboardingController } from './controllers/hr-onboarding.controller';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmploymentRecord, User, Document, UserRole]),
    AuditModule,
    forwardRef(() => AuthModule),
    forwardRef(() => DocumentsModule),
  ],
  controllers: [EmploymentRecordController, HROnboardingController],
  providers: [EmploymentRecordService, HROnboardingService],
  exports: [EmploymentRecordService, HROnboardingService, TypeOrmModule],
})
export class EmploymentRecordsModule {}
