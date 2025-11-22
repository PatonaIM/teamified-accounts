import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateExchangeRateDto {
  @ApiProperty({
    description: 'Source currency ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  fromCurrencyId: string;

  @ApiProperty({
    description: 'Target currency ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  toCurrencyId: string;

  @ApiProperty({
    description: 'Exchange rate',
    example: 83.5,
  })
  @IsNumber({}, { message: 'Rate must be a valid number' })
  @Min(0.000001, { message: 'Rate must be greater than 0' })
  rate: number;

  @ApiProperty({
    description: 'Effective date of the rate',
    example: '2024-01-01',
  })
  @IsDateString()
  effectiveDate: string;

  @ApiPropertyOptional({
    description: 'Whether the rate is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateExchangeRateDto {
  @ApiPropertyOptional({
    description: 'Exchange rate',
    example: 83.5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Rate must be a valid number' })
  @Min(0.000001, { message: 'Rate must be greater than 0' })
  rate?: number;

  @ApiPropertyOptional({
    description: 'Effective date of the rate',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({
    description: 'Whether the rate is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ExchangeRateResponseDto {
  @ApiProperty({
    description: 'Exchange rate ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Source currency ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  fromCurrencyId: string;

  @ApiProperty({
    description: 'Target currency ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  toCurrencyId: string;

  @ApiProperty({
    description: 'Exchange rate',
    example: 83.5,
  })
  rate: number;

  @ApiProperty({
    description: 'Effective date of the rate',
    example: '2024-01-01',
  })
  effectiveDate: Date;

  @ApiProperty({
    description: 'Whether the rate is active',
    example: true,
  })
  isActive: boolean;

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

