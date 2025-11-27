import { ApiProperty } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty({ 
    description: 'Organization unique identifier',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({ 
    description: 'Organization name',
    example: 'Acme Corporation'
  })
  name: string;

  @ApiProperty({ 
    description: 'URL-friendly slug',
    example: 'acme-corp'
  })
  slug: string;

  @ApiProperty({ 
    description: 'Industry of the organization',
    example: 'Technology',
    nullable: true
  })
  industry: string | null;

  @ApiProperty({ 
    description: 'Company size',
    example: '11-50',
    nullable: true
  })
  companySize: string | null;

  @ApiProperty({ 
    description: 'URL to organization logo',
    example: 'https://example.com/logo.png',
    nullable: true
  })
  logoUrl: string | null;

  @ApiProperty({ 
    description: 'Organization website URL',
    example: 'https://example.com',
    nullable: true
  })
  website: string | null;

  @ApiProperty({ 
    description: 'Organization settings (JSON)',
    example: { theme: 'light', notifications: true }
  })
  settings: Record<string, any>;

  @ApiProperty({ 
    description: 'Subscription tier',
    enum: ['free', 'basic', 'professional', 'enterprise', 'internal'],
    example: 'free'
  })
  subscriptionTier: 'free' | 'basic' | 'professional' | 'enterprise' | 'internal';

  @ApiProperty({ 
    description: 'Subscription status',
    enum: ['active', 'inactive', 'suspended', 'cancelled'],
    example: 'active'
  })
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'cancelled';

  @ApiProperty({ 
    description: 'Creation timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Last update timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;

  @ApiProperty({ 
    description: 'Number of members in the organization',
    example: 15,
    required: false
  })
  memberCount?: number;
}
