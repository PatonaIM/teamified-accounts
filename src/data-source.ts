import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Document } from './documents/entities/document.entity';
import { User } from './auth/entities/user.entity';
import { EORProfile } from './profiles/entities/eor-profile.entity';
import { AuditLog } from './audit/entities/audit-log.entity';
import { Client } from './clients/entities/client.entity';
import { UserRole } from './user-roles/entities/user-role.entity';
import { EmploymentRecord } from './employment-records/entities/employment-record.entity';
import { SalaryHistory } from './salary-history/entities/salary-history.entity';
import { Invitation } from './invitations/entities/invitation.entity';
import { Session } from './auth/entities/session.entity';
import { Timesheet } from './timesheets/entities/timesheet.entity';
import { TimesheetApproval } from './timesheets/entities/timesheet-approval.entity';
import { LeaveRequest } from './leave/entities/leave-request.entity';
import { LeaveBalance } from './leave/entities/leave-balance.entity';
import { LeaveApproval } from './leave/entities/leave-approval.entity';
import { Country } from './payroll/entities/country.entity';
import { Currency } from './payroll/entities/currency.entity';
import { TaxYear } from './payroll/entities/tax-year.entity';
import { RegionConfiguration } from './payroll/entities/region-configuration.entity';
import { ExchangeRate } from './payroll/entities/exchange-rate.entity';
import { PayrollPeriod } from './payroll/entities/payroll-period.entity';
import { SalaryComponent } from './payroll/entities/salary-component.entity';
import { StatutoryComponent } from './payroll/entities/statutory-component.entity';
import { Payslip } from './payroll/entities/payslip.entity';
import { PayrollProcessingLog } from './payroll/entities/payroll-processing-log.entity';
import { PerformanceMetrics } from './payroll/entities/performance-metrics.entity';
import { OnboardingDocumentRequirements } from './documents/entities/onboarding-document-requirements.entity';
import { ApiKey } from './api-keys/entities/api-key.entity';
import { Organization } from './organizations/entities/organization.entity';
import { OrganizationMember } from './organizations/entities/organization-member.entity';

// Load environment variables
config();

const postgresUrl = process.env.POSTGRES_URL;
const nodeEnv = process.env.NODE_ENV;

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(postgresUrl ? { url: postgresUrl } : {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'teamified_portal',
  }),
  ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
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
    ApiKey,
    Organization,
    OrganizationMember,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: nodeEnv === 'development',
});
