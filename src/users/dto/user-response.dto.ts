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
    description: 'Profile picture URL (Azure Blob Storage)',
    example: 'https://tmfprdfilestorage.blob.core.windows.net/teamified-accounts/users/user-id/profile_123456789.jpg'
  })
  @Expose()
  @Transform(({ obj }) => obj.profilePictureUrl || obj.profileData?.profilePicture || null)
  profilePictureUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Profile picture path (legacy, use profilePictureUrl instead)',
    example: '/objects/profile-pictures/user-id/picture.jpg'
  })
  @Expose()
  @Transform(({ obj }) => obj.profilePictureUrl || obj.profileData?.profilePicture || null)
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

  @ApiPropertyOptional({
    description: 'Organizations user belongs to',
    example: [{
      organizationId: '123e4567-e89b-12d3-a456-426614174000',
      organizationName: 'Acme Corp',
      organizationSlug: 'acme-corp',
      roleType: 'client_admin',
      joinedAt: '2024-01-15T10:30:00Z'
    }],
    type: 'array'
  })
  @Expose()
  @Transform(({ obj }) => {
    // Extract organization memberships
    if (obj.organizationMembers && Array.isArray(obj.organizationMembers)) {
      return obj.organizationMembers.map((om: any) => ({
        organizationId: om.organizationId,
        organizationName: om.organization?.name || 'Unknown',
        organizationSlug: om.organization?.slug || '',
        roleType: om.roleType || '',
        joinedAt: om.createdAt?.toISOString() || null,
      })).filter((org: any) => org.organizationId);
    }
    return [];
  })
  organizations?: Array<{
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    roleType: string;
    joinedAt: string | null;
  }>;

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
