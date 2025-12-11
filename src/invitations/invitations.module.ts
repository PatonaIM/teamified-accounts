import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { Invitation } from './entities/invitation.entity';
import { OrganizationMember } from '../organizations/entities/organization-member.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { UserEmail } from '../user-emails/entities/user-email.entity';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation, OrganizationMember, Organization, User, UserRole, UserEmail]),
    AuditModule,
    EmailModule,
    ThrottlerModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}