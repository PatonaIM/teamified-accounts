import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  IsDateString,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateTaxYearDto {
  @ApiProperty({
    description: 'Country ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  countryId: string;

  @ApiProperty({
    description: 'Tax year',
    example: 2024,
  })
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty({
    description: 'Tax year start date',
    example: '2024-04-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Tax year end date',
    example: '2025-03-31',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Whether this is the current tax year',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

export class UpdateTaxYearDto {
  @ApiPropertyOptional({
    description: 'Tax year start date',
    example: '2024-04-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Tax year end date',
    example: '2025-03-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Whether this is the current tax year',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

export class TaxYearResponseDto {
  @ApiProperty({
    description: 'Tax year ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Country ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  countryId: string;

  @ApiProperty({
    description: 'Tax year',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: 'Tax year start date',
    example: '2024-04-01',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Tax year end date',
    example: '2025-03-31',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Whether this is the current tax year',
    example: true,
  })
  isCurrent: boolean;

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

