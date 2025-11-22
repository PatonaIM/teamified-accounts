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

  @ApiPropertyOptional({
    description: 'Profile picture path',
    example: '/objects/profile-pictures/user-id/picture.jpg'
  })
  @Expose()
  @Transform(({ obj }) => obj.profileData?.profilePicture || null)
  profilePicture?: string | null;

  @ApiPropertyOptional({
    description: 'Secondary (backup) email address',
    example: 'backup@example.com'
  })
  @Expose()
  @Transform(({ obj }) => obj.profileData?.secondaryEmail || null)
  secondaryEmail?: string | null;

  @ApiProperty({
    description: 'User status',
    enum: ['active', 'inactive', 'archived', 'invited'],
    example: 'active'
  })
  @Expose()
  status: 'active' | 'inactive' | 'archived' | 'invited';

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

  @ApiPropertyOptional({
    description: 'User roles',
    example: ['super_admin', 'admin'],
    type: [String]
  })
  @Expose()
  @Transform(({ obj }) => {
    // Extract roles from userRoles relation
    if (obj.userRoles && Array.isArray(obj.userRoles)) {
      return obj.userRoles.map((ur: any) => ur.roleType || ur.role).filter(Boolean);
    }
    return [];
  })
  roles?: string[];

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
