import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsDate,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TimesheetStatus, TimesheetType } from '../entities/timesheet.entity';

export class DailyHoursDto {
  @ApiProperty({ description: 'Regular hours', example: 8.0, minimum: 0, maximum: 24 })
  @IsNumber()
  @Min(0)
  @Max(24)
  regularHours: number;

  @ApiProperty({ description: 'Overtime hours', example: 0, minimum: 0, maximum: 24 })
  @IsNumber()
  @Min(0)
  @Max(24)
  overtimeHours: number;

  @ApiProperty({ description: 'Double overtime hours', example: 0, minimum: 0, maximum: 24 })
  @IsNumber()
  @Min(0)
  @Max(24)
  doubleOvertimeHours: number;

  @ApiProperty({ description: 'Night shift hours', example: 0, minimum: 0, maximum: 24 })
  @IsNumber()
  @Min(0)
  @Max(24)
  nightShiftHours: number;
}

export class WeeklyHoursBreakdownDto {
  @ApiProperty({ description: 'Monday hours', type: DailyHoursDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DailyHoursDto)
  monday?: DailyHoursDto;

  @ApiProperty({ description: 'Tuesday hours', type: DailyHoursDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DailyHoursDto)
  tuesday?: DailyHoursDto;

  @ApiProperty({ description: 'Wednesday hours', type: DailyHoursDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DailyHoursDto)
  wednesday?: DailyHoursDto;

  @ApiProperty({ description: 'Thursday hours', type: DailyHoursDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DailyHoursDto)
  thursday?: DailyHoursDto;

  @ApiProperty({ description: 'Friday hours', type: DailyHoursDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DailyHoursDto)
  friday?: DailyHoursDto;

  @ApiProperty({ description: 'Saturday hours', type: DailyHoursDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DailyHoursDto)
  saturday?: DailyHoursDto;

  @ApiProperty({ description: 'Sunday hours', type: DailyHoursDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DailyHoursDto)
  sunday?: DailyHoursDto;
}

export class CreateTimesheetDto {
  @ApiProperty({
    description: 'User ID (employee)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Employment record ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  employmentRecordId: string;

  @ApiProperty({
    description: 'Payroll period ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  payrollPeriodId?: string;

  @ApiProperty({
    description: 'Timesheet type',
    enum: TimesheetType,
    example: TimesheetType.DAILY,
  })
  @IsEnum(TimesheetType)
  timesheetType: TimesheetType;

  @ApiProperty({
    description: 'Work date',
    example: '2024-01-15',
    type: String,
  })
  @IsString()
  workDate: string;

  @ApiProperty({
    description: 'Week start date (for weekly timesheets)',
    example: '2024-01-15',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  weekStartDate?: string;

  @ApiProperty({
    description: 'Week end date (for weekly timesheets)',
    example: '2024-01-21',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  weekEndDate?: string;

  @ApiProperty({
    description: 'Weekly hours breakdown (for weekly timesheets)',
    type: WeeklyHoursBreakdownDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WeeklyHoursBreakdownDto)
  weeklyHoursBreakdown?: WeeklyHoursBreakdownDto;

  @ApiProperty({
    description: 'Regular hours worked (for daily timesheets or aggregated weekly total)',
    example: 8.0,
    minimum: 0,
    maximum: 24,
  })
  @IsNumber()
  @Min(0)
  @Max(24)
  regularHours: number;

  @ApiProperty({
    description: 'Overtime hours (1.5x rate)',
    example: 2.0,
    minimum: 0,
    maximum: 24,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  overtimeHours?: number;

  @ApiProperty({
    description: 'Double overtime hours (2x rate)',
    example: 0,
    minimum: 0,
    maximum: 24,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  doubleOvertimeHours?: number;

  @ApiProperty({
    description: 'Night shift hours (for PH: 10% premium)',
    example: 0,
    minimum: 0,
    maximum: 24,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  nightShiftHours?: number;

  @ApiProperty({
    description: 'Notes or comments',
    example: 'Worked on project X',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Status (default: draft)',
    enum: TimesheetStatus,
    example: TimesheetStatus.DRAFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(TimesheetStatus)
  status?: TimesheetStatus;
}

export class UpdateTimesheetDto extends PartialType(CreateTimesheetDto) {
  @ApiProperty({
    description: 'Weekly hours breakdown (for weekly timesheets)',
    type: WeeklyHoursBreakdownDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WeeklyHoursBreakdownDto)
  weeklyHoursBreakdown?: WeeklyHoursBreakdownDto;
}

export class SubmitTimesheetDto {
  @ApiProperty({
    description: 'Timesheet IDs to submit',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsUUID('4', { each: true })
  timesheetIds: string[];

  @ApiProperty({
    description: 'Optional notes for submission',
    example: 'All hours verified',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveTimesheetDto {
  @ApiProperty({
    description: 'Comments for approval',
    example: 'Approved - hours verified',
    required: false,
  })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class RejectTimesheetDto {
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Hours do not match project records',
  })
  @IsString()
  reason: string;

  @ApiProperty({
    description: 'Additional comments',
    example: 'Please review and resubmit',
    required: false,
  })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class BulkApproveTimesheetsDto {
  @ApiProperty({
    description: 'Timesheet IDs to approve',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsUUID('4', { each: true })
  timesheetIds: string[];

  @ApiProperty({
    description: 'Comments for bulk approval',
    example: 'Batch approved for pay period',
    required: false,
  })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class TimesheetResponseDto {
  @ApiProperty({ description: 'Timesheet ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Employment record ID' })
  employmentRecordId: string;

  @ApiProperty({ description: 'Payroll period ID', nullable: true })
  payrollPeriodId: string | null;

  @ApiProperty({ description: 'Timesheet type', enum: TimesheetType })
  timesheetType: TimesheetType;

  @ApiProperty({ description: 'Work date' })
  workDate: string;

  @ApiProperty({ description: 'Week start date', nullable: true })
  weekStartDate: string | null;

  @ApiProperty({ description: 'Week end date', nullable: true })
  weekEndDate: string | null;

  @ApiProperty({ description: 'Weekly hours breakdown', type: WeeklyHoursBreakdownDto, nullable: true })
  weeklyHoursBreakdown: WeeklyHoursBreakdownDto | null;

  @ApiProperty({ description: 'Regular hours' })
  regularHours: number;

  @ApiProperty({ description: 'Overtime hours' })
  overtimeHours: number;

  @ApiProperty({ description: 'Double overtime hours' })
  doubleOvertimeHours: number;

  @ApiProperty({ description: 'Night shift hours' })
  nightShiftHours: number;

  @ApiProperty({ description: 'Total hours' })
  totalHours: number;

  @ApiProperty({ description: 'Status', enum: TimesheetStatus })
  status: TimesheetStatus;

  @ApiProperty({ description: 'Notes', nullable: true })
  notes: string | null;

  @ApiProperty({ description: 'Submitted at', nullable: true })
  submittedAt: Date | null;

  @ApiProperty({ description: 'Approved at', nullable: true })
  approvedAt: Date | null;

  @ApiProperty({ description: 'Approved by ID', nullable: true })
  approvedById: string | null;

  @ApiProperty({ description: 'Rejected at', nullable: true })
  rejectedAt: Date | null;

  @ApiProperty({ description: 'Rejected by ID', nullable: true })
  rejectedById: string | null;

  @ApiProperty({ description: 'Rejection reason', nullable: true })
  rejectionReason: string | null;

  @ApiProperty({ description: 'Payroll processed' })
  payrollProcessed: boolean;

  @ApiProperty({ description: 'Payroll processed at', nullable: true })
  payrollProcessedAt: Date | null;

  @ApiProperty({ description: 'Calculation metadata', nullable: true })
  calculationMetadata: any | null;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  @ApiProperty({ description: 'User details', required: false })
  user?: any;

  @ApiProperty({ description: 'Employment record details', required: false })
  employmentRecord?: any;

  @ApiProperty({ description: 'Approvals history', required: false, type: [Object] })
  approvals?: any[];
}

export class TimesheetListResponseDto {
  @ApiProperty({ description: 'Timesheets', type: [TimesheetResponseDto] })
  timesheets: TimesheetResponseDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  @ApiProperty({ description: 'Page number' })
  page: number;

  @ApiProperty({ description: 'Page size' })
  limit: number;
}

export class BulkOperationResultDto {
  @ApiProperty({ description: 'Number of successful operations' })
  success: number;

  @ApiProperty({ description: 'Number of failed operations' })
  failed: number;

  @ApiProperty({ description: 'Failed timesheet IDs with errors' })
  errors: { timesheetId: string; error: string }[];
}

