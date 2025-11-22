import { IsUUID, IsNumber, IsString, IsDateString, IsOptional, IsIn, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSalaryHistoryDto {
  @ApiProperty({
    description: 'Employment record ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID(4, { message: 'Employment record ID must be a valid UUID' })
  employmentRecordId: string;

  @ApiProperty({
    description: 'Salary amount',
    example: 75000.00,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Salary amount must be a valid number' })
  @Min(0.01, { message: 'Salary amount must be greater than 0' })
  @Transform(({ value }) => parseFloat(value))
  salaryAmount: number;

  @ApiProperty({
    description: 'Salary currency code (ISO 4217)',
    example: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL'],
  })
  @IsString({ message: 'Currency must be a string' })
  @IsIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL'], {
    message: 'Currency must be a valid ISO 4217 currency code',
  })
  salaryCurrency: string;

  @ApiProperty({
    description: 'Effective date for the salary change (can be up to 1 year in the future)',
    example: '2024-01-01',
    type: 'string',
    format: 'date',
  })
  @IsDateString({}, { message: 'Effective date must be a valid date string' })
  effectiveDate: string;

  @ApiProperty({
    description: 'Reason for the salary change',
    example: 'Annual performance review',
    maxLength: 100,
  })
  @IsString({ message: 'Change reason must be a string' })
  @MaxLength(100, { message: 'Change reason cannot exceed 100 characters' })
  changeReason: string;
}
