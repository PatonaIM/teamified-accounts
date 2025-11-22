import { Module, OnModuleInit, Logger, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { EmploymentRecordsModule } from '../employment-records/employment-records.module';
import { SalaryHistoryModule } from '../salary-history/salary-history.module';
import { AuditModule } from '../audit/audit.module';
import { TimesheetModule } from '../timesheets/timesheet.module';
import { LeaveModule } from '../leave/leave.module';

// Entities
import { Country } from './entities/country.entity';
import { Currency } from './entities/currency.entity';
import { TaxYear } from './entities/tax-year.entity';
import { RegionConfiguration } from './entities/region-configuration.entity';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { PayrollPeriod } from './entities/payroll-period.entity';
import { PayrollProcessingLog } from './entities/payroll-processing-log.entity';
import { SalaryComponent } from './entities/salary-component.entity';
import { StatutoryComponent } from './entities/statutory-component.entity';
import { Payslip } from './entities/payslip.entity';
import { PerformanceMetrics } from './entities/performance-metrics.entity';

// Services
import { CountryService } from './services/country.service';
import { CurrencyService } from './services/currency.service';
import { TaxYearService } from './services/tax-year.service';
import { RegionConfigurationService } from './services/region-configuration.service';
import { ExchangeRateService } from './services/exchange-rate.service';
import { PayrollPeriodService } from './services/payroll-period.service';
import { PayrollProcessingLogService } from './services/payroll-processing-log.service';
import { SalaryComponentService } from './services/salary-component.service';
import { StatutoryComponentService } from './services/statutory-component.service';
import { PayrollCalculationService } from './services/payroll-calculation.service';
import { PayslipStorageService } from './services/payslip-storage.service';
import { PayslipPdfService } from './services/payslip-pdf.service';
import { PayslipNotificationService } from './services/payslip-notification.service';
import { ContributionTrackingService } from './services/contribution-tracking.service';
import { PayrollProcessingService } from './services/payroll-processing.service';
import { BulkOperationsService } from './services/bulk-operations.service';
import { PerformanceMetricsService } from './services/performance-metrics.service';
import { IndiaCalculationFactory } from './services/regions/india-calculation.factory';
import { PhilippinesCalculationFactory } from './services/regions/philippines-calculation.factory';

// Controllers
import { CountryController } from './controllers/country.controller';
import { CurrencyController } from './controllers/currency.controller';
import { TaxYearController } from './controllers/tax-year.controller';
import { RegionConfigurationController } from './controllers/region-configuration.controller';
import { ExchangeRateController } from './controllers/exchange-rate.controller';
import { PayrollPeriodController } from './controllers/payroll-period.controller';
import { PayrollProcessingLogController } from './controllers/payroll-processing-log.controller';
import { SalaryComponentController } from './controllers/salary-component.controller';
import { StatutoryComponentController } from './controllers/statutory-component.controller';
import { PayrollCalculationController } from './controllers/payroll-calculation.controller';
import { PayslipController } from './controllers/payslip.controller';
import { ContributionTrackingController } from './controllers/contribution-tracking.controller';
import { PayrollAdministrationController } from './controllers/payroll-administration.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Country,
      Currency,
      TaxYear,
      RegionConfiguration,
      ExchangeRate,
      PayrollPeriod,
      PayrollProcessingLog,
      SalaryComponent,
      StatutoryComponent,
      Payslip,
      PerformanceMetrics,
    ]),
    forwardRef(() => AuthModule),
    UsersModule,
    forwardRef(() => EmploymentRecordsModule),
    SalaryHistoryModule,
    AuditModule,
    forwardRef(() => TimesheetModule),
    forwardRef(() => LeaveModule),
  ],
  controllers: [
    CountryController,
    CurrencyController,
    TaxYearController,
    RegionConfigurationController,
    ExchangeRateController,
    PayrollPeriodController,
    PayrollProcessingLogController,
    SalaryComponentController,
    StatutoryComponentController,
    PayrollCalculationController,
    PayslipController,
    ContributionTrackingController,
    PayrollAdministrationController,
  ],
  providers: [
    CountryService,
    CurrencyService,
    TaxYearService,
    RegionConfigurationService,
    ExchangeRateService,
    PayrollPeriodService,
    PayrollProcessingLogService,
    SalaryComponentService,
    StatutoryComponentService,
    PayrollCalculationService,
    PayslipStorageService,
    PayslipPdfService,
    PayslipNotificationService,
    ContributionTrackingService,
    PayrollProcessingService,
    BulkOperationsService,
    PerformanceMetricsService,
    IndiaCalculationFactory,
    PhilippinesCalculationFactory,
  ],
  exports: [
    CountryService,
    CurrencyService,
    TaxYearService,
    RegionConfigurationService,
    ExchangeRateService,
    PayrollPeriodService,
    PayrollProcessingLogService,
    SalaryComponentService,
    StatutoryComponentService,
    PayrollCalculationService,
    PayslipStorageService,
    PayslipPdfService,
    PayslipNotificationService,
    ContributionTrackingService,
    PayrollProcessingService,
    BulkOperationsService,
    PerformanceMetricsService,
  ],
})
export class PayrollModule implements OnModuleInit {
  private readonly logger = new Logger(PayrollModule.name);

  constructor(
    private readonly payrollCalculationService: PayrollCalculationService,
    private readonly indiaCalculationFactory: IndiaCalculationFactory,
    private readonly philippinesCalculationFactory: PhilippinesCalculationFactory,
  ) {}

  onModuleInit() {
    // Register region-specific calculation factories
    this.logger.log('Registering region-specific payroll calculation factories...');
    
    this.payrollCalculationService.registerRegionFactory(
      'IN',
      this.indiaCalculationFactory,
    );
    this.logger.log('✅ India calculation factory registered');
    
    this.payrollCalculationService.registerRegionFactory(
      'PH',
      this.philippinesCalculationFactory,
    );
    this.logger.log('✅ Philippines calculation factory registered');
  }
}

