import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserEmail } from './entities/user-email.entity';
import { User } from '../auth/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { UserEmailsService } from './user-emails.service';
import { UserEmailsController } from './user-emails.controller';
import { AdminUserEmailsController } from './admin-user-emails.controller';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { JwtOrServiceGuard } from '../common/guards/jwt-or-service.guard';
import { RolesOrServiceGuard } from '../common/guards/roles-or-service.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEmail, User, Organization]),
    ConfigModule,
    EmailModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [UserEmailsController, AdminUserEmailsController],
  providers: [UserEmailsService, JwtOrServiceGuard, RolesOrServiceGuard],
  exports: [UserEmailsService, TypeOrmModule],
})
export class UserEmailsModule {}
