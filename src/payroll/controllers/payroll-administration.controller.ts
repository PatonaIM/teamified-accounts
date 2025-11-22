import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PayrollProcessingService } from '../services/payroll-processing.service';
import { PayrollPeriodService } from '../services/payroll-period.service';
import { BulkOperationsService } from '../services/bulk-operations.service';
import { PerformanceMetricsService } from '../services/performance-metrics.service';
import {
  StartPayrollProcessingDto,
  StopPayrollProcessingDto,
  RetryFailedEmployeesDto,
  ProcessingStatusResponseDto,
  StartProcessingResponseDto,
} from '../dto/payroll-processing.dto';
import {
  BulkProcessPayrollDto,
  BulkClosePeriodDto,
  BulkOpenPeriodDto,
  BulkOperationResponseDto,
  ValidatePeriodsDto,
  PeriodValidationResponseDto,
} from '../dto/bulk-operations.dto';
import {
  MetricsQueryDto,
  PerformanceMetricResponseDto,
  PerformanceSummaryDto,
  SystemPerformanceDashboardDto,
} from '../dto/performance-metrics.dto';
import { CreatePayrollPeriodDto } from '../dto/payroll-period.dto';

/**
 * Controller for advanced payroll administration and monitoring
 * Admin and HR roles only
 */
@ApiTags('Payroll Administration')
@ApiBearerAuth()
@Controller('v1/payroll/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'hr')
export class PayrollAdministrationController {
  constructor(
    private readonly payrollProcessingService: PayrollProcessingService,
    private readonly payrollPeriodService: PayrollPeriodService,
    private readonly bulkOperationsService: BulkOperationsService,
    private readonly performanceMetricsService: PerformanceMetricsService,
  ) {}

  /**
   * Start payroll processing for a period
   */
  @Post('process/start')
  @ApiOperation({ summary: 'Start payroll processing for a period' })
  @ApiResponse({
    status: 201,
    description: 'Payroll processing started successfully',
    type: StartProcessingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid period or already processing' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async startPayrollProcessing(
    @Body() dto: StartPayrollProcessingDto,
    @Request() req,
  ): Promise<StartProcessingResponseDto> {
    return this.payrollProcessingService.startPayrollProcessing(dto, req.user.sub);
  }

  /**
   * Stop payroll processing
   */
  @Post('process/stop')
  @ApiOperation({ summary: 'Stop active payroll processing' })
  @ApiResponse({ status: 200, description: 'Payroll processing stopped successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - cannot stop processing in current state' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async stopPayrollProcessing(
    @Body() dto: StopPayrollProcessingDto,
    @Request() req,
  ): Promise<{ message: string }> {
    await this.payrollProcessingService.stopProcessing(dto, req.user.sub);
    return { message: 'Payroll processing stopped successfully' };
  }

  /**
   * Retry failed employees
   */
  @Post('process/retry')
  @ApiOperation({ summary: 'Retry failed employee calculations' })
  @ApiResponse({
    status: 201,
    description: 'Retry processing started successfully',
    type: StartProcessingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - no failed employees to retry' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async retryFailedEmployees(
    @Body() dto: RetryFailedEmployeesDto,
    @Request() req,
  ): Promise<StartProcessingResponseDto> {
    return this.payrollProcessingService.retryFailedEmployees(dto, req.user.sub);
  }

  /**
   * Get processing status for a period
   */
  @Get('status/:periodId')
  @ApiOperation({ summary: 'Get payroll processing status for a period' })
  @ApiResponse({
    status: 200,
    description: 'Processing status retrieved successfully',
    type: ProcessingStatusResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Period not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProcessingStatus(
    @Param('periodId') periodId: string,
  ): Promise<ProcessingStatusResponseDto> {
    return this.payrollProcessingService.getProcessingStatus(periodId);
  }

  /**
   * List all payroll periods for a country (existing endpoint from Story 7.1)
   * Note: For full listing, use the dedicated PayrollPeriodController
   */
  @Get('periods/:countryId')
  @ApiOperation({ summary: 'List payroll periods for a country' })
  @ApiResponse({ status: 200, description: 'Periods retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listPeriods(@Param('countryId') countryId: string) {
    return this.payrollPeriodService.findByCountry(countryId);
  }

  /**
   * Create payroll period (existing endpoint from Story 7.1)
   */
  @Post('periods')
  @ApiOperation({ summary: 'Create a new payroll period' })
  @ApiResponse({ status: 201, description: 'Period created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPeriod(@Body() dto: CreatePayrollPeriodDto) {
    return this.payrollPeriodService.create(dto);
  }

  /**
   * Update payroll period (existing endpoint from Story 7.1)
   */
  @Put('periods/:id')
  @ApiOperation({ summary: 'Update a payroll period' })
  @ApiResponse({ status: 200, description: 'Period updated successfully' })
  @ApiResponse({ status: 404, description: 'Period not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePeriod(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePayrollPeriodDto>,
  ) {
    return this.payrollPeriodService.update(id, dto);
  }

  /**
   * Delete payroll period (only allowed for draft/open status)
   */
  @Delete('countries/:countryCode/periods/:periodId')
  @ApiOperation({ summary: 'Delete a payroll period (draft/open only)' })
  @ApiResponse({ status: 200, description: 'Period deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete period in this status' })
  @ApiResponse({ status: 404, description: 'Period not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deletePeriod(
    @Param('countryCode') countryCode: string,
    @Param('periodId') periodId: string,
  ) {
    return this.payrollPeriodService.delete(periodId);
  }

  /**
   * Bulk process payroll for multiple periods
   */
  @Post('bulk/process')
  @ApiOperation({ summary: 'Start payroll processing for multiple periods' })
  @ApiResponse({
    status: 201,
    description: 'Bulk processing started successfully',
    type: BulkOperationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async bulkProcessPayroll(
    @Body() dto: BulkProcessPayrollDto,
    @Request() req,
  ): Promise<BulkOperationResponseDto> {
    return this.bulkOperationsService.bulkProcessPayroll(dto, req.user.sub);
  }

  /**
   * Bulk close periods
   */
  @Post('bulk/close')
  @ApiOperation({ summary: 'Close multiple payroll periods' })
  @ApiResponse({
    status: 200,
    description: 'Bulk period closure completed',
    type: BulkOperationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkClosePeriods(
    @Body() dto: BulkClosePeriodDto,
    @Request() req,
  ): Promise<BulkOperationResponseDto> {
    return this.bulkOperationsService.bulkClosePeriods(dto, req.user.sub);
  }

  /**
   * Bulk open periods
   */
  @Post('bulk/open')
  @ApiOperation({ summary: 'Open multiple payroll periods' })
  @ApiResponse({
    status: 200,
    description: 'Bulk period opening completed',
    type: BulkOperationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkOpenPeriods(
    @Body() dto: BulkOpenPeriodDto,
    @Request() req,
  ): Promise<BulkOperationResponseDto> {
    return this.bulkOperationsService.bulkOpenPeriods(dto, req.user.sub);
  }

  /**
   * Validate periods before processing
   */
  @Post('validate')
  @ApiOperation({ summary: 'Validate payroll periods before processing' })
  @ApiResponse({
    status: 200,
    description: 'Validation completed',
    type: [PeriodValidationResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async validatePeriods(
    @Body() dto: ValidatePeriodsDto,
  ): Promise<PeriodValidationResponseDto[]> {
    return this.bulkOperationsService.validatePeriods(dto);
  }

  /**
   * Get system-wide performance dashboard
   */
  @Get('monitoring/dashboard')
  @ApiOperation({ summary: 'Get system-wide performance dashboard with metrics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: SystemPerformanceDashboardDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPerformanceDashboard(): Promise<SystemPerformanceDashboardDto> {
    return this.performanceMetricsService.getSystemDashboard();
  }

  /**
   * Query performance metrics
   */
  @Get('monitoring/metrics')
  @ApiOperation({ summary: 'Query performance metrics with filters' })
  @ApiResponse({
    status: 200,
    description: 'Metrics retrieved successfully',
    type: [PerformanceMetricResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async queryMetrics(
    @Body() query: MetricsQueryDto,
  ): Promise<PerformanceMetricResponseDto[]> {
    return this.performanceMetricsService.queryMetrics(query);
  }

  /**
   * Get performance summary for a specific period
   */
  @Get('monitoring/period/:periodId')
  @ApiOperation({ summary: 'Get performance summary for a payroll period' })
  @ApiResponse({
    status: 200,
    description: 'Performance summary retrieved successfully',
    type: PerformanceSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Period not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPerformanceSummary(
    @Param('periodId') periodId: string,
  ): Promise<PerformanceSummaryDto> {
    return this.performanceMetricsService.getPerformanceSummary(periodId);
  }
}

