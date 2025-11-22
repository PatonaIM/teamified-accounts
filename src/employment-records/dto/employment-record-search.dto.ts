import { IsOptional, IsString, IsUUID, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class EmploymentRecordSearchDto {
  @ApiProperty({ description: 'Page number for pagination', minimum: 1, default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Number of records per page', minimum: 1, maximum: 100, default: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ description: 'Search term for user name, client name, or role', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: 'Filter by employment status', 
    enum: ['onboarding', 'active', 'inactive', 'offboarding', 'terminated', 'completed'],
    required: false 
  })
  @IsOptional()
  @IsIn(['onboarding', 'active', 'inactive', 'offboarding', 'terminated', 'completed'])
  status?: 'onboarding' | 'active' | 'inactive' | 'offboarding' | 'terminated' | 'completed';

  @ApiProperty({ description: 'Filter by client ID', required: false })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ 
    description: 'Filter by country code (for payroll employee selection)', 
    example: 'IN',
    required: false 
  })
  @IsOptional()
  @IsString()
  countryId?: string;  // Note: Named countryId for backward compatibility, but accepts country code (e.g., 'IN', 'PH', 'AU')

  @ApiProperty({ 
    description: 'Sort field', 
    enum: ['createdAt', 'updatedAt', 'startDate', 'endDate', 'status', 'role'],
    default: 'createdAt',
    required: false 
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'startDate', 'endDate', 'status', 'role'])
  sort?: string = 'createdAt';

  @ApiProperty({ 
    description: 'Sort order', 
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value?.toString().toUpperCase())
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}
