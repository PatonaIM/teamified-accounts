import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, Length, Matches } from 'class-validator';

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  INTERNAL = 'internal',
}

export class CreateOrganizationDto {
  @ApiProperty({ 
    description: 'Organization name',
    example: 'Acme Corporation',
    minLength: 2,
    maxLength: 255
  })
  @IsString()
  @Length(2, 255)
  name: string;

  @ApiProperty({ 
    description: 'URL-friendly slug for the organization (lowercase, alphanumeric and hyphens only)',
    example: 'acme-corp',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only (e.g., acme-corp)'
  })
  slug: string;

  @ApiProperty({ 
    description: 'Industry of the organization',
    example: 'Technology',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  industry?: string;

  @ApiProperty({ 
    description: 'Size of the company (e.g., 1-10, 11-50, 51-200, 201-500, 500+)',
    example: '11-50',
    required: false,
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  companySize?: string;

  @ApiProperty({ 
    description: 'URL to organization logo',
    example: 'https://example.com/logo.png',
    required: false
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ 
    description: 'Organization website URL',
    example: 'https://example.com',
    required: false
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ 
    description: 'Subscription tier',
    enum: SubscriptionTier,
    example: 'free',
    required: false,
    default: 'free'
  })
  @IsOptional()
  @IsEnum(SubscriptionTier)
  subscriptionTier?: SubscriptionTier;
}
