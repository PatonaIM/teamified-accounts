import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { PayrollPeriodStatus } from '../entities/payroll-period.entity';

export class CreatePayrollPeriodDto {
  @ApiProperty({
    description: 'Country ID (UUID) or Country Code (e.g., "IN", "AU")',
    example: 'IN',
  })
  @IsString()
  @Matches(/^([A-Z]{2,3}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i, {
    message: 'countryId must be a valid country code (2-3 letters) or UUID',
  })
  countryId: string;

  @ApiProperty({
    description: 'Period name',
    example: 'January 2024',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  periodName: string;

  @ApiProperty({
    description: 'Period start date',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Period end date',
    example: '2024-01-31',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Pay date',
    example: '2024-02-05',
  })
  @IsDateString()
  payDate: string;

  @ApiPropertyOptional({
    description: 'Period status',
    example: PayrollPeriodStatus.DRAFT,
    enum: PayrollPeriodStatus,
    default: PayrollPeriodStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(PayrollPeriodStatus)
  status?: PayrollPeriodStatus;
}

export class UpdatePayrollPeriodDto {
  @ApiPropertyOptional({
    description: 'Period name',
    example: 'January 2024',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  periodName?: string;

  @ApiPropertyOptional({
    description: 'Period start date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Period end date',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Pay date',
    example: '2024-02-05',
  })
  @IsOptional()
  @IsDateString()
  payDate?: string;

  @ApiPropertyOptional({
    description: 'Period status',
    example: PayrollPeriodStatus.OPEN,
    enum: PayrollPeriodStatus,
  })
  @IsOptional()
  @IsEnum(PayrollPeriodStatus)
  status?: PayrollPeriodStatus;

  @ApiPropertyOptional({
    description: 'Total number of employees',
    example: 150,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalEmployees?: number;

  @ApiPropertyOptional({
    description: 'Total payroll amount',
    example: 1500000.50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;
}

export class PayrollPeriodResponseDto {
  @ApiProperty({
    description: 'Period ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Country ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  countryId: string;

  @ApiProperty({
    description: 'Period name',
    example: 'January 2024',
  })
  periodName: string;

  @ApiProperty({
    description: 'Period start date',
    example: '2024-01-01',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Period end date',
    example: '2024-01-31',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Pay date',
    example: '2024-02-05',
  })
  payDate: Date;

  @ApiProperty({
    description: 'Period status',
    example: PayrollPeriodStatus.DRAFT,
    enum: PayrollPeriodStatus,
  })
  status: PayrollPeriodStatus;

  @ApiProperty({
    description: 'Total number of employees',
    example: 150,
  })
  totalEmployees: number;

  @ApiProperty({
    description: 'Total payroll amount',
    example: 1500000.50,
  })
  totalAmount: number;

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

