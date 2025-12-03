import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAppPermission } from './entities/user-app-permission.entity';
import { UserAppPermissionsService } from './services/user-app-permissions.service';
import { UserAppPermissionsController } from './controllers/user-app-permissions.controller';
import { MyAppPermissionsController } from './controllers/my-app-permissions.controller';
import { OAuthClient } from '../oauth-clients/entities/oauth-client.entity';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAppPermission, OAuthClient, User, UserRole]),
    AuditModule,
    AuthModule,
  ],
  controllers: [MyAppPermissionsController, UserAppPermissionsController],
  providers: [UserAppPermissionsService],
  exports: [UserAppPermissionsService],
})
export class UserAppPermissionsModule {}
