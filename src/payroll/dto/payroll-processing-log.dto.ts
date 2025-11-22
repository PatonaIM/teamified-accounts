import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  IsString,
  IsObject,
  IsOptional,
  Min,
} from 'class-validator';
import { ProcessingStatus } from '../entities/payroll-processing-log.entity';

export class CreatePayrollProcessingLogDto {
  @ApiProperty({
    description: 'Country ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  countryId: string;

  @ApiPropertyOptional({
    description: 'Payroll period ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  payrollPeriodId?: string;

  @ApiProperty({
    description: 'Processing status',
    example: ProcessingStatus.STARTED,
    enum: ProcessingStatus,
    default: ProcessingStatus.STARTED,
  })
  @IsEnum(ProcessingStatus)
  status: ProcessingStatus;

  @ApiProperty({
    description: 'Processing start timestamp',
    example: '2024-01-01T10:00:00Z',
  })
  @IsDateString()
  startedAt: string;

  @ApiPropertyOptional({
    description: 'Processing metadata (JSON)',
    example: { batchSize: 100, processingMode: 'async' },
  })
  @IsOptional()
  @IsObject()
  processingMetadata?: any;
}

export class UpdatePayrollProcessingLogDto {
  @ApiPropertyOptional({
    description: 'Processing status',
    example: ProcessingStatus.IN_PROGRESS,
    enum: ProcessingStatus,
  })
  @IsOptional()
  @IsEnum(ProcessingStatus)
  status?: ProcessingStatus;

  @ApiPropertyOptional({
    description: 'Processing completion timestamp',
    example: '2024-01-01T10:05:00Z',
  })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({
    description: 'Number of employees processed',
    example: 95,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  employeesProcessed?: number;

  @ApiPropertyOptional({
    description: 'Number of employees failed',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  employeesFailed?: number;

  @ApiPropertyOptional({
    description: 'Error message',
    example: 'Database connection error',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Error details (JSON)',
    example: { code: 'DB_ERROR', affectedEmployees: [1, 2, 3] },
  })
  @IsOptional()
  @IsObject()
  errorDetails?: any;

  @ApiPropertyOptional({
    description: 'Processing metadata (JSON)',
    example: { processingDuration: 120000, batchesProcessed: 10 },
  })
  @IsOptional()
  @IsObject()
  processingMetadata?: any;
}

export class PayrollProcessingLogResponseDto {
  @ApiProperty({
    description: 'Log ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Country ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  countryId: string;

  @ApiProperty({
    description: 'Payroll period ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  payrollPeriodId: string | null;

  @ApiProperty({
    description: 'Processing status',
    example: ProcessingStatus.COMPLETED,
    enum: ProcessingStatus,
  })
  status: ProcessingStatus;

  @ApiProperty({
    description: 'Processing start timestamp',
    example: '2024-01-01T10:00:00Z',
  })
  startedAt: Date;

  @ApiProperty({
    description: 'Processing completion timestamp',
    example: '2024-01-01T10:05:00Z',
    nullable: true,
  })
  completedAt: Date | null;

  @ApiProperty({
    description: 'Number of employees processed',
    example: 95,
  })
  employeesProcessed: number;

  @ApiProperty({
    description: 'Number of employees failed',
    example: 5,
  })
  employeesFailed: number;

  @ApiProperty({
    description: 'Error message',
    example: null,
    nullable: true,
  })
  errorMessage: string | null;

  @ApiProperty({
    description: 'Error details (JSON)',
    example: null,
    nullable: true,
  })
  errorDetails: any | null;

  @ApiProperty({
    description: 'Processing metadata (JSON)',
    example: { processingDuration: 120000 },
    nullable: true,
  })
  processingMetadata: any | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  updatedAt: Date;
}

