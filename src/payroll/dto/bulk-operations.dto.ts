import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, IsOptional, IsEnum } from 'class-validator';

/**
 * DTO for bulk payroll processing across multiple periods
 */
export class BulkProcessPayrollDto {
  @ApiProperty({ description: 'Array of payroll period IDs to process' })
  @IsArray()
  @IsUUID(4, { each: true })
  periodIds: string[];

  @ApiProperty({ description: 'Optional: Specific user IDs to process (empty = all employees)', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  userIds?: string[];
}

/**
 * DTO for bulk period closure
 */
export class BulkClosePeriodDto {
  @ApiProperty({ description: 'Array of payroll period IDs to close' })
  @IsArray()
  @IsUUID(4, { each: true })
  periodIds: string[];

  @ApiProperty({ description: 'Force close even if processing not complete', required: false })
  @IsOptional()
  forceClose?: boolean;
}

/**
 * DTO for bulk period opening
 */
export class BulkOpenPeriodDto {
  @ApiProperty({ description: 'Array of payroll period IDs to open' })
  @IsArray()
  @IsUUID(4, { each: true })
  periodIds: string[];
}

/**
 * Response DTO for bulk operations
 */
export class BulkOperationResponseDto {
  @ApiProperty()
  totalRequested: number;

  @ApiProperty()
  successCount: number;

  @ApiProperty()
  failureCount: number;

  @ApiProperty()
  results: Array<{
    periodId: string;
    status: 'success' | 'failed';
    message?: string;
    error?: string;
    logId?: string;
  }>;
}

/**
 * DTO for validating periods before processing
 */
export class ValidatePeriodsDto {
  @ApiProperty({ description: 'Array of payroll period IDs to validate' })
  @IsArray()
  @IsUUID(4, { each: true })
  periodIds: string[];
}

/**
 * Response DTO for period validation
 */
export class PeriodValidationResponseDto {
  @ApiProperty()
  periodId: string;

  @ApiProperty()
  periodName: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty()
  isValid: boolean;

  @ApiProperty()
  canProcess: boolean;

  @ApiProperty()
  validationErrors: string[];

  @ApiProperty()
  validationWarnings: string[];

  @ApiProperty()
  estimatedEmployeeCount: number;
}

/**
 * DTO for processing progress updates
 */
export class ProcessingProgressDto {
  @ApiProperty()
  logId: string;

  @ApiProperty()
  periodId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalEmployees: number;

  @ApiProperty()
  processedEmployees: number;

  @ApiProperty()
  successEmployees: number;

  @ApiProperty()
  failedEmployees: number;

  @ApiProperty()
  progressPercentage: number;

  @ApiProperty()
  estimatedTimeRemainingMs: number | null;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty()
  lastUpdatedAt: Date;
}

