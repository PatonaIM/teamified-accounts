import { Module } from '@nestjs/common';
import { SsoController } from './sso.controller';
import { SsoService } from './sso.service';
import { AuthCodeStorageService } from '../auth/services/auth-code-storage.service';
import { OAuthClientsModule } from '../oauth-clients/oauth-clients.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { UserRolesModule } from '../user-roles/user-roles.module';

@Module({
  imports: [
    OAuthClientsModule,
    AuthModule,
    UsersModule,
    UserRolesModule,
  ],
  controllers: [SsoController],
  providers: [SsoService, AuthCodeStorageService],
  exports: [SsoService],
})
export class SsoModule {}
