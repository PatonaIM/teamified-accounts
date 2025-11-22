import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CalculatePayrollDto,
  BulkCalculatePayrollDto,
  PayrollCalculationResponse,
  BulkPayrollCalculationResponse,
  PayrollCalculationResult,
} from '../dto/payroll-calculation.dto';
import {
  RegionCalculationFactory,
  PayrollCalculationInput,
} from './region-calculation.factory';
import { CountryService } from './country.service';
import { CurrencyService } from './currency.service';
import { PayrollPeriodService } from './payroll-period.service';
import { SalaryComponentService } from './salary-component.service';
import { StatutoryComponentService } from './statutory-component.service';
import { Country } from '../entities/country.entity';
import { UserService } from '../../users/services/user.service';
import { EmploymentRecordService } from '../../employment-records/services/employment-record.service';
import { SalaryHistoryService } from '../../salary-history/services/salary-history.service';
import { AuditService } from '../../audit/audit.service';

/**
 * Main payroll calculation service
 * Orchestrates payroll calculations across different regions
 * 
 * Performance Features:
 * - In-memory caching for countries, salary components, statutory components
 * - Parallel processing for bulk calculations
 * - Batch database queries
 * - TTL-based cache invalidation (5 minutes)
 */
@Injectable()
export class PayrollCalculationService {
  private readonly logger = new Logger(PayrollCalculationService.name);
  private regionFactories: Map<string, RegionCalculationFactory> = new Map();
  
  // Performance: In-memory caches with TTL
  private countryCache: Map<string, { data: any; timestamp: number }> = new Map();
  private salaryComponentsCache: Map<string, { data: any; timestamp: number }> = new Map();
  private statutoryComponentsCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly countryService: CountryService,
    private readonly currencyService: CurrencyService,
    private readonly payrollPeriodService: PayrollPeriodService,
    private readonly salaryComponentService: SalaryComponentService,
    private readonly statutoryComponentService: StatutoryComponentService,
    private readonly userService: UserService,
    private readonly employmentRecordService: EmploymentRecordService,
    private readonly salaryHistoryService: SalaryHistoryService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Register a region-specific calculation factory
   */
  registerRegionFactory(
    countryCode: string,
    factory: RegionCalculationFactory,
  ): void {
    this.logger.log(
      `Registering calculation factory for region: ${countryCode}`,
    );
    this.regionFactories.set(countryCode.toUpperCase(), factory);
  }

  /**
   * Cache helper: Check if cached data is still valid
   */
  private isCacheValid(cacheEntry: { data: any; timestamp: number } | undefined): boolean {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < this.CACHE_TTL;
  }

  /**
   * Cache helper: Get country with caching
   */
  private async getCountryWithCache(countryId: string): Promise<any> {
    const cached = this.countryCache.get(countryId);
    if (this.isCacheValid(cached)) {
      this.logger.debug(`Cache HIT for country: ${countryId}`);
      return cached!.data;
    }

    this.logger.debug(`Cache MISS for country: ${countryId}`);
    const country = await this.countryService.findOne(countryId);
    if (country) {
      this.countryCache.set(countryId, { data: country, timestamp: Date.now() });
    }
    return country;
  }

  /**
   * Cache helper: Get salary components with caching
   */
  private async getSalaryComponentsWithCache(countryId: string): Promise<any> {
    const cached = this.salaryComponentsCache.get(countryId);
    if (this.isCacheValid(cached)) {
      this.logger.debug(`Cache HIT for salary components: ${countryId}`);
      return cached!.data;
    }

    this.logger.debug(`Cache MISS for salary components: ${countryId}`);
    const components = await this.salaryComponentService.findByCountry(countryId);
    this.salaryComponentsCache.set(countryId, { data: components, timestamp: Date.now() });
    return components;
  }

  /**
   * Cache helper: Get statutory components with caching
   */
  private async getStatutoryComponentsWithCache(countryId: string): Promise<any> {
    const cached = this.statutoryComponentsCache.get(countryId);
    if (this.isCacheValid(cached)) {
      this.logger.debug(`Cache HIT for statutory components: ${countryId}`);
      return cached!.data;
    }

    this.logger.debug(`Cache MISS for statutory components: ${countryId}`);
    const components = await this.statutoryComponentService.findByCountry(countryId);
    this.statutoryComponentsCache.set(countryId, { data: components, timestamp: Date.now() });
    return components;
  }

  /**
   * Clear all caches (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.countryCache.clear();
    this.salaryComponentsCache.clear();
    this.statutoryComponentsCache.clear();
    this.logger.log('All caches cleared');
  }

  /**
   * Get region-specific calculation factory
   */
  private getRegionFactory(countryCode: string): RegionCalculationFactory {
    const factory = this.regionFactories.get(countryCode.toUpperCase());
    if (!factory) {
      throw new BadRequestException(
        `No calculation factory registered for country: ${countryCode}`,
      );
    }
    return factory;
  }

  /**
   * Calculate payroll for a single employee
   */
  async calculatePayroll(
    dto: CalculatePayrollDto,
  ): Promise<PayrollCalculationResponse> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      this.logger.log(
        `Starting payroll calculation for user: ${dto.userId}, country: ${dto.countryId}`,
      );

      // Performance: Get country information with caching
      const country = await this.getCountryWithCache(dto.countryId);
      if (!country) {
        throw new NotFoundException(`Country not found: ${dto.countryId}`);
      }

      // Get payroll period
      const payrollPeriod = await this.payrollPeriodService.findOne(
        dto.payrollPeriodId,
      );
      if (!payrollPeriod) {
        throw new NotFoundException(
          `Payroll period not found: ${dto.payrollPeriodId}`,
        );
      }

      // Validate payroll period belongs to country
      if (payrollPeriod.countryId !== dto.countryId) {
        throw new BadRequestException(
          'Payroll period does not belong to the specified country',
        );
      }

      // Performance: Get salary components with caching
      const salaryComponentsResponse =
        await this.getSalaryComponentsWithCache(dto.countryId);
      const salaryComponents = salaryComponentsResponse.components || [];

      // Performance: Get statutory components with caching
      const statutoryComponentsResponse =
        await this.getStatutoryComponentsWithCache(dto.countryId);
      const statutoryComponents = statutoryComponentsResponse.components || [];

      // Get employee data (integrates with Stories 1.2, 1.4, 1.5)
      const employeeData = await this.getEmployeeData(dto.userId, dto.countryId);

      // Validate currency consistency
      if (employeeData.currency !== country.currency?.code) {
        warnings.push(
          `Employee salary currency (${employeeData.currency}) differs from country currency (${country.currency?.code}). Using employee salary currency.`
        );
      }

      // Prepare calculation input
      const calculationInput: PayrollCalculationInput = {
        userId: dto.userId,
        countryId: dto.countryId,
        countryCode: country.code,
        payrollPeriodId: dto.payrollPeriodId,
        calculationDate: dto.calculationDate
          ? new Date(dto.calculationDate)
          : new Date(),
        basicSalary: employeeData.basicSalary,
        currencyCode: employeeData.currency,
        salaryComponents,
        statutoryComponents,
        includeOvertime: dto.includeOvertime !== false,
        includeNightShift: dto.includeNightShift !== false,
        metadata: {
          employmentRecordId: employeeData.employmentRecord.id,
          userName: `${employeeData.user.firstName} ${employeeData.user.lastName}`,
          userEmail: employeeData.user.email,
          payrollPeriod: {
            startDate: payrollPeriod.startDate,
            endDate: payrollPeriod.endDate,
          },
        },
      };

      // Get region-specific calculation factory
      const factory = this.getRegionFactory(country.code);

      // Perform calculation
      const result = await factory.calculatePayroll(calculationInput);

      const processingTimeMs = Date.now() - startTime;

      this.logger.log(
        `Payroll calculation completed for user: ${dto.userId}, net pay: ${result.netPay} ${result.currencyCode}, time: ${processingTimeMs}ms`,
      );

      // Audit: Log successful payroll calculation
      await this.auditService.log({
        actorUserId: dto.userId, // In production, this would be the requesting user ID
        actorRole: 'system', // In production, this would be the actual user role
        action: 'payroll_calculated',
        entityType: 'PayrollCalculation',
        entityId: dto.userId, // Using userId as the calculation identifier
        changes: {
          countryId: dto.countryId,
          payrollPeriodId: dto.payrollPeriodId,
          grossPay: result.grossPay,
          totalStatutoryDeductions: result.totalStatutoryDeductions,
          totalOtherDeductions: result.totalOtherDeductions,
          netPay: result.netPay,
          currencyCode: result.currencyCode,
          processingTimeMs,
          calculationDate: dto.calculationDate || new Date().toISOString(),
        },
      }).catch(err => {
        // Don't fail the calculation if audit logging fails
        this.logger.error(`Failed to log payroll calculation audit: ${err.message}`);
      });

      return {
        result,
        processingTimeMs,
        status: 'success',
        warnings: warnings.length > 0 ? warnings : undefined,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      this.logger.error(
        `Payroll calculation failed for user: ${dto.userId}`,
        error.stack,
      );

      // Audit: Log failed payroll calculation
      await this.auditService.log({
        actorUserId: dto.userId,
        actorRole: 'system',
        action: 'payroll_calculation_failed',
        entityType: 'PayrollCalculation',
        entityId: dto.userId,
        changes: {
          countryId: dto.countryId,
          payrollPeriodId: dto.payrollPeriodId,
          error: error.message,
          errorStack: error.stack?.substring(0, 500), // Truncate stack trace
          processingTimeMs,
        },
      }).catch(err => {
        this.logger.error(`Failed to log payroll calculation failure audit: ${err.message}`);
      });

      throw error;
    }
  }

  /**
   * Calculate payroll for multiple employees in bulk
   * Performance: Processes in batches with controlled concurrency
   * - Batch size: 50 employees per batch
   * - Prevents memory issues with large datasets
   * - Parallel processing within batches
   */
  async calculateBulkPayroll(
    dto: BulkCalculatePayrollDto,
  ): Promise<BulkPayrollCalculationResponse> {
    const startTime = Date.now();
    const results: PayrollCalculationResult[] = [];
    const failedUserIds: string[] = [];
    const errors: Array<{ userId: string; error: string }> = [];

    const BATCH_SIZE = 50; // Process 50 employees at a time
    const totalEmployees = dto.userIds.length;

    this.logger.log(
      `Starting bulk payroll calculation for ${totalEmployees} employees (batch size: ${BATCH_SIZE})`,
    );

    // Performance: Process in batches to control memory usage
    for (let i = 0; i < totalEmployees; i += BATCH_SIZE) {
      const batch = dto.userIds.slice(i, Math.min(i + BATCH_SIZE, totalEmployees));
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(totalEmployees / BATCH_SIZE);
      
      this.logger.log(
        `Processing batch ${batchNumber}/${totalBatches} (${batch.length} employees)`,
      );

      // Performance: Process batch in parallel
      const calculationPromises = batch.map(async (userId) => {
        try {
          const singleCalcDto: CalculatePayrollDto = {
            countryId: dto.countryId,
            userId,
            payrollPeriodId: dto.payrollPeriodId,
            calculationDate: dto.calculationDate,
          };

          const response = await this.calculatePayroll(singleCalcDto);
          return { success: true, result: response.result };
        } catch (error) {
          this.logger.error(
            `Bulk calculation failed for user: ${userId}`,
            error.message,
          );
          return {
            success: false,
            userId,
            error: error.message,
          };
        }
      });

      const batchResults = await Promise.all(calculationPromises);

      // Collect results from this batch
      batchResults.forEach((calcResult) => {
        if (calcResult.success) {
          results.push(calcResult.result);
        } else {
          failedUserIds.push(calcResult.userId);
          errors.push({
            userId: calcResult.userId,
            error: calcResult.error,
          });
        }
      });

      // Log batch progress
      this.logger.log(
        `Batch ${batchNumber}/${totalBatches} completed: ${results.length}/${totalEmployees} successful so far`,
      );
    }

    const processingTimeMs = Date.now() - startTime;
    const employeesPerSecond = Math.round((totalEmployees / processingTimeMs) * 1000);

    this.logger.log(
      `Bulk payroll calculation completed: ${results.length} successful, ${failedUserIds.length} failed, time: ${processingTimeMs}ms (${employeesPerSecond} employees/sec)`,
    );

    // Audit: Log bulk payroll calculation
    await this.auditService.log({
      actorUserId: 'system', // In production, this would be the requesting user ID
      actorRole: 'system', // In production, this would be the actual user role
      action: 'bulk_payroll_calculated',
      entityType: 'BulkPayrollCalculation',
      entityId: dto.payrollPeriodId, // Using payroll period as the bulk calculation identifier
      changes: {
        countryId: dto.countryId,
        payrollPeriodId: dto.payrollPeriodId,
        totalRequested: totalEmployees,
        successCount: results.length,
        failedCount: failedUserIds.length,
        processingTimeMs,
        employeesPerSecond,
        batchSize: 50,
        failedUserIds: failedUserIds.length > 0 ? failedUserIds : undefined,
        calculationDate: dto.calculationDate || new Date().toISOString(),
      },
    }).catch(err => {
      this.logger.error(`Failed to log bulk payroll calculation audit: ${err.message}`);
    });

    return {
      results,
      totalRequested: totalEmployees,
      successCount: results.length,
      failedCount: failedUserIds.length,
      processingTimeMs,
      failedUserIds: failedUserIds.length > 0 ? failedUserIds : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Get employee data including active employment and current salary
   * Integrates with:
   * - Story 1.2: User Management
   * - Story 1.4: Employment Records
   * - Story 1.5: Salary History
   */
  private async getEmployeeData(userId: string, countryId: string): Promise<{
    user: any;
    employmentRecord: any;
    basicSalary: number;
    currency: string;
  }> {
    try {
      // 1. Validate user exists (Story 1.2 integration)
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException(`User not found: ${userId}`);
      }

      // 2. Get active employment records for the user (Story 1.4 integration)
      const employmentRecords = await this.employmentRecordService.findByUserId(userId);
      
      // Find active employment (no end date or end date in the future)
      const now = new Date();
      const activeEmployment = employmentRecords.find(record => {
        const isActive = record.status === 'active';
        const hasNoEndDate = !record.endDate;
        const endDateInFuture = record.endDate && new Date(record.endDate) > now;
        return isActive && (hasNoEndDate || endDateInFuture);
      });

      if (!activeEmployment) {
        throw new NotFoundException(
          `No active employment record found for user: ${userId}`
        );
      }

      // 3. Get current salary from salary history (Story 1.5 integration)
      const salaryHistoryRecords = await this.salaryHistoryService.findByEmploymentId(
        activeEmployment.id
      );

      // Find the current salary (effective date <= now)
      const currentSalaryRecord = salaryHistoryRecords
        .filter(record => new Date(record.effectiveDate) <= now)
        .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
        [0];

      if (!currentSalaryRecord) {
        throw new NotFoundException(
          `No current salary record found for employment: ${activeEmployment.id}`
        );
      }

      this.logger.log(
        `Retrieved employee data for ${userId}: salary=${currentSalaryRecord.salaryAmount} ${currentSalaryRecord.salaryCurrency}`
      );

      return {
        user,
        employmentRecord: activeEmployment,
        basicSalary: Number(currentSalaryRecord.salaryAmount),
        currency: currentSalaryRecord.salaryCurrency,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get employee data for ${userId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Validate calculation access for user
   * TODO: Integrate with Story 2.1 (Role-Based Access Control)
   */
  async validateCalculationAccess(
    userId: string,
    requestingUserId: string,
    role: string,
  ): Promise<boolean> {
    // Placeholder implementation
    // Will integrate with RBAC from Story 2.1

    // For now, allow admin and hr roles to calculate for any user
    // Allow users to calculate their own payroll
    if (['admin', 'hr'].includes(role.toLowerCase())) {
      return true;
    }

    if (userId === requestingUserId) {
      return true;
    }

    throw new BadRequestException(
      'Insufficient permissions to calculate payroll for this user',
    );
  }

  /**
   * Get calculation summary for a payroll period
   */
  async getCalculationSummary(
    countryId: string,
    payrollPeriodId: string,
  ): Promise<{
    totalEmployees: number;
    totalGrossPay: number;
    totalStatutoryDeductions: number;
    totalNetPay: number;
    currencyCode: string;
  }> {
    // Placeholder for future implementation
    // This will query stored calculation results
    throw new BadRequestException(
      'Calculation summary not yet implemented',
    );
  }
}

