import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollPeriod, PayrollPeriodStatus } from '../entities/payroll-period.entity';
import { ProcessingStatus } from '../entities/payroll-processing-log.entity';
import { PayrollProcessingService } from './payroll-processing.service';
import { PayrollPeriodService } from './payroll-period.service';
import { PayrollProcessingLogService } from './payroll-processing-log.service';
import { EmploymentRecordService } from '../../employment-records/services/employment-record.service';
import { AuditService } from '../../audit/audit.service';
import {
  BulkProcessPayrollDto,
  BulkClosePeriodDto,
  BulkOpenPeriodDto,
  BulkOperationResponseDto,
  ValidatePeriodsDto,
  PeriodValidationResponseDto,
} from '../dto/bulk-operations.dto';

/**
 * Service for bulk payroll operations
 * Handles multi-period and multi-country processing
 */
@Injectable()
export class BulkOperationsService {
  private readonly logger = new Logger(BulkOperationsService.name);

  constructor(
    @InjectRepository(PayrollPeriod)
    private readonly payrollPeriodRepository: Repository<PayrollPeriod>,
    private readonly payrollProcessingService: PayrollProcessingService,
    private readonly payrollPeriodService: PayrollPeriodService,
    private readonly payrollProcessingLogService: PayrollProcessingLogService,
    private readonly employmentRecordService: EmploymentRecordService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Process payroll for multiple periods
   */
  async bulkProcessPayroll(
    dto: BulkProcessPayrollDto,
    actorId: string,
  ): Promise<BulkOperationResponseDto> {
    this.logger.log(
      `Starting bulk payroll processing for ${dto.periodIds.length} periods by user ${actorId}`,
    );

    const results: Array<{
      periodId: string;
      status: 'success' | 'failed';
      message?: string;
      error?: string;
      logId?: string;
    }> = [];

    for (const periodId of dto.periodIds) {
      try {
        const startResult = await this.payrollProcessingService.startPayrollProcessing(
          {
            periodId,
            userIds: dto.userIds,
          },
          actorId,
        );

        results.push({
          periodId,
          status: 'success',
          message: startResult.message,
          logId: startResult.logId,
        });
      } catch (error) {
        this.logger.error(
          `Failed to start processing for period ${periodId}: ${error.message}`,
        );
        results.push({
          periodId,
          status: 'failed',
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const failureCount = results.filter((r) => r.status === 'failed').length;

    // Log audit trail
    await this.auditService.log({
      action: 'bulk_payroll_processing_started',
      actorUserId: actorId,
      actorRole: 'admin',
      entityType: 'payroll_period',
      entityId: 'bulk',
      changes: {
        totalPeriods: dto.periodIds.length,
        successCount,
        failureCount,
        periodIds: dto.periodIds,
      },
    });

    return {
      totalRequested: dto.periodIds.length,
      successCount,
      failureCount,
      results,
    };
  }

  /**
   * Close multiple payroll periods
   */
  async bulkClosePeriods(
    dto: BulkClosePeriodDto,
    actorId: string,
  ): Promise<BulkOperationResponseDto> {
    this.logger.log(
      `Closing ${dto.periodIds.length} payroll periods by user ${actorId}`,
    );

    const results: Array<{
      periodId: string;
      status: 'success' | 'failed';
      message?: string;
      error?: string;
    }> = [];

    for (const periodId of dto.periodIds) {
      try {
        const period = await this.payrollPeriodService.findOne(periodId);
        if (!period) {
          throw new NotFoundException(`Period ${periodId} not found`);
        }

        // Validate period can be closed
        if (!dto.forceClose) {
          const validationResult = await this.validatePeriodForClosure(periodId);
          if (!validationResult.canClose) {
            throw new BadRequestException(
              `Cannot close period: ${validationResult.reasons.join(', ')}`,
            );
          }
        }

        // Update period status to CLOSED
        await this.payrollPeriodRepository.update(periodId, {
          status: PayrollPeriodStatus.CLOSED,
        });

        results.push({
          periodId,
          status: 'success',
          message: 'Period closed successfully',
        });

        // Log audit trail
        await this.auditService.log({
          action: 'period_closed',
          actorUserId: actorId,
          actorRole: 'admin',
          entityType: 'payroll_period',
          entityId: periodId,
          changes: {
            status: { old: period.status, new: PayrollPeriodStatus.CLOSED },
            forceClose: dto.forceClose,
          },
        });
      } catch (error) {
        this.logger.error(
          `Failed to close period ${periodId}: ${error.message}`,
        );
        results.push({
          periodId,
          status: 'failed',
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const failureCount = results.filter((r) => r.status === 'failed').length;

    return {
      totalRequested: dto.periodIds.length,
      successCount,
      failureCount,
      results,
    };
  }

  /**
   * Open multiple payroll periods
   */
  async bulkOpenPeriods(
    dto: BulkOpenPeriodDto,
    actorId: string,
  ): Promise<BulkOperationResponseDto> {
    this.logger.log(
      `Opening ${dto.periodIds.length} payroll periods by user ${actorId}`,
    );

    const results: Array<{
      periodId: string;
      status: 'success' | 'failed';
      message?: string;
      error?: string;
    }> = [];

    for (const periodId of dto.periodIds) {
      try {
        const period = await this.payrollPeriodService.findOne(periodId);
        if (!period) {
          throw new NotFoundException(`Period ${periodId} not found`);
        }

        // Validate period can be opened
        if (period.status !== PayrollPeriodStatus.DRAFT && period.status !== PayrollPeriodStatus.CLOSED) {
          throw new BadRequestException(
            `Period must be in DRAFT or CLOSED status to open. Current status: ${period.status}`,
          );
        }

        // Update period status to OPEN
        await this.payrollPeriodRepository.update(periodId, {
          status: PayrollPeriodStatus.OPEN,
        });

        results.push({
          periodId,
          status: 'success',
          message: 'Period opened successfully',
        });

        // Log audit trail
        await this.auditService.log({
          action: 'period_opened',
          actorUserId: actorId,
          actorRole: 'admin',
          entityType: 'payroll_period',
          entityId: periodId,
          changes: {
            status: { old: period.status, new: PayrollPeriodStatus.OPEN },
          },
        });
      } catch (error) {
        this.logger.error(
          `Failed to open period ${periodId}: ${error.message}`,
        );
        results.push({
          periodId,
          status: 'failed',
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const failureCount = results.filter((r) => r.status === 'failed').length;

    return {
      totalRequested: dto.periodIds.length,
      successCount,
      failureCount,
      results,
    };
  }

  /**
   * Validate multiple periods for processing
   */
  async validatePeriods(
    dto: ValidatePeriodsDto,
  ): Promise<PeriodValidationResponseDto[]> {
    this.logger.log(`Validating ${dto.periodIds.length} periods`);

    const validations: PeriodValidationResponseDto[] = [];

    for (const periodId of dto.periodIds) {
      try {
        const period = await this.payrollPeriodService.findOne(periodId);
        if (!period) {
          validations.push({
            periodId,
            periodName: 'Unknown',
            countryCode: 'Unknown',
            isValid: false,
            canProcess: false,
            validationErrors: ['Period not found'],
            validationWarnings: [],
            estimatedEmployeeCount: 0,
          });
          continue;
        }

        const validationErrors: string[] = [];
        const validationWarnings: string[] = [];

        // Check period status
        if (period.status !== PayrollPeriodStatus.OPEN) {
          validationErrors.push(
            `Period status must be OPEN (current: ${period.status})`,
          );
        }

        // Check if processing already in progress
        const logs = await this.payrollProcessingLogService.findByPeriod(periodId);
        const inProgressLog = logs.find(
          (log) =>
            log.status === ProcessingStatus.IN_PROGRESS ||
            log.status === ProcessingStatus.STARTED,
        );
        if (inProgressLog) {
          validationErrors.push(
            `Processing already in progress (log ID: ${inProgressLog.id})`,
          );
        }

        // Estimate employee count
        const employmentRecords = await this.employmentRecordService.findAll({
          status: 'active',
          page: 1,
          limit: 10000,
        });
        const estimatedEmployeeCount = employmentRecords.employmentRecords.length;

        if (estimatedEmployeeCount === 0) {
          validationWarnings.push('No active employees found for this period');
        }

        // Check date range
        const now = new Date();
        if (new Date(period.endDate) > now) {
          validationWarnings.push('Period end date is in the future');
        }

        validations.push({
          periodId: period.id,
          periodName: period.periodName,
          countryCode: period.countryId,
          isValid: validationErrors.length === 0,
          canProcess: validationErrors.length === 0,
          validationErrors,
          validationWarnings,
          estimatedEmployeeCount,
        });
      } catch (error) {
        this.logger.error(
          `Failed to validate period ${periodId}: ${error.message}`,
        );
        validations.push({
          periodId,
          periodName: 'Unknown',
          countryCode: 'Unknown',
          isValid: false,
          canProcess: false,
          validationErrors: [`Validation failed: ${error.message}`],
          validationWarnings: [],
          estimatedEmployeeCount: 0,
        });
      }
    }

    return validations;
  }

  /**
   * Helper: Validate if a period can be closed
   */
  private async validatePeriodForClosure(periodId: string): Promise<{
    canClose: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    // Check if processing is complete
    const logs = await this.payrollProcessingLogService.findByPeriod(periodId);
    if (logs.length === 0) {
      reasons.push('No processing has been performed for this period');
    } else {
      const latestLog = logs[0];
      if (
        latestLog.status !== ProcessingStatus.COMPLETED &&
        latestLog.status !== ProcessingStatus.FAILED
      ) {
        reasons.push(
          `Processing is not complete (status: ${latestLog.status})`,
        );
      }

      if (latestLog.employeesFailed > 0) {
        reasons.push(
          `${latestLog.employeesFailed} employees failed processing`,
        );
      }
    }

    return {
      canClose: reasons.length === 0,
      reasons,
    };
  }
}

