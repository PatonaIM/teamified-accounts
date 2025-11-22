import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsInt,
  IsBoolean,
  IsOptional,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code',
    example: 'IN',
    maxLength: 3,
  })
  @IsString()
  @MaxLength(3)
  @Matches(/^[A-Z]{2,3}$/, {
    message: 'Country code must be 2-3 uppercase letters (ISO 3166-1 alpha-2)',
  })
  code: string;

  @ApiProperty({
    description: 'Country name',
    example: 'India',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Currency ID for the country',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  currencyId: string;

  @ApiProperty({
    description: 'Tax year start month (1-12)',
    example: 4,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  taxYearStartMonth: number;

  @ApiPropertyOptional({
    description: 'Whether the country is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCountryDto {
  @ApiPropertyOptional({
    description: 'Country name',
    example: 'India',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Currency ID for the country',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  currencyId?: string;

  @ApiPropertyOptional({
    description: 'Tax year start month (1-12)',
    example: 4,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  taxYearStartMonth?: number;

  @ApiPropertyOptional({
    description: 'Whether the country is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CountryResponseDto {
  @ApiProperty({
    description: 'Country ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code',
    example: 'IN',
  })
  code: string;

  @ApiProperty({
    description: 'Country name',
    example: 'India',
  })
  name: string;

  @ApiProperty({
    description: 'Currency ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  currencyId: string;

  @ApiProperty({
    description: 'Tax year start month',
    example: 4,
  })
  taxYearStartMonth: number;

  @ApiProperty({
    description: 'Whether the country is active',
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

