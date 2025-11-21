import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for payroll calculation request
 */
export class CalculatePayrollDto {
  @ApiProperty({
    description: 'Country ID for payroll calculation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  countryId: string;

  @ApiProperty({
    description: 'Employee user ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Payroll period ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  payrollPeriodId: string;

  @ApiProperty({
    description: 'Calculation date (defaults to current date)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  calculationDate?: string;

  @ApiProperty({
    description: 'Include overtime calculations',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeOvertime?: boolean;

  @ApiProperty({
    description: 'Include night shift calculations',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeNightShift?: boolean;
}

/**
 * DTO for bulk payroll calculation request
 */
export class BulkCalculatePayrollDto {
  @ApiProperty({
    description: 'Country ID for payroll calculation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  countryId: string;

  @ApiProperty({
    description: 'Payroll period ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  payrollPeriodId: string;

  @ApiProperty({
    description: 'Array of employee user IDs',
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174003',
    ],
    type: [String],
  })
  @IsUUID('4', { each: true })
  userIds: string[];

  @ApiProperty({
    description: 'Calculation date (defaults to current date)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  calculationDate?: string;
}

/**
 * Breakdown of a single salary component
 */
export class ComponentBreakdown {
  @ApiProperty({ description: 'Component ID' })
  componentId: string;

  @ApiProperty({ description: 'Component name' })
  componentName: string;

  @ApiProperty({ description: 'Component type' })
  componentType: string;

  @ApiProperty({ description: 'Calculated amount' })
  amount: number;

  @ApiProperty({ description: 'Currency code' })
  currencyCode: string;

  @ApiProperty({ description: 'Calculation method used' })
  calculationMethod: string;

  @ApiProperty({ description: 'Base amount for percentage calculations', required: false })
  baseAmount?: number;

  @ApiProperty({ description: 'Rate or percentage applied', required: false })
  rate?: number;
}

/**
 * Breakdown of a single statutory deduction
 */
export class StatutoryBreakdown {
  @ApiProperty({ description: 'Statutory component ID' })
  componentId: string;

  @ApiProperty({ description: 'Statutory component name' })
  componentName: string;

  @ApiProperty({ description: 'Statutory component type' })
  componentType: string;

  @ApiProperty({ description: 'Employee contribution amount' })
  employeeContribution: number;

  @ApiProperty({ description: 'Employer contribution amount' })
  employerContribution: number;

  @ApiProperty({ description: 'Total contribution amount' })
  totalContribution: number;

  @ApiProperty({ description: 'Currency code' })
  currencyCode: string;

  @ApiProperty({ description: 'Calculation basis' })
  calculationBasis: string;

  @ApiProperty({ description: 'Rate or percentage applied', required: false })
  rate?: number;
}

/**
 * Payroll calculation result
 */
export class PayrollCalculationResult {
  @ApiProperty({ description: 'Calculation ID' })
  calculationId: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Country ID' })
  countryId: string;

  @ApiProperty({ description: 'Payroll period ID' })
  payrollPeriodId: string;

  @ApiProperty({ description: 'Calculation timestamp' })
  calculatedAt: Date;

  @ApiProperty({ description: 'Gross pay amount' })
  grossPay: number;

  @ApiProperty({ description: 'Basic salary amount' })
  basicSalary: number;

  @ApiProperty({ description: 'Total earnings (including allowances)' })
  totalEarnings: number;

  @ApiProperty({ description: 'Overtime pay', required: false })
  overtimePay?: number;

  @ApiProperty({ description: 'Night shift differential', required: false })
  nightShiftPay?: number;

  @ApiProperty({ description: 'Total statutory deductions' })
  totalStatutoryDeductions: number;

  @ApiProperty({ description: 'Total other deductions' })
  totalOtherDeductions: number;

  @ApiProperty({ description: 'Total deductions' })
  totalDeductions: number;

  @ApiProperty({ description: 'Net pay amount' })
  netPay: number;

  @ApiProperty({ description: 'Currency code' })
  currencyCode: string;

  @ApiProperty({
    description: 'Breakdown of salary components',
    type: [ComponentBreakdown],
  })
  @ValidateNested({ each: true })
  @Type(() => ComponentBreakdown)
  salaryComponents: ComponentBreakdown[];

  @ApiProperty({
    description: 'Breakdown of statutory deductions',
    type: [StatutoryBreakdown],
  })
  @ValidateNested({ each: true })
  @Type(() => StatutoryBreakdown)
  statutoryDeductions: StatutoryBreakdown[];

  @ApiProperty({
    description: 'Breakdown of other deductions',
    type: [ComponentBreakdown],
  })
  @ValidateNested({ each: true })
  @Type(() => ComponentBreakdown)
  otherDeductions: ComponentBreakdown[];

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Response DTO for payroll calculation
 */
export class PayrollCalculationResponse {
  @ApiProperty({ description: 'Payroll calculation result' })
  @ValidateNested()
  @Type(() => PayrollCalculationResult)
  result: PayrollCalculationResult;

  @ApiProperty({ description: 'Processing time in milliseconds' })
  @IsNumber()
  @Min(0)
  processingTimeMs: number;

  @ApiProperty({ description: 'Calculation status' })
  status: 'success' | 'partial' | 'failed';

  @ApiProperty({ description: 'Warning messages', required: false })
  warnings?: string[];

  @ApiProperty({ description: 'Error messages', required: false })
  errors?: string[];
}

/**
 * Response DTO for bulk payroll calculation
 */
export class BulkPayrollCalculationResponse {
  @ApiProperty({
    description: 'Array of payroll calculation results',
    type: [PayrollCalculationResult],
  })
  @ValidateNested({ each: true })
  @Type(() => PayrollCalculationResult)
  results: PayrollCalculationResult[];

  @ApiProperty({ description: 'Total number of calculations requested' })
  totalRequested: number;

  @ApiProperty({ description: 'Number of successful calculations' })
  successCount: number;

  @ApiProperty({ description: 'Number of failed calculations' })
  failedCount: number;

  @ApiProperty({ description: 'Total processing time in milliseconds' })
  @IsNumber()
  @Min(0)
  processingTimeMs: number;

  @ApiProperty({ description: 'Failed user IDs', required: false })
  failedUserIds?: string[];

  @ApiProperty({ description: 'Error details', required: false })
  errors?: Array<{ userId: string; error: string }>;
}

