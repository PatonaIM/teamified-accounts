import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from './entities/organization-member.entity';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsS2SController } from './organizations-s2s.controller';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { BlobStorageModule } from '../blob-storage/blob-storage.module';
import { UserEmailsModule } from '../user-emails/user-emails.module';

/**
 * Organizations Module
 * 
 * Phase 2: Organization Management APIs (COMPLETE)
 * 
 * This module provides comprehensive organization and membership management:
 * - Organization CRUD operations (create, read, update, delete)
 * - Member management (add, remove, update roles)
 * - Role-based access control integration
 * - Full audit logging for all operations
 * - Company logo upload and management
 * 
 * Authorization:
 * - super_admin: Full access to all organization operations
 * - internal_*: Read access to organizations for operational needs
 * - client_admin: Can manage their own organization and members
 * - client_hr: Can view members in their organization
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, OrganizationMember, User, UserRole, Invitation]),
    AuditModule,
    AuthModule,
    EmailModule,
    BlobStorageModule,
    forwardRef(() => UserEmailsModule),
  ],
  controllers: [OrganizationsController, OrganizationsS2SController],
  providers: [OrganizationsService],
  exports: [OrganizationsService, TypeOrmModule],
})
export class OrganizationsModule {}
