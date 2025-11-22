import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PayrollProcessingLogService } from '../services/payroll-processing-log.service';
import { ProcessingStatus } from '../entities/payroll-processing-log.entity';
import {
  CreatePayrollProcessingLogDto,
  UpdatePayrollProcessingLogDto,
  PayrollProcessingLogResponseDto,
} from '../dto/payroll-processing-log.dto';

@ApiTags('Payroll - Processing Logs')
@Controller('v1/payroll/processing-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PayrollProcessingLogController {
  constructor(private readonly processingLogService: PayrollProcessingLogService) {}

  @Post()
  @Roles('admin', 'hr')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new processing log' })
  @ApiResponse({
    status: 201,
    description: 'Processing log created successfully',
    type: PayrollProcessingLogResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or hr role required' })
  async create(@Body() createLogDto: CreatePayrollProcessingLogDto): Promise<PayrollProcessingLogResponseDto> {
    return await this.processingLogService.create(createLogDto);
  }

  @Get('country/:countryId')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get all processing logs for a country' })
  @ApiParam({ name: 'countryId', description: 'Country UUID' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProcessingStatus,
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Processing logs retrieved successfully',
    type: [PayrollProcessingLogResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByCountry(
    @Param('countryId') countryId: string,
    @Query('status') status?: ProcessingStatus,
  ): Promise<PayrollProcessingLogResponseDto[]> {
    return await this.processingLogService.findByCountry(countryId, status);
  }

  @Get('period/:periodId')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get all processing logs for a payroll period' })
  @ApiParam({ name: 'periodId', description: 'Payroll period UUID' })
  @ApiResponse({
    status: 200,
    description: 'Processing logs retrieved successfully',
    type: [PayrollProcessingLogResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByPeriod(@Param('periodId') periodId: string): Promise<PayrollProcessingLogResponseDto[]> {
    return await this.processingLogService.findByPeriod(periodId);
  }

  @Get('country/:countryId/latest')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get latest processing log for a country' })
  @ApiParam({ name: 'countryId', description: 'Country UUID' })
  @ApiResponse({
    status: 200,
    description: 'Latest processing log retrieved successfully',
    type: PayrollProcessingLogResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No processing logs found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findLatestByCountry(@Param('countryId') countryId: string): Promise<PayrollProcessingLogResponseDto | null> {
    return await this.processingLogService.findLatestByCountry(countryId);
  }

  @Get('country/:countryId/stats')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get processing statistics for a country' })
  @ApiParam({ name: 'countryId', description: 'Country UUID' })
  @ApiResponse({
    status: 200,
    description: 'Processing statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProcessingStats(@Param('countryId') countryId: string): Promise<{
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
  }> {
    return await this.processingLogService.getProcessingStats(countryId);
  }

  @Get(':id')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get processing log by ID' })
  @ApiParam({ name: 'id', description: 'Processing log UUID' })
  @ApiResponse({
    status: 200,
    description: 'Processing log retrieved successfully',
    type: PayrollProcessingLogResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Processing log not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<PayrollProcessingLogResponseDto> {
    return await this.processingLogService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'hr')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update processing log' })
  @ApiParam({ name: 'id', description: 'Processing log UUID' })
  @ApiResponse({
    status: 200,
    description: 'Processing log updated successfully',
    type: PayrollProcessingLogResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Processing log not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or hr role required' })
  async update(
    @Param('id') id: string,
    @Body() updateLogDto: UpdatePayrollProcessingLogDto,
  ): Promise<PayrollProcessingLogResponseDto> {
    return await this.processingLogService.update(id, updateLogDto);
  }

  @Post(':id/complete')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Mark processing as completed' })
  @ApiParam({ name: 'id', description: 'Processing log UUID' })
  @ApiResponse({
    status: 200,
    description: 'Processing marked as completed successfully',
    type: PayrollProcessingLogResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Processing log not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or hr role required' })
  async markCompleted(
    @Param('id') id: string,
    @Body() body: { employeesProcessed: number; employeesFailed: number },
  ): Promise<PayrollProcessingLogResponseDto> {
    return await this.processingLogService.markCompleted(id, body.employeesProcessed, body.employeesFailed);
  }

  @Post(':id/fail')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Mark processing as failed' })
  @ApiParam({ name: 'id', description: 'Processing log UUID' })
  @ApiResponse({
    status: 200,
    description: 'Processing marked as failed successfully',
    type: PayrollProcessingLogResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Processing log not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or hr role required' })
  async markFailed(
    @Param('id') id: string,
    @Body() body: { errorMessage: string; errorDetails?: any },
  ): Promise<PayrollProcessingLogResponseDto> {
    return await this.processingLogService.markFailed(id, body.errorMessage, body.errorDetails);
  }
}

