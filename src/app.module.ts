import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { databaseConfig } from './config/database.config';
import { InvitationsModule } from './invitations/invitations.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { EmailModule } from './email/email.module';
import { ProfilesModule } from './profiles/profiles.module';
import { DocumentsModule } from './documents/documents.module';
import { HealthModule } from './health/health.module';
import { EmploymentRecordsModule } from './employment-records/employment-records.module';
import { SalaryHistoryModule } from './salary-history/salary-history.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { PayrollModule } from './payroll/payroll.module';
import { TimesheetModule } from './timesheets/timesheet.module';
import { LeaveModule } from './leave/leave.module';
import { WorkableModule } from './workable/workable.module';
import { SeedModule } from './seed/seed.module';
import { AppController } from './app.controller';
import { ThemesModule } from './themes/themes.module';
import { QueueModule } from './queue/queue.module';
import { OAuthClientsModule } from './oauth-clients/oauth-clients.module';
import { SsoModule } from './sso/sso.module';
import { ApiKeysModule } from './api-keys/api-keys.module';

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
    InvitationsModule,
    AuthModule,
    AuditModule,
    EmailModule,
    ProfilesModule,
    DocumentsModule,
    HealthModule,
    EmploymentRecordsModule,
    SalaryHistoryModule,
    UserRolesModule,
    UsersModule,
    ClientsModule,
    PayrollModule,
    TimesheetModule,
    LeaveModule,
    WorkableModule,
    SeedModule,
    ThemesModule,
    OAuthClientsModule,
    SsoModule,
    ApiKeysModule,
  ],
  controllers: [AppController],
})
export class AppModule {}