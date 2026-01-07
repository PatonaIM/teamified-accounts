import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SsoController } from './sso.controller';
import { SsoService } from './sso.service';
import { MarketingRedirectService } from './marketing-redirect.service';
import { AuthCodeStorageService } from '../auth/services/auth-code-storage.service';
import { OAuthClientsModule } from '../oauth-clients/oauth-clients.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { UserRolesModule } from '../user-roles/user-roles.module';
import { UserOAuthLogin } from './entities/user-oauth-login.entity';
import { UserAppActivity } from './entities/user-app-activity.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOAuthLogin, UserAppActivity, User]),
    OAuthClientsModule,
    AuthModule,
    UsersModule,
    UserRolesModule,
  ],
  controllers: [SsoController],
  providers: [SsoService, MarketingRedirectService, AuthCodeStorageService],
  exports: [SsoService, MarketingRedirectService],
})
export class SsoModule {}
