import { PartialType } from '@nestjs/swagger';
import { CreateEmploymentRecordDto } from './create-employment-record.dto';
import { IsOptional, IsDateString, IsIn, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateEmploymentRecordDto extends PartialType(CreateEmploymentRecordDto) {
  @ApiProperty({ description: 'Employment start date', example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Employment end date', example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Employment status',
    enum: ['onboarding', 'active', 'inactive', 'offboarding', 'terminated', 'completed'],
    required: false
  })
  @IsOptional()
  @IsIn(['onboarding', 'active', 'inactive', 'offboarding', 'terminated', 'completed'])
  status?: 'onboarding' | 'active' | 'inactive' | 'offboarding' | 'terminated' | 'completed';

  @ApiProperty({ description: 'Timestamp when onboarding was submitted', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  onboardingSubmittedAt?: Date;
}
