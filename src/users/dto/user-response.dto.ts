import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe'
  })
  @Expose()
  lastName: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890'
  })
  @Expose()
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'User address information',
    example: { street: '123 Main St', city: 'New York', country: 'USA' }
  })
  @Expose()
  address?: any | null;

  @ApiPropertyOptional({
    description: 'Additional user profile data',
    example: { department: 'Engineering', position: 'Senior Developer' }
  })
  @Expose()
  profileData?: any | null;

  @ApiProperty({
    description: 'User status',
    enum: ['active', 'inactive', 'archived'],
    example: 'active'
  })
  @Expose()
  status: 'active' | 'inactive' | 'archived';

  @ApiProperty({
    description: 'Whether user account is active',
    example: true
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether user email is verified',
    example: true
  })
  @Expose()
  emailVerified: boolean;

  @ApiProperty({
    description: 'Whether user was migrated from Zoho',
    example: false
  })
  @Expose()
  migratedFromZoho: boolean;

  @ApiPropertyOptional({
    description: 'Zoho user ID if migrated',
    example: 'zoho_12345'
  })
  @Expose()
  zohoUserId?: string | null;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  updatedAt: Date;

  // Exclude sensitive fields
  @Exclude()
  passwordHash: string;

  @Exclude()
  emailVerificationToken: string | null;

  @Exclude()
  emailVerificationTokenExpiry: Date | null;

  @Exclude()
  passwordResetToken: string | null;
}
