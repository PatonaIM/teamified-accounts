import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { OnboardingDocumentRequirements } from './entities/onboarding-document-requirements.entity';
import { EmploymentRecord } from '../employment-records/entities/employment-record.entity';
import { EORProfile } from '../profiles/entities/eor-profile.entity';
import { User } from '../auth/entities/user.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { CVService } from './services/cv.service';
import { StorageService } from './services/storage.service';
import { TaxDocumentService } from './services/tax-document.service';
import { DocumentService } from './services/document.service';
import { DocumentRequirementsService } from './services/document-requirements.service';
import { CVController } from './controllers/cv.controller';
import { TaxDocumentController } from './controllers/tax-document.controller';
import { FileDownloadController } from './controllers/file-download.controller';
import { DocumentController } from './controllers/document.controller';
import { DocumentVerificationController } from './controllers/document-verification.controller';
import { DocumentRequirementsController } from './controllers/document-requirements.controller';
import { AuditModule } from '../audit/audit.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { AuthModule } from '../auth/auth.module';
import { PayrollModule } from '../payroll/payroll.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, OnboardingDocumentRequirements, EmploymentRecord, EORProfile, User, AuditLog]),
    AuditModule,
    forwardRef(() => ProfilesModule),
    forwardRef(() => PayrollModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [
    CVController,
    TaxDocumentController,
    FileDownloadController,
    DocumentController,
    DocumentVerificationController,
    DocumentRequirementsController,
  ],
  providers: [CVService, StorageService, TaxDocumentService, DocumentService, DocumentRequirementsService],
  exports: [CVService, TaxDocumentService, StorageService, DocumentService, DocumentRequirementsService],
})
export class DocumentsModule {}