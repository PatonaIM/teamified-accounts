import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { StatutoryBreakdown } from './payroll-calculation.dto';

export class YtdContributionQueryDto {
  @ApiProperty({
    description: 'Country ID for contribution tracking',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  countryId: string;

  @ApiProperty({
    description: 'Start date for YTD calculation (ISO 8601)',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for YTD calculation (ISO 8601)',
    example: '2024-12-31',
  })
  @IsDateString()
  endDate: string;
}

export class ContributionHistoryQueryDto {
  @ApiProperty({
    description: 'Optional country ID to filter contributions',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  countryId?: string;

  @ApiProperty({
    description: 'Number of recent payslips to retrieve',
    required: false,
    default: 12,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 12;
}

export class ContributionByTypeDto {
  @ApiProperty({ description: 'Component name', example: 'Employee Provident Fund' })
  componentName: string;

  @ApiProperty({ description: 'Component code', example: 'EPF' })
  componentCode: string;

  @ApiProperty({ description: 'Total employee contribution amount', example: 1800.0 })
  totalEmployee: number;

  @ApiProperty({ description: 'Total employer contribution amount', example: 1800.0 })
  totalEmployer: number;

  @ApiProperty({ description: 'Total contribution amount', example: 3600.0 })
  totalContribution: number;

  @ApiProperty({ description: 'Number of occurrences in period', example: 12 })
  occurrences: number;
}

export class ContributionSummaryResponseDto {
  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  userId: string;

  @ApiProperty({ description: 'Country ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  countryId: string;

  @ApiProperty({ description: 'Currency code', example: 'INR' })
  currencyCode: string;

  @ApiProperty({
    description: 'Period details',
    example: { startDate: '2024-01-01T00:00:00.000Z', endDate: '2024-12-31T23:59:59.999Z' },
  })
  period: {
    startDate: Date;
    endDate: Date;
  };

  @ApiProperty({ description: 'Total contributions (employee + employer)', example: 43200.0 })
  totalContributions: number;

  @ApiProperty({ description: 'Total employee contributions', example: 21600.0 })
  totalEmployeeContributions: number;

  @ApiProperty({ description: 'Total employer contributions', example: 21600.0 })
  totalEmployerContributions: number;

  @ApiProperty({
    description: 'Breakdown by contribution type',
    type: [ContributionByTypeDto],
  })
  contributionsByType: ContributionByTypeDto[];
}

export class ContributionHistoryItemDto {
  @ApiProperty({ description: 'Payslip ID', example: '123e4567-e89b-12d3-a456-426614174002' })
  payslipId: string;

  @ApiProperty({ description: 'Payroll period ID', example: '123e4567-e89b-12d3-a456-426614174003' })
  payrollPeriodId: string;

  @ApiProperty({ description: 'Period name', example: 'January 2024' })
  periodName: string;

  @ApiProperty({ description: 'Calculation timestamp', example: '2024-01-31T23:59:59.000Z' })
  calculatedAt: Date;

  @ApiProperty({
    description: 'Statutory contributions for this period',
    type: [StatutoryBreakdown],
  })
  contributions: StatutoryBreakdown[];

  @ApiProperty({ description: 'Total statutory deductions for this period', example: 3600.0 })
  totalStatutoryDeductions: number;
}

export class ContributionHistoryResponseDto {
  @ApiProperty({
    description: 'Array of contribution history items',
    type: [ContributionHistoryItemDto],
  })
  data: ContributionHistoryItemDto[];

  @ApiProperty({ description: 'Total number of items', example: 12 })
  total: number;
}

export class ContributionComparisonQueryDto {
  @ApiProperty({
    description: 'Country ID for contribution comparison',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  countryId: string;

  @ApiProperty({
    description: 'Period 1 start date (ISO 8601)',
    example: '2023-01-01',
  })
  @IsDateString()
  period1Start: string;

  @ApiProperty({
    description: 'Period 1 end date (ISO 8601)',
    example: '2023-12-31',
  })
  @IsDateString()
  period1End: string;

  @ApiProperty({
    description: 'Period 2 start date (ISO 8601)',
    example: '2024-01-01',
  })
  @IsDateString()
  period2Start: string;

  @ApiProperty({
    description: 'Period 2 end date (ISO 8601)',
    example: '2024-12-31',
  })
  @IsDateString()
  period2End: string;
}

export class ContributionComparisonResponseDto {
  @ApiProperty({
    description: 'Period 1 contribution summary',
    type: ContributionSummaryResponseDto,
  })
  period1: ContributionSummaryResponseDto;

  @ApiProperty({
    description: 'Period 2 contribution summary',
    type: ContributionSummaryResponseDto,
  })
  period2: ContributionSummaryResponseDto;

  @ApiProperty({
    description: 'Absolute difference between periods',
    example: 5400.0,
  })
  difference: number;

  @ApiProperty({
    description: 'Percentage change between periods',
    example: 12.5,
  })
  percentageChange: number;
}

