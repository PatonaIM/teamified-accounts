import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PlatformAnalyticsController } from './platform-analytics.controller';
import { PlatformAnalyticsService } from './platform-analytics.service';
import { AIAnalyticsController } from './ai-analytics.controller';
import { AIAnalyticsService } from './ai-analytics.service';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { OrganizationMember } from '../organizations/entities/organization-member.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { UserOAuthLogin } from '../sso/entities/user-oauth-login.entity';
import { UserAppActivity } from '../sso/entities/user-app-activity.entity';
import { OAuthClient } from '../oauth-clients/entities/oauth-client.entity';
import { Session } from '../auth/entities/session.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      OrganizationMember,
      Organization,
      UserOAuthLogin,
      UserAppActivity,
      OAuthClient,
      Session,
      AuditLog,
      Invitation,
    ]),
    forwardRef(() => AuthModule),
    ConfigModule,
  ],
  controllers: [AnalyticsController, PlatformAnalyticsController, AIAnalyticsController],
  providers: [AnalyticsService, PlatformAnalyticsService, AIAnalyticsService],
  exports: [AnalyticsService, PlatformAnalyticsService, AIAnalyticsService],
})
export class AnalyticsModule {}
