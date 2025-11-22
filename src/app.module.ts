import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { AuditControllerModule } from './audit/audit-controller.module';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { UsersModule } from './users/users.module';
import { SeedModule } from './seed/seed.module';
import { AppController } from './app.controller';
import { QueueModule } from './queue/queue.module';
import { ClientsModule } from './clients/clients.module';
import { OAuthClientsModule } from './oauth-clients/oauth-clients.module';
import { SsoModule } from './sso/sso.module';
import { BlobStorageModule } from './blob-storage/blob-storage.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { InvitationsModule } from './invitations/invitations.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UserAppPermissionsModule } from './user-app-permissions/user-app-permissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000,
          limit: 3,
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 20
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 100
        }
      ],
    }),
    QueueModule,
    AuthModule,
    AuditModule,
    AuditControllerModule,
    EmailModule,
    HealthModule,
    UserRolesModule,
    UsersModule,
    SeedModule,
    ClientsModule,
    OAuthClientsModule,
    SsoModule,
    BlobStorageModule,
    OrganizationsModule, // Phase 2: Organization Management APIs
    InvitationsModule, // Phase 3: New Invitation Flow
    AnalyticsModule, // Analytics API for User Management
    UserAppPermissionsModule, // App Permissions Management
  ],
  controllers: [AppController],
})
export class AppModule {}