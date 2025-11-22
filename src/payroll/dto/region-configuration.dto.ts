import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsBoolean,
  IsOptional,
  MaxLength,
  IsObject,
} from 'class-validator';

export class CreateRegionConfigurationDto {
  @ApiProperty({
    description: 'Country ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  countryId: string;

  @ApiProperty({
    description: 'Configuration key',
    example: 'overtime_multiplier',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  configKey: string;

  @ApiProperty({
    description: 'Configuration value (JSON)',
    example: { multiplier: 2.0 },
  })
  @IsObject()
  configValue: any;

  @ApiPropertyOptional({
    description: 'Configuration description',
    example: 'Overtime rate multiplier for India',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the configuration is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRegionConfigurationDto {
  @ApiPropertyOptional({
    description: 'Configuration value (JSON)',
    example: { multiplier: 2.0 },
  })
  @IsOptional()
  @IsObject()
  configValue?: any;

  @ApiPropertyOptional({
    description: 'Configuration description',
    example: 'Overtime rate multiplier for India',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the configuration is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RegionConfigurationResponseDto {
  @ApiProperty({
    description: 'Configuration ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Country ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  countryId: string;

  @ApiProperty({
    description: 'Configuration key',
    example: 'overtime_multiplier',
  })
  configKey: string;

  @ApiProperty({
    description: 'Configuration value (JSON)',
    example: { multiplier: 2.0 },
  })
  configValue: any;

  @ApiProperty({
    description: 'Configuration description',
    example: 'Overtime rate multiplier for India',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Whether the configuration is active',
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

