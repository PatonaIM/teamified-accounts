import { IsUUID, IsDateString, IsString, IsOptional, IsIn, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmploymentRecordDto {
  @ApiProperty({ description: 'User ID for the employment record' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Client ID for the employment record' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'Country ID for the employment record (Story 7.8.2)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  countryId: string;

  @ApiProperty({ description: 'Employment start date', example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Employment end date (optional for active employment)', example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Role in the employment', example: 'Software Engineer', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  role: string;

  @ApiProperty({ 
    description: 'Employment status', 
    enum: ['onboarding', 'active', 'inactive', 'offboarding', 'terminated', 'completed'],
    default: 'active',
    required: false 
  })
  @IsOptional()
  @IsIn(['onboarding', 'active', 'inactive', 'offboarding', 'terminated', 'completed'])
  status?: 'onboarding' | 'active' | 'inactive' | 'offboarding' | 'terminated' | 'completed';

  @ApiProperty({ description: 'Whether this record was migrated from Zoho', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  migratedFromZoho?: boolean;

  @ApiProperty({ description: 'Zoho employment ID for migrated records', maxLength: 100, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  zohoEmploymentId?: string;
}
