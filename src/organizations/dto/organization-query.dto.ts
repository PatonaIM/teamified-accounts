import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class OrganizationQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search query for organization name or slug' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by industry' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Filter by company size' })
  @IsOptional()
  @IsString()
  companySize?: string;

  @ApiPropertyOptional({ description: 'Filter by status (active/inactive)', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by subscription tier', enum: ['free', 'basic', 'pro', 'enterprise'] })
  @IsOptional()
  @IsString()
  @IsIn(['free', 'basic', 'pro', 'enterprise'])
  subscriptionTier?: string;
}

export class PaginatedOrganizationResponseDto {
  @ApiPropertyOptional({ description: 'List of organizations' })
  organizations: any[];

  @ApiPropertyOptional({ description: 'Pagination metadata' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
