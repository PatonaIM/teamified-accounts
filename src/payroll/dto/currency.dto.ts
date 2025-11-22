import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty({
    description: 'ISO 4217 currency code',
    example: 'INR',
    maxLength: 3,
  })
  @IsString()
  @MaxLength(3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'Currency code must be 3 uppercase letters (ISO 4217)',
  })
  code: string;

  @ApiProperty({
    description: 'Currency name',
    example: 'Indian Rupee',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Currency symbol',
    example: '₹',
    maxLength: 10,
  })
  @IsString()
  @MaxLength(10)
  symbol: string;

  @ApiPropertyOptional({
    description: 'Number of decimal places',
    example: 2,
    default: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  decimalPlaces?: number;

  @ApiPropertyOptional({
    description: 'Whether the currency is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCurrencyDto {
  @ApiPropertyOptional({
    description: 'Currency name',
    example: 'Indian Rupee',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Currency symbol',
    example: '₹',
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  symbol?: string;

  @ApiPropertyOptional({
    description: 'Number of decimal places',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  decimalPlaces?: number;

  @ApiPropertyOptional({
    description: 'Whether the currency is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CurrencyResponseDto {
  @ApiProperty({
    description: 'Currency ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'ISO 4217 currency code',
    example: 'INR',
  })
  code: string;

  @ApiProperty({
    description: 'Currency name',
    example: 'Indian Rupee',
  })
  name: string;

  @ApiProperty({
    description: 'Currency symbol',
    example: '₹',
  })
  symbol: string;

  @ApiProperty({
    description: 'Number of decimal places',
    example: 2,
  })
  decimalPlaces: number;

  @ApiProperty({
    description: 'Whether the currency is active',
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

export class CurrencyConversionDto {
  @ApiProperty({
    description: 'Source currency code',
    example: 'USD',
  })
  @IsString()
  @MaxLength(3)
  fromCurrency: string;

  @ApiProperty({
    description: 'Target currency code',
    example: 'INR',
  })
  @IsString()
  @MaxLength(3)
  toCurrency: string;

  @ApiProperty({
    description: 'Amount to convert',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CurrencyConversionResponseDto {
  @ApiProperty({
    description: 'Source currency code',
    example: 'USD',
  })
  fromCurrency: string;

  @ApiProperty({
    description: 'Target currency code',
    example: 'INR',
  })
  toCurrency: string;

  @ApiProperty({
    description: 'Original amount',
    example: 100,
  })
  amount: number;

  @ApiProperty({
    description: 'Converted amount',
    example: 8350,
  })
  convertedAmount: number;

  @ApiProperty({
    description: 'Exchange rate used',
    example: 83.5,
  })
  rate: number;

  @ApiProperty({
    description: 'Effective date of the rate',
    example: '2024-01-01',
  })
  effectiveDate: Date;
}

