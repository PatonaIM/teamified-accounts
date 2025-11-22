import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollPeriod, PayrollPeriodStatus } from '../entities/payroll-period.entity';
import { PayrollProcessingLog, ProcessingStatus } from '../entities/payroll-processing-log.entity';
import { PayrollPeriodService } from './payroll-period.service';
import { PayrollProcessingLogService } from './payroll-processing-log.service';
import { PayrollCalculationService } from './payroll-calculation.service';
import { PayslipStorageService } from './payslip-storage.service';
import { PayslipPdfService } from './payslip-pdf.service';
import { PayslipNotificationService } from './payslip-notification.service';
import { TimesheetService } from '../../timesheets/services/timesheet.service';
import { LeaveService } from '../../leave/services/leave.service';
import { EmploymentRecordService } from '../../employment-records/services/employment-record.service';
import { AuditService } from '../../audit/audit.service';
import { PerformanceMetricsService } from './performance-metrics.service';
import { MetricType } from '../entities/performance-metrics.entity';
import {
  StartPayrollProcessingDto,
  StopPayrollProcessingDto,
  RetryFailedEmployeesDto,
  ProcessingStatusResponseDto,
  StartProcessingResponseDto,
} from '../dto/payroll-processing.dto';

/**
 * Service for orchestrating complete payroll processing runs
 * Coordinates Stories 7.3, 7.4, 7.5, 7.6 for end-to-end payroll workflow
 */
@Injectable()
export class PayrollProcessingService {
  private readonly logger = new Logger(PayrollProcessingService.name);

  constructor(
    @InjectRepository(PayrollPeriod)
    private readonly payrollPeriodRepository: Repository<PayrollPeriod>,
    private readonly payrollPeriodService: PayrollPeriodService,
    private readonly payrollProcessingLogService: PayrollProcessingLogService,
    private readonly payrollCalculationService: PayrollCalculationService,
    private readonly payslipStorageService: PayslipStorageService,
    private readonly payslipPdfService: PayslipPdfService,
    private readonly payslipNotificationService: PayslipNotificationService,
    private readonly timesheetService: TimesheetService,
    private readonly leaveService: LeaveService,
    private readonly employmentRecordService: EmploymentRecordService,
    private readonly auditService: AuditService,
    private readonly performanceMetricsService: PerformanceMetricsService,
  ) {}

  /**
   * Start payroll processing for a period
   * Complete workflow:
   * 1. Fetch approved timesheets (Story 7.4)
   * 2. Fetch approved leave (Story 7.5)
   * 3. Calculate payroll (Story 7.3)
   * 4. Save to payslips (Story 7.6)
   * 5. Generate PDFs (Story 7.6)
   * 6. Send notifications (Story 7.6)
   */
  async startPayrollProcessing(
    dto: StartPayrollProcessingDto,
    actorId: string,
  ): Promise<StartProcessingResponseDto> {
    this.logger.log(
      `Starting payroll processing for period ${dto.periodId} by user ${actorId}`,
    );

    try {
      // 1. Validate period exists and is in OPEN status
      const period = await this.payrollPeriodService.findOne(dto.periodId);
      if (!period) {
        throw new NotFoundException(`Payroll period ${dto.periodId} not found`);
      }

      if (period.status !== PayrollPeriodStatus.OPEN) {
        throw new BadRequestException(
          `Payroll period must be in OPEN status. Current status: ${period.status}`,
        );
      }

      // 2. Check if processing already in progress
      const existingLogs = await this.payrollProcessingLogService.findByPeriod(
        dto.periodId,
      );
      const inProgressLog = existingLogs.find(
        log => log.status === ProcessingStatus.IN_PROGRESS || log.status === ProcessingStatus.STARTED
      );
      if (inProgressLog) {
        throw new BadRequestException(
          `Processing already in progress for this period (log ID: ${inProgressLog.id})`,
        );
      }

      // 3. Get employees to process
      const employees = dto.userIds && dto.userIds.length > 0
        ? await this.getSpecificEmployees(dto.userIds, period.countryId)
        : await this.getAllEmployees(period.countryId);

      if (employees.length === 0) {
        throw new BadRequestException(
          `No employees found for country ${period.countryId}`,
        );
      }

      // 4. Create processing log
      const processingLog = await this.payrollProcessingLogService.create({
        payrollPeriodId: dto.periodId,
        countryId: period.countryId,
        status: ProcessingStatus.STARTED,
        startedAt: new Date().toISOString(),
        processingMetadata: {
          totalEmployees: employees.length,
          startedBy: actorId,
          userIds: dto.userIds || [],
        },
      });

      // 5. Update period status to PROCESSING
      await this.payrollPeriodRepository.update(dto.periodId, {
        status: PayrollPeriodStatus.PROCESSING,
      });

      // 6. Log audit trail
      await this.auditService.log({
        action: 'payroll_processing_started',
        actorUserId: actorId,
        actorRole: 'admin', // Will be enhanced with actual role
        entityType: 'payroll_period',
        entityId: dto.periodId,
        changes: {
          periodStatus: { old: PayrollPeriodStatus.OPEN, new: PayrollPeriodStatus.PROCESSING },
          totalEmployees: employees.length,
          logId: processingLog.id,
        },
      });

      // 7. Start async processing (fire and forget)
      this.processPayrollAsync(
        processingLog.id,
        period,
        employees.map((e) => e.userId),
      ).catch((error) => {
        this.logger.error(
          `Async payroll processing failed for log ${processingLog.id}: ${error.message}`,
        );
      });

      return {
        logId: processingLog.id,
        periodId: dto.periodId,
        status: 'in_progress',
        totalEmployees: employees.length,
        message: `Payroll processing started for ${employees.length} employees`,
      };
    } catch (error) {
      this.logger.error(`Failed to start payroll processing: ${error.message}`);
      throw error;
    }
  }

  /**
   * Async processing workflow
   */
  private async processPayrollAsync(
    logId: string,
    period: PayrollPeriod,
    userIds: string[],
  ): Promise<void> {
    this.logger.log(`Starting async processing for log ${logId}`);
    const startTime = Date.now();

    try {
      // Update status to in_progress
      await this.payrollProcessingLogService.update(logId, {
        status: ProcessingStatus.IN_PROGRESS,
      });

      const results = {
        successful: [],
        failed: [],
        timesheetCount: 0,
        leaveCount: 0,
        payslipCount: 0,
      };

      // Step 1: Fetch approved timesheets (Story 7.4)
      this.logger.log(`Fetching approved timesheets for period ${period.id}`);
      const timesheetStartTime = Date.now();
      const timesheets = await this.timesheetService.getPayrollReadyTimesheets(
        period.id,
      );
      const timesheetFetchTime = Date.now() - timesheetStartTime;
      results.timesheetCount = timesheets.length;
      this.logger.log(`Found ${timesheets.length} approved timesheets in ${timesheetFetchTime}ms`);

      // Record timesheet fetch metric
      await this.performanceMetricsService.recordMetric({
        metricType: MetricType.TIMESHEET_FETCH,
        metricName: 'Timesheet Fetch Time',
        metricValue: timesheetFetchTime,
        metricUnit: 'ms',
        payrollPeriodId: period.id,
        processingLogId: logId,
        countryId: period.countryId,
        additionalData: { timesheetCount: timesheets.length },
      });

      // Step 2: Fetch approved leave (Story 7.5)
      this.logger.log(`Fetching approved leave for period ${period.id}`);
      const leaveStartTime = Date.now();
      const leaveRequests = await this.leaveService.getPayrollReadyLeaves(
        period.id,
        period.countryId,
      );
      const leaveFetchTime = Date.now() - leaveStartTime;
      results.leaveCount = leaveRequests.length;
      this.logger.log(`Found ${leaveRequests.length} approved leave requests in ${leaveFetchTime}ms`);

      // Record leave fetch metric
      await this.performanceMetricsService.recordMetric({
        metricType: MetricType.LEAVE_FETCH,
        metricName: 'Leave Fetch Time',
        metricValue: leaveFetchTime,
        metricUnit: 'ms',
        payrollPeriodId: period.id,
        processingLogId: logId,
        countryId: period.countryId,
        additionalData: { leaveCount: leaveRequests.length },
      });

      // Step 3: Process each employee
      const employeeCalculationTimes: number[] = [];
      const employeeStorageTimes: number[] = [];
      const employeePdfTimes: number[] = [];

      for (const userId of userIds) {
        try {
          // Calculate payroll (Story 7.3)
          const calcStartTime = Date.now();
          const calculationResponse = await this.payrollCalculationService.calculatePayroll({
            userId,
            countryId: period.countryId,
            payrollPeriodId: period.id,
            includeOvertime: true,
            includeNightShift: true,
          });
          const calcTime = Date.now() - calcStartTime;
          employeeCalculationTimes.push(calcTime);

          // Save to payslips (Story 7.6)
          const storageStartTime = Date.now();
          const payslip = await this.payslipStorageService.saveCalculationResult(
            calculationResponse.result,
          );
          const storageTime = Date.now() - storageStartTime;
          employeeStorageTimes.push(storageTime);

          // Generate PDF (Story 7.6)
          const pdfStartTime = Date.now();
          await this.payslipPdfService.generatePdf(payslip);
          const pdfTime = Date.now() - pdfStartTime;
          employeePdfTimes.push(pdfTime);

          results.successful.push(userId);
          results.payslipCount++;
        } catch (error) {
          this.logger.error(
            `Failed to process employee ${userId}: ${error.message}`,
          );
          results.failed.push({
            userId,
            error: error.message,
          });
        }

        // Update progress
        await this.payrollProcessingLogService.update(logId, {
          employeesProcessed: results.successful.length + results.failed.length,
          employeesFailed: results.failed.length,
        });
      }

      // Record aggregated metrics for calculation, storage, and PDF generation
      if (employeeCalculationTimes.length > 0) {
        const avgCalcTime = employeeCalculationTimes.reduce((a, b) => a + b, 0) / employeeCalculationTimes.length;
        await this.performanceMetricsService.recordMetric({
          metricType: MetricType.CALCULATION_TIME,
          metricName: 'Average Calculation Time Per Employee',
          metricValue: Math.round(avgCalcTime),
          metricUnit: 'ms',
          payrollPeriodId: period.id,
          processingLogId: logId,
          countryId: period.countryId,
          additionalData: { totalEmployees: employeeCalculationTimes.length },
        });

        const avgStorageTime = employeeStorageTimes.reduce((a, b) => a + b, 0) / employeeStorageTimes.length;
        await this.performanceMetricsService.recordMetric({
          metricType: MetricType.PAYSLIP_STORAGE,
          metricName: 'Average Payslip Storage Time',
          metricValue: Math.round(avgStorageTime),
          metricUnit: 'ms',
          payrollPeriodId: period.id,
          processingLogId: logId,
          countryId: period.countryId,
          additionalData: { totalPayslips: employeeStorageTimes.length },
        });

        const avgPdfTime = employeePdfTimes.reduce((a, b) => a + b, 0) / employeePdfTimes.length;
        await this.performanceMetricsService.recordMetric({
          metricType: MetricType.PDF_GENERATION,
          metricName: 'Average PDF Generation Time',
          metricValue: Math.round(avgPdfTime),
          metricUnit: 'ms',
          payrollPeriodId: period.id,
          processingLogId: logId,
          countryId: period.countryId,
          additionalData: { totalPdfs: employeePdfTimes.length },
        });
      }

      // Step 4: Send notifications (Story 7.6)
      // Get all generated payslips for notification
      this.logger.log('Sending payslip notifications to employees');
      const notificationStartTime = Date.now();
      const allPayslips = await this.payslipStorageService.findByPeriod(period.id);
      const successfulPayslips = allPayslips.filter(p => 
        results.successful.includes(p.userId)
      );
      
      let notificationsSent = 0;
      for (const payslip of successfulPayslips) {
        try {
          await this.payslipNotificationService.notifyPayslipAvailable(payslip);
          notificationsSent++;
        } catch (error) {
          this.logger.warn(
            `Failed to send notification for payslip ${payslip.id}: ${error.message}`,
          );
          // Don't fail processing if notification fails
        }
      }
      const notificationTime = Date.now() - notificationStartTime;

      // Record notification metric
      await this.performanceMetricsService.recordMetric({
        metricType: MetricType.NOTIFICATION_SEND,
        metricName: 'Notification Send Time',
        metricValue: notificationTime,
        metricUnit: 'ms',
        payrollPeriodId: period.id,
        processingLogId: logId,
        countryId: period.countryId,
        additionalData: {
          totalNotifications: successfulPayslips.length,
          successfulNotifications: notificationsSent,
        },
      });

      // Step 5: Complete processing
      const processingTimeMs = Date.now() - startTime;

      // Record overall processing time metric
      await this.performanceMetricsService.recordMetric({
        metricType: MetricType.PROCESSING_TIME,
        metricName: 'Total Payroll Processing Time',
        metricValue: processingTimeMs,
        metricUnit: 'ms',
        payrollPeriodId: period.id,
        processingLogId: logId,
        countryId: period.countryId,
        additionalData: {
          employeesProcessed: results.successful.length + results.failed.length,
          successfulEmployees: results.successful.length,
          failedEmployees: results.failed.length,
          avgTimePerEmployee: Math.round(processingTimeMs / userIds.length),
        },
      });
      
      // Update successful payslips to 'available' status
      if (results.successful.length > 0) {
        const payslips = await this.payslipStorageService.findByPeriod(period.id);
        const successfulPayslips = payslips.filter(p => 
          results.successful.includes(p.userId)
        );
        for (const payslip of successfulPayslips) {
          await this.payslipStorageService.markAvailable(payslip.id);
        }
        this.logger.log(`Updated ${successfulPayslips.length} payslips to 'available' status`);
      }
      
      await this.payrollProcessingLogService.update(logId, {
        status: ProcessingStatus.COMPLETED,
        completedAt: new Date().toISOString(),
        processingMetadata: {
          processingTimeMs,
          totalEmployees: userIds.length,
          timesheetCount: results.timesheetCount,
          leaveCount: results.leaveCount,
          payslipCount: results.payslipCount,
          errors: results.failed,
        },
      });

      // Update period status
      const newPeriodStatus = results.failed.length === 0 
        ? PayrollPeriodStatus.COMPLETED 
        : PayrollPeriodStatus.PROCESSING;
      await this.payrollPeriodRepository.update(period.id, {
        status: newPeriodStatus,
      });

      this.logger.log(
        `Payroll processing completed for log ${logId}: ${results.successful.length} successful, ${results.failed.length} failed`,
      );
    } catch (error) {
      this.logger.error(`Payroll processing failed for log ${logId}: ${error.message}`);
      await this.payrollProcessingLogService.update(logId, {
        status: ProcessingStatus.FAILED,
        errorMessage: error.message,
        processingMetadata: {
          failedAt: new Date().toISOString(),
        },
      });
      throw error;
    }
  }

  /**
   * Get processing status for a period
   */
  async getProcessingStatus(periodId: string): Promise<ProcessingStatusResponseDto> {
    const period = await this.payrollPeriodService.findOne(periodId);
    if (!period) {
      throw new NotFoundException(`Payroll period ${periodId} not found`);
    }

    const logs = await this.payrollProcessingLogService.findByPeriod(periodId);
    const log = logs && logs.length > 0 ? logs[0] : null;

    const metadata = log?.processingMetadata || {};
    
    // Get country code from period's country relationship
    const countryCode = period.country?.code || period.countryId;
    
    // If totalEmployees not in metadata, use employeesProcessed as fallback
    const totalEmployees = metadata.totalEmployees || log?.employeesProcessed || 0;
    
    return {
      periodId: period.id,
      periodName: period.periodName,
      countryCode: countryCode,
      periodStatus: period.status,
      logId: log?.id || null,
      processingStatus: log?.status || null,
      totalEmployees: totalEmployees,
      processedEmployees: log?.employeesProcessed || 0,
      failedEmployees: log?.employeesFailed || 0,
      successEmployees: (log?.employeesProcessed || 0) - (log?.employeesFailed || 0),
      startedAt: log?.startedAt || null,
      completedAt: log?.completedAt || null,
      processingTimeMs: metadata.processingTimeMs || null,
      errors: metadata.errors || [],
      metadata,
    };
  }

  /**
   * Stop processing
   */
  async stopProcessing(
    dto: StopPayrollProcessingDto,
    actorId: string,
  ): Promise<void> {
    this.logger.log(`Stopping payroll processing for log ${dto.logId}`);

    const log = await this.payrollProcessingLogService.findOne(dto.logId);
    if (!log) {
      throw new NotFoundException(`Processing log ${dto.logId} not found`);
    }

    if (log.status !== ProcessingStatus.IN_PROGRESS && log.status !== ProcessingStatus.STARTED) {
      throw new BadRequestException(
        `Cannot stop processing with status ${log.status}`,
      );
    }

    await this.payrollProcessingLogService.update(dto.logId, {
      status: ProcessingStatus.CANCELLED,
    });

    // Update period status back to OPEN
    await this.payrollPeriodRepository.update(log.payrollPeriodId, {
      status: PayrollPeriodStatus.OPEN,
    });

    await this.auditService.log({
      action: 'payroll_processing_stopped',
      actorUserId: actorId,
      actorRole: 'admin',
      entityType: 'payroll_processing_log',
      entityId: dto.logId,
      changes: { status: { old: log.status, new: ProcessingStatus.CANCELLED } },
    });

    this.logger.log(`Payroll processing stopped for log ${dto.logId}`);
  }

  /**
   * Retry failed employees
   */
  async retryFailedEmployees(
    dto: RetryFailedEmployeesDto,
    actorId: string,
  ): Promise<StartProcessingResponseDto> {
    this.logger.log(`Retrying failed employees for log ${dto.logId}`);

    const log = await this.payrollProcessingLogService.findOne(dto.logId);
    if (!log) {
      throw new NotFoundException(`Processing log ${dto.logId} not found`);
    }

    if (log.status !== ProcessingStatus.COMPLETED && log.status !== ProcessingStatus.FAILED) {
      throw new BadRequestException(
        `Can only retry failed employees for completed or failed processing`,
      );
    }

    const period = await this.payrollPeriodService.findOne(log.payrollPeriodId);
    if (!period) {
      throw new NotFoundException(
        `Payroll period ${log.payrollPeriodId} not found`,
      );
    }

    // Get failed user IDs from log errors
    const errors = (log.processingMetadata?.errors || []);
    const failedUserIds = dto.userIds && dto.userIds.length > 0
      ? dto.userIds
      : errors.map((err: any) => err.userId).filter(Boolean);

    if (failedUserIds.length === 0) {
      throw new BadRequestException('No failed employees to retry');
    }

    // Start new processing for failed employees
    return this.startPayrollProcessing(
      {
        periodId: period.id,
        userIds: failedUserIds,
      },
      actorId,
    );
  }

  /**
   * Helper: Get specific employees
   * Returns validated user IDs
   */
  private async getSpecificEmployees(
    userIds: string[],
    countryId: string,
  ): Promise<any[]> {
    // For now, return the user IDs as-is
    // Validation will happen during payroll calculation
    return userIds.map(userId => ({ userId }));
  }

  /**
   * Helper: Get all employees for a country
   * For now, retrieves all active employment records
   * TODO: Add country-specific filtering when employment records have country field
   */
  private async getAllEmployees(countryId: string): Promise<any[]> {
    // Get all active employment records
    const result = await this.employmentRecordService.findAll({
      status: 'active',
      page: 1,
      limit: 1000, // Large limit to get all active employees
    });
    
    // Return unique user IDs
    const uniqueUserIds = Array.from(
      new Set(result.employmentRecords.map((record: any) => record.userId))
    );
    
    return uniqueUserIds.map(userId => ({ userId }));
  }
}

