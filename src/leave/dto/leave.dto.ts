import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { LeaveType, LeaveRequestStatus } from '../entities/leave-request.entity';

// Create Leave Request DTO
export class CreateLeaveRequestDto {
  @ApiProperty({ 
    description: 'Type of leave request',
    enum: LeaveType,
  })
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @ApiProperty({ description: 'Start date of leave (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date of leave (YYYY-MM-DD)' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Total days of leave requested' })
  @IsNumber()
  @Min(0.5)
  totalDays: number;

  @ApiPropertyOptional({ description: 'Additional notes for the leave request' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ description: 'Whether this is paid or unpaid leave' })
  @IsBoolean()
  isPaid: boolean;

  @ApiProperty({ description: 'Country code for the leave request' })
  @IsString()
  countryCode: string;
}

// Update Leave Request DTO
export class UpdateLeaveRequestDto {
  @ApiPropertyOptional({ 
    description: 'Type of leave request',
    enum: LeaveType,
  })
  @IsOptional()
  @IsEnum(LeaveType)
  leaveType?: LeaveType;

  @ApiPropertyOptional({ description: 'Start date of leave (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date of leave (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Total days of leave requested' })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  totalDays?: number;

  @ApiPropertyOptional({ description: 'Additional notes for the leave request' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether this is paid or unpaid leave' })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}

// Approve Leave Request DTO
export class ApproveLeaveRequestDto {
  @ApiPropertyOptional({ description: 'Comments for approval' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;
}

// Reject Leave Request DTO
export class RejectLeaveRequestDto {
  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  @MaxLength(1000)
  comments: string;
}

// Bulk Approve Leave Requests DTO
export class BulkApproveLeaveRequestsDto {
  @ApiProperty({ 
    description: 'Array of leave request IDs to approve',
    type: [String],
  })
  @IsUUID(4, { each: true })
  leaveRequestIds: string[];

  @ApiPropertyOptional({ description: 'Comments for bulk approval' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;
}

// Leave Request Query DTO
export class LeaveRequestQueryDto {
  @ApiPropertyOptional({ 
    description: 'Filter by status',
    enum: LeaveRequestStatus,
  })
  @IsOptional()
  @IsEnum(LeaveRequestStatus)
  status?: LeaveRequestStatus;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by country code' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ description: 'Filter by client ID (for hr_manager_client role)' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Filter by leave type', enum: LeaveType })
  @IsOptional()
  @IsEnum(LeaveType)
  leaveType?: LeaveType;

  @ApiPropertyOptional({ description: 'Start date for date range filter' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for date range filter' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// Leave Request Response DTO
export class LeaveRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty({ enum: LeaveType })
  leaveType: LeaveType;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  totalDays: number;

  @ApiProperty({ enum: LeaveRequestStatus })
  status: LeaveRequestStatus;

  @ApiProperty({ required: false })
  notes: string | null;

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty({ required: false })
  payrollPeriodId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// Leave Balance Response DTO
export class LeaveBalanceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty({ enum: LeaveType })
  leaveType: LeaveType;

  @ApiProperty()
  totalDays: number;

  @ApiProperty()
  usedDays: number;

  @ApiProperty()
  availableDays: number;

  @ApiProperty()
  accrualRate: number;

  @ApiProperty()
  year: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// Payroll Ready Leaves DTO
export class PayrollReadyLeavesDto {
  @ApiProperty({ description: 'Payroll period ID' })
  @IsUUID()
  payrollPeriodId: string;

  @ApiPropertyOptional({ description: 'Country code filter' })
  @IsOptional()
  @IsString()
  countryCode?: string;
}

