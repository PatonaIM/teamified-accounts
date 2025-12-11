import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordService } from './services/password.service';
import { JwtTokenService } from './services/jwt.service';
import { SessionService } from './services/session.service';
import { EmailVerificationService } from './services/email-verification.service';
import { SupabaseService } from './services/supabase.service';
import { SupabaseAuthService } from './services/supabase-auth.service';
import { SupabaseAuthController } from './controllers/supabase-auth.controller';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { LegacyInvitation } from '../invitations/entities/legacy-invitation.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { OrganizationMember } from '../organizations/entities/organization-member.entity';
import { UserEmail } from '../user-emails/entities/user-email.entity';
import { UserRolesModule } from '../user-roles/user-roles.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EmailModule } from '../email/email.module';
import { AuditModule } from '../audit/audit.module';
import { OAuthClientsModule } from '../oauth-clients/oauth-clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, LegacyInvitation, UserRole, Organization, OrganizationMember, UserEmail]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    forwardRef(() => AuditModule),
    forwardRef(() => UserRolesModule),
    forwardRef(() => OAuthClientsModule),
    ThrottlerModule,
  ],
  controllers: [AuthController, SupabaseAuthController],
  providers: [
    AuthService, 
    PasswordService, 
    JwtTokenService, 
    SessionService,
    EmailVerificationService,
    SupabaseService,
    SupabaseAuthService,
    JwtAuthGuard,
  ],
  exports: [
    AuthService, 
    PasswordService, 
    JwtTokenService, 
    SessionService,
    EmailVerificationService,
    SupabaseService,
    SupabaseAuthService,
    JwtAuthGuard,
    JwtModule, // Export JwtModule so other modules can inject JwtService
  ],
})
export class AuthModule {}