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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LeaveService } from '../services/leave.service';
import { LeaveApprovalService } from '../services/leave-approval.service';
import { LeaveCalculationService } from '../services/leave-calculation.service';
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ApproveLeaveRequestDto,
  RejectLeaveRequestDto,
  BulkApproveLeaveRequestsDto,
  LeaveRequestQueryDto,
  LeaveRequestResponseDto,
  LeaveBalanceResponseDto,
  PayrollReadyLeavesDto,
} from '../dto/leave.dto';

@ApiTags('Leave Management')
@ApiBearerAuth()
@Controller('v1/leave')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(
    private readonly leaveService: LeaveService,
    private readonly leaveApprovalService: LeaveApprovalService,
    private readonly leaveCalculationService: LeaveCalculationService,
  ) {}

  @Post('requests')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client', 'eor', 'candidate')
  @ApiOperation({ summary: 'Create a new leave request' })
  @ApiResponse({
    status: 201,
    description: 'Leave request created successfully',
    type: LeaveRequestResponseDto,
  })
  async createLeaveRequest(
    @CurrentUser() user: any,
    @Body() createDto: CreateLeaveRequestDto,
  ) {
    // Validate leave type for country
    const isValid = this.leaveCalculationService.isValidLeaveTypeForCountry(
      createDto.leaveType,
      createDto.countryCode,
    );

    if (!isValid) {
      throw new Error(
        `Leave type ${createDto.leaveType} is not valid for country ${createDto.countryCode}`,
      );
    }

    return await this.leaveService.create(user.sub, createDto);
  }

  @Get('requests')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client', 'eor', 'candidate')
  @ApiOperation({ summary: 'List leave requests with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Leave requests retrieved successfully',
    type: [LeaveRequestResponseDto],
  })
  async getLeaveRequests(
    @CurrentUser() user: any,
    @Query() query: LeaveRequestQueryDto,
    @Request() req?: any,
  ) {
    const userRoles = req?.user?.roles || [];

    // Client-scoping for hr_manager_client role
    if (userRoles.includes('hr_manager_client') && req?.user?.clientId) {
      query.clientId = req.user.clientId; // Force override - prevents query parameter bypass
    }

    // For EOR/Candidate roles, only show their own requests
    if (user.role === 'eor' || user.role === 'candidate') {
      query.userId = user.sub;
    }

    return await this.leaveService.findAll(query);
  }

  @Get('requests/:id')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client', 'eor', 'candidate')
  @ApiOperation({ summary: 'Get single leave request details' })
  @ApiResponse({
    status: 200,
    description: 'Leave request retrieved successfully',
    type: LeaveRequestResponseDto,
  })
  async getLeaveRequest(@Param('id') id: string) {
    return await this.leaveService.findOne(id);
  }

  @Put('requests/:id')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client', 'eor', 'candidate')
  @ApiOperation({ summary: 'Update a leave request (DRAFT only)' })
  @ApiResponse({
    status: 200,
    description: 'Leave request updated successfully',
    type: LeaveRequestResponseDto,
  })
  async updateLeaveRequest(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateDto: UpdateLeaveRequestDto,
  ) {
    return await this.leaveService.update(id, user.sub, updateDto);
  }

  @Delete('requests/:id')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client', 'eor', 'candidate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a leave request (DRAFT only)' })
  @ApiResponse({
    status: 204,
    description: 'Leave request deleted successfully',
  })
  async deleteLeaveRequest(@Param('id') id: string, @CurrentUser() user: any) {
    await this.leaveService.remove(id, user.sub);
  }

  @Post('requests/:id/submit')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client', 'eor', 'candidate')
  @ApiOperation({ summary: 'Submit a leave request for approval' })
  @ApiResponse({
    status: 200,
    description: 'Leave request submitted successfully',
    type: LeaveRequestResponseDto,
  })
  async submitLeaveRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.leaveService.submit(id, user.sub);
  }

  @Post('requests/:id/cancel')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client', 'eor', 'candidate')
  @ApiOperation({ summary: 'Cancel/withdraw a leave request' })
  @ApiResponse({
    status: 200,
    description: 'Leave request cancelled successfully',
    type: LeaveRequestResponseDto,
  })
  async cancelLeaveRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.leaveService.cancel(id, user.sub);
  }

  @Post('requests/:id/approve')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client')
  @ApiOperation({ summary: 'Approve a leave request' })
  @ApiResponse({
    status: 200,
    description: 'Leave request approved successfully',
    type: LeaveRequestResponseDto,
  })
  async approveLeaveRequest(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() approveDto: ApproveLeaveRequestDto,
  ) {
    console.log(`[LeaveController] Approving leave request ${id} by user ${user.sub}`);
    console.log(`[LeaveController] Approve DTO:`, approveDto);
    try {
      const result = await this.leaveApprovalService.approve(
        id,
        user.sub,
        approveDto.comments,
      );
      console.log(`[LeaveController] Approval successful for ${id}`);
      return result;
    } catch (error) {
      console.error(`[LeaveController] Approval failed for ${id}:`, error.message);
      throw error;
    }
  }

  @Post('requests/:id/reject')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client')
  @ApiOperation({ summary: 'Reject a leave request' })
  @ApiResponse({
    status: 200,
    description: 'Leave request rejected successfully',
    type: LeaveRequestResponseDto,
  })
  async rejectLeaveRequest(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() rejectDto: RejectLeaveRequestDto,
  ) {
    return await this.leaveApprovalService.reject(
      id,
      user.sub,
      rejectDto.comments,
    );
  }

  @Post('requests/bulk-approve')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client')
  @ApiOperation({ summary: 'Bulk approve leave requests' })
  @ApiResponse({
    status: 200,
    description: 'Bulk approval completed',
  })
  async bulkApproveLeaveRequests(
    @CurrentUser() user: any,
    @Body() bulkApproveDto: BulkApproveLeaveRequestsDto,
  ) {
    return await this.leaveApprovalService.bulkApprove(
      bulkApproveDto.leaveRequestIds,
      user.sub,
      bulkApproveDto.comments,
    );
  }

  @Get('balances')
  @Roles('admin', 'hr', 'account_manager', 'hr_manager_client', 'eor', 'candidate')
  @ApiOperation({ summary: 'Get employee leave balances' })
  @ApiResponse({
    status: 200,
    description: 'Leave balances retrieved successfully',
    type: [LeaveBalanceResponseDto],
  })
  async getLeaveBalances(
    @CurrentUser() user: any,
    @Query('countryCode') countryCode?: string,
  ) {
    // For EOR/Candidate roles, only show their own balances
    // Note: user.sub is the user ID from JWT payload
    const userId = user.sub;

    return await this.leaveService.getBalances(userId, countryCode);
  }

  @Get('payroll-ready')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Get approved leave requests for payroll period' })
  @ApiResponse({
    status: 200,
    description: 'Payroll-ready leave requests retrieved successfully',
    type: [LeaveRequestResponseDto],
  })
  async getPayrollReadyLeaves(@Query() query: PayrollReadyLeavesDto) {
    return await this.leaveService.getPayrollReadyLeaves(
      query.payrollPeriodId,
      query.countryCode,
    );
  }

  @Get('payroll-impact')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Get leave impacts for payroll calculations' })
  @ApiResponse({
    status: 200,
    description: 'Leave impact calculations retrieved successfully',
  })
  async getPayrollImpact(
    @Query('userId') userId: string,
    @Query('leaveType') leaveType: string,
    @Query('totalDays') totalDays: number,
    @Query('isPaid') isPaid: boolean,
    @Query('baseSalary') baseSalary: number,
    @Query('countryCode') countryCode: string,
  ) {
    return await this.leaveCalculationService.calculateLeaveImpact(
      userId,
      leaveType as any,
      totalDays,
      isPaid,
      baseSalary,
      countryCode,
    );
  }
}

