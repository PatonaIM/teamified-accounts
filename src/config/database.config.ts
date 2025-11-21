import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Document } from '../documents/entities/document.entity';
import { User } from '../auth/entities/user.entity';
import { EORProfile } from '../profiles/entities/eor-profile.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { Client } from '../clients/entities/client.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { EmploymentRecord } from '../employment-records/entities/employment-record.entity';
import { SalaryHistory } from '../salary-history/entities/salary-history.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { Session } from '../auth/entities/session.entity';
import { Timesheet } from '../timesheets/entities/timesheet.entity';
import { TimesheetApproval } from '../timesheets/entities/timesheet-approval.entity';
import { LeaveRequest } from '../leave/entities/leave-request.entity';
import { LeaveBalance } from '../leave/entities/leave-balance.entity';
import { LeaveApproval } from '../leave/entities/leave-approval.entity';
import { Country } from '../payroll/entities/country.entity';
import { Currency } from '../payroll/entities/currency.entity';
import { TaxYear } from '../payroll/entities/tax-year.entity';
import { RegionConfiguration } from '../payroll/entities/region-configuration.entity';
import { ExchangeRate } from '../payroll/entities/exchange-rate.entity';
import { PayrollPeriod } from '../payroll/entities/payroll-period.entity';
import { SalaryComponent } from '../payroll/entities/salary-component.entity';
import { StatutoryComponent } from '../payroll/entities/statutory-component.entity';
import { Payslip } from '../payroll/entities/payslip.entity';
import { PayrollProcessingLog } from '../payroll/entities/payroll-processing-log.entity';
import { PerformanceMetrics } from '../payroll/entities/performance-metrics.entity';
import { OnboardingDocumentRequirements } from '../documents/entities/onboarding-document-requirements.entity';
import { UserTheme } from '../themes/entities/user-theme.entity';
import { OAuthClient } from '../oauth-clients/entities/oauth-client.entity';
import { ApiKey } from '../api-keys/entities/api-key.entity';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const postgresUrl = configService.get('POSTGRES_URL') || configService.get('DATABASE_URL');
  const nodeEnv = configService.get('NODE_ENV');
  
  // If POSTGRES_URL/DATABASE_URL doesn't exist, build from individual env variables
  const config: TypeOrmModuleOptions = {
    type: 'postgres',
    ...(postgresUrl ? { url: postgresUrl } : {
      host: configService.get<string>('DATABASE_HOST', 'localhost'),
      port: parseInt(configService.get<string>('DATABASE_PORT', '5432'), 10),
      username: configService.get<string>('DATABASE_USER', 'postgres'),
      password: configService.get<string>('DATABASE_PASSWORD', 'password'),
      database: configService.get<string>('DATABASE_NAME', 'teamified_portal'),
    }),
    ssl: postgresUrl ? { rejectUnauthorized: false } : false,
    entities: [
    Document,
    User,
    EORProfile,
    AuditLog,
    Client,
    UserRole,
    EmploymentRecord,
    SalaryHistory,
    Invitation,
    Session,
    Timesheet,
    TimesheetApproval,
    LeaveRequest,
    LeaveBalance,
    LeaveApproval,
    Country,
    Currency,
    TaxYear,
    RegionConfiguration,
    ExchangeRate,
    PayrollPeriod,
    SalaryComponent,
    StatutoryComponent,
    Payslip,
    PayrollProcessingLog,
    PerformanceMetrics,
    OnboardingDocumentRequirements,
    UserTheme,
    OAuthClient,
    ApiKey,
  ],
  synchronize: false, // Use SQL scripts instead of migrations
  logging: configService.get('NODE_ENV') === 'development',
  extra: {
    connectionLimit: 5,  // Reduced for serverless
    acquireTimeoutMillis: 10000,  // Faster timeout for serverless
    timeout: 10000,  // Faster query timeout
    max: 5,  // Maximum pool size
    idleTimeoutMillis: 30000,  // Close idle connections faster
  },
  // Add connection lifecycle logging
  subscribers: [],
  migrations: [],
  logger: 'advanced-console',
  };
  
  return config;
};