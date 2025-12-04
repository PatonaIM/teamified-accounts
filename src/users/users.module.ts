import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { BlobStorageModule } from '../blob-storage/blob-storage.module';
import { EmailModule } from '../email/email.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Invitation]),
    forwardRef(() => AuthModule),
    AuditModule,
    BlobStorageModule,
    EmailModule,
    forwardRef(() => OrganizationsModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
