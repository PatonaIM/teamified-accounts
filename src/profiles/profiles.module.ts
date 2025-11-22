import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EORProfile } from './entities/eor-profile.entity';
import { ProfileCompletionService } from './services/profile-completion.service';
import { CountryValidationService } from './services/country-validation.service';
import { AuditModule } from '../audit/audit.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EORProfile]),
    AuditModule,
    forwardRef(() => DocumentsModule),
  ],
  providers: [
    ProfileCompletionService,
    CountryValidationService,
  ],
  exports: [
    TypeOrmModule,
    ProfileCompletionService,
    CountryValidationService,
  ],
})
export class ProfilesModule {}