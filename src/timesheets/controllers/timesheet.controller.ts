import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
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
import { TimesheetService } from '../services/timesheet.service';
import { TimesheetStatus } from '../entities/timesheet.entity';
import {
  CreateTimesheetDto,
  UpdateTimesheetDto,
  SubmitTimesheetDto,
  ApproveTimesheetDto,
  RejectTimesheetDto,
  BulkApproveTimesheetsDto,
  TimesheetResponseDto,
  TimesheetListResponseDto,
  BulkOperationResultDto,
} from '../dto/timesheet.dto';

/**
 * Timesheet Controller
 * 
 * API Path Convention:
 * - Controllers use @Controller('v1/module/resource')
 * - Global prefix 'api' is added in main.ts
 * - Final URLs: /api/v1/timesheets/*
 */
@ApiTags('Timesheets')
@Controller('v1/timesheets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Post()
  @Roles('admin', 'hr', 'eor', 'candidate')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ 
    summary: 'Create a new timesheet entry',
    description: 'Employees can create timesheets for their own records. Admins can create for any employee.',
  })
  @ApiResponse({
    status: 201,
    description: 'Timesheet created successfully',
    type: TimesheetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createTimesheetDto: CreateTimesheetDto,
    @Request() req: any,
  ): Promise<TimesheetResponseDto> {
    // For non-admin users, ensure they can only create timesheets for themselves
    // req.user.roles is an array, not a single role
    const userRoles = req.user.roles || [];
    const isAdminOrHR = userRoles.some((role: string) => 
      ['admin', 'hr'].includes(role.toLowerCase())
    );
    
    if (!isAdminOrHR) {
      createTimesheetDto.userId = req.user.id;
    }

    return await this.timesheetService.create(createTimesheetDto);
  }

  @Get()
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client', 'eor', 'candidate')
  @ApiOperation({ 
    summary: 'Get timesheets with filtering',
    description: 'Retrieve timesheets with optional filtering by user, period, status, and date range.',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'employmentRecordId', required: false, description: 'Filter by employment record ID' })
  @ApiQuery({ name: 'payrollPeriodId', required: false, description: 'Filter by payroll period ID' })
  @ApiQuery({ name: 'status', required: false, enum: TimesheetStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Page size (default: 50)', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Timesheets retrieved successfully',
    type: TimesheetListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('employmentRecordId') employmentRecordId?: string,
    @Query('payrollPeriodId') payrollPeriodId?: string,
    @Query('status') status?: TimesheetStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Request() req?: any,
  ): Promise<TimesheetListResponseDto> {
    // For non-admin/hr users, restrict to their own timesheets
    const userRoles = req.user.roles || [];
    const canViewAll = userRoles.some((role: string) => 
      ['admin', 'hr', 'account_manager', 'hr_manager_client'].includes(role.toLowerCase())
    );
    
    let effectiveUserId = userId;
    if (!canViewAll) {
      effectiveUserId = req.user.id;
    }

    // Client-scoping for hr_manager_client role
    const clientId = userRoles.includes('hr_manager_client') && req.user.clientId 
      ? req.user.clientId 
      : undefined;

    return await this.timesheetService.findAll({
      userId: effectiveUserId,
      employmentRecordId,
      payrollPeriodId,
      status,
      startDate,
      endDate,
      clientId, // Pass clientId for filtering
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('payroll-ready')
  @Roles('admin', 'hr')
  @ApiOperation({ 
    summary: 'Get timesheets ready for payroll processing',
    description: 'Retrieve approved timesheets that have not been processed for payroll.',
  })
  @ApiQuery({ name: 'payrollPeriodId', required: false, description: 'Filter by payroll period ID' })
  @ApiResponse({
    status: 200,
    description: 'Payroll-ready timesheets retrieved successfully',
    type: [TimesheetResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or hr role required' })
  async getPayrollReady(
    @Query('payrollPeriodId') payrollPeriodId?: string,
  ): Promise<TimesheetResponseDto[]> {
    return await this.timesheetService.getPayrollReadyTimesheets(payrollPeriodId);
  }

  @Get(':id')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client', 'eor', 'candidate')
  @ApiOperation({ summary: 'Get timesheet by ID' })
  @ApiParam({ name: 'id', description: 'Timesheet UUID' })
  @ApiResponse({
    status: 200,
    description: 'Timesheet retrieved successfully',
    type: TimesheetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Timesheet not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<TimesheetResponseDto> {
    return await this.timesheetService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'hr', 'eor', 'candidate')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ 
    summary: 'Update timesheet',
    description: 'Update timesheet details. Only draft and submitted timesheets can be updated. Employees can only update their own timesheets.',
  })
  @ApiParam({ name: 'id', description: 'Timesheet UUID' })
  @ApiResponse({
    status: 200,
    description: 'Timesheet updated successfully',
    type: TimesheetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or timesheet cannot be updated' })
  @ApiResponse({ status: 404, description: 'Timesheet not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateTimesheetDto: UpdateTimesheetDto,
  ): Promise<TimesheetResponseDto> {
    return await this.timesheetService.update(id, updateTimesheetDto);
  }

  @Delete(':id')
  @Roles('admin', 'hr', 'eor', 'candidate')
  @ApiOperation({ 
    summary: 'Delete timesheet',
    description: 'Delete timesheet. Only draft and submitted timesheets can be deleted. Approved and rejected timesheets cannot be deleted.',
  })
  @ApiParam({ name: 'id', description: 'Timesheet UUID' })
  @ApiResponse({ status: 200, description: 'Timesheet deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - only draft and submitted timesheets can be deleted' })
  @ApiResponse({ status: 404, description: 'Timesheet not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.timesheetService.remove(id);
  }

  @Post('submit')
  @Roles('admin', 'hr', 'eor', 'candidate')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ 
    summary: 'Submit timesheets for approval',
    description: 'Submit one or more draft timesheets for manager approval.',
  })
  @ApiResponse({
    status: 200,
    description: 'Timesheets submitted successfully',
    type: BulkOperationResultDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submitTimesheets(
    @Body() submitTimesheetDto: SubmitTimesheetDto,
    @Request() req: any,
  ): Promise<BulkOperationResultDto> {
    return await this.timesheetService.submitTimesheets(
      submitTimesheetDto.timesheetIds,
      req.user.id,
      submitTimesheetDto.notes,
    );
  }

  @Post(':id/approve')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ 
    summary: 'Approve timesheet',
    description: 'Approve a submitted timesheet. Authorized roles: Admin, HR, Account Manager, Client HR Manager.',
  })
  @ApiParam({ name: 'id', description: 'Timesheet UUID' })
  @ApiResponse({
    status: 200,
    description: 'Timesheet approved successfully',
    type: TimesheetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - timesheet cannot be approved' })
  @ApiResponse({ status: 404, description: 'Timesheet not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async approve(
    @Param('id') id: string,
    @Body() approveTimesheetDto: ApproveTimesheetDto,
    @Request() req: any,
  ): Promise<TimesheetResponseDto> {
    return await this.timesheetService.approveTimesheet(
      id,
      req.user.id,
      approveTimesheetDto.comments,
    );
  }

  @Post(':id/reject')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ 
    summary: 'Reject timesheet',
    description: 'Reject a submitted timesheet. Authorized roles: Admin, HR, Account Manager, Client HR Manager.',
  })
  @ApiParam({ name: 'id', description: 'Timesheet UUID' })
  @ApiResponse({
    status: 200,
    description: 'Timesheet rejected successfully',
    type: TimesheetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - timesheet cannot be rejected' })
  @ApiResponse({ status: 404, description: 'Timesheet not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async reject(
    @Param('id') id: string,
    @Body() rejectTimesheetDto: RejectTimesheetDto,
    @Request() req: any,
  ): Promise<TimesheetResponseDto> {
    return await this.timesheetService.rejectTimesheet(
      id,
      req.user.id,
      rejectTimesheetDto.reason,
      rejectTimesheetDto.comments,
    );
  }

  @Post('bulk-approve')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ 
    summary: 'Bulk approve timesheets',
    description: 'Approve multiple submitted timesheets in a single operation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk approval completed',
    type: BulkOperationResultDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async bulkApprove(
    @Body() bulkApproveTimesheetsDto: BulkApproveTimesheetsDto,
    @Request() req: any,
  ): Promise<BulkOperationResultDto> {
    return await this.timesheetService.bulkApproveTimesheets(
      bulkApproveTimesheetsDto.timesheetIds,
      req.user.id,
      bulkApproveTimesheetsDto.comments,
    );
  }
}

