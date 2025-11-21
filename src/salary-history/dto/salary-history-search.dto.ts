import { IsOptional, IsUUID, IsString, IsDateString, IsDecimal, IsBoolean, IsIn, Min, Max, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SalaryHistorySearchDto {
  @ApiProperty({
    description: 'Employment record ID to filter by',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: 'Employment record ID must be a valid UUID' })
  employmentRecordId?: string;

  @ApiProperty({
    description: 'User ID to filter by',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId?: string;

  @ApiProperty({
    description: 'Client ID to filter by',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: 'Client ID must be a valid UUID' })
  clientId?: string;

  @ApiProperty({
    description: 'Currency code to filter by',
    example: 'USD',
    required: false,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL'],
  })
  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  @IsIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL'], { message: 'Currency must be one of: USD, EUR, GBP, CAD, AUD, JPY, CHF, CNY, INR, BRL' })
  currency?: string;

  @ApiProperty({
    description: 'Minimum salary amount',
    example: 50000.00,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum amount must be a valid number' })
  @Min(0, { message: 'Minimum amount must be greater than or equal to 0' })
  @Type(() => Number)
  minAmount?: number;

  @ApiProperty({
    description: 'Maximum salary amount',
    example: 100000.00,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maximum amount must be a valid number' })
  @Min(0, { message: 'Maximum amount must be greater than or equal to 0' })
  @Type(() => Number)
  maxAmount?: number;

  @ApiProperty({
    description: 'Start date for date range filter',
    example: '2024-01-01',
    required: false,
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date string' })
  startDate?: string;

  @ApiProperty({
    description: 'End date for date range filter',
    example: '2024-12-31',
    required: false,
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date string' })
  endDate?: string;

  @ApiProperty({
    description: 'Filter by scheduled changes (future effective dates)',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isScheduled must be a boolean value' })
  @Type(() => Boolean)
  isScheduled?: boolean;

  @ApiProperty({
    description: 'Field to sort by',
    example: 'effectiveDate',
    required: false,
    enum: ['effectiveDate', 'salaryAmount', 'createdAt', 'changeReason'],
  })
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  @IsIn(['effectiveDate', 'salaryAmount', 'createdAt', 'changeReason'], { message: 'Sort field must be one of: effectiveDate, salaryAmount, createdAt, changeReason' })
  sortField?: string;

  @ApiProperty({
    description: 'Sort order',
    example: 'DESC',
    required: false,
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  @IsIn(['ASC', 'DESC'], { message: 'Sort order must be either ASC or DESC' })
  sortOrder?: 'ASC' | 'DESC';

  @ApiProperty({
    description: 'Maximum number of results to return',
    example: 50,
    required: false,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(1000, { message: 'Limit cannot exceed 1000' })
  limit?: number;

  @ApiProperty({
    description: 'Number of results to skip',
    example: 0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'Offset must be at least 0' })
  offset?: number;
}
