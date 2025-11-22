import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsArray, IsEnum } from 'class-validator';

/**
 * DTO for starting payroll processing
 */
export class StartPayrollProcessingDto {
  @ApiProperty({ description: 'Payroll period ID to process' })
  @IsUUID(4, { message: 'Period ID must be a valid UUID' })
  periodId: string;

  @ApiProperty({ description: 'Optional: Specific user IDs to process (empty = all employees)', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  userIds?: string[];
}

/**
 * DTO for stopping payroll processing
 */
export class StopPayrollProcessingDto {
  @ApiProperty({ description: 'Processing log ID to stop' })
  @IsUUID(4, { message: 'Log ID must be a valid UUID' })
  logId: string;
}

/**
 * DTO for retrying failed employees
 */
export class RetryFailedEmployeesDto {
  @ApiProperty({ description: 'Processing log ID to retry' })
  @IsUUID(4, { message: 'Log ID must be a valid UUID' })
  logId: string;

  @ApiProperty({ description: 'Optional: Specific user IDs to retry (empty = all failed)', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  userIds?: string[];
}

/**
 * Response DTO for processing status
 */
export class ProcessingStatusResponseDto {
  @ApiProperty()
  periodId: string;

  @ApiProperty()
  periodName: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty({ enum: ['DRAFT', 'OPEN', 'PROCESSING', 'COMPLETED', 'CLOSED'] })
  periodStatus: string;

  @ApiProperty()
  logId: string | null;

  @ApiProperty({ enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'] })
  processingStatus: string | null;

  @ApiProperty()
  totalEmployees: number;

  @ApiProperty()
  processedEmployees: number;

  @ApiProperty()
  failedEmployees: number;

  @ApiProperty()
  successEmployees: number;

  @ApiProperty()
  startedAt: Date | null;

  @ApiProperty()
  completedAt: Date | null;

  @ApiProperty()
  processingTimeMs: number | null;

  @ApiProperty()
  errors: any[];

  @ApiProperty()
  metadata: any;
}

/**
 * Response DTO for starting processing
 */
export class StartProcessingResponseDto {
  @ApiProperty()
  logId: string;

  @ApiProperty()
  periodId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalEmployees: number;

  @ApiProperty()
  message: string;
}

