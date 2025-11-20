import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '../../invitations/dto/create-invitation.dto';

export class OrganizationMemberResponseDto {
  @ApiProperty({ 
    description: 'Member record unique identifier',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({ 
    description: 'Organization ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  organizationId: string;

  @ApiProperty({ 
    description: 'User ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({ 
    description: 'User email',
    example: 'john.doe@example.com'
  })
  userEmail: string;

  @ApiProperty({ 
    description: 'User full name',
    example: 'John Doe'
  })
  userName: string;

  @ApiProperty({ 
    description: 'User profile picture URL',
    example: '/objects/images/users/123_456.jpg',
    nullable: true
  })
  profilePicture: string | null;

  @ApiProperty({ 
    description: 'Role type in this organization',
    enum: RoleType,
    example: 'client_hr'
  })
  roleType: RoleType;

  @ApiProperty({ 
    description: 'Membership status',
    enum: ['active', 'inactive', 'suspended'],
    example: 'active'
  })
  status: 'active' | 'inactive' | 'suspended';

  @ApiProperty({ 
    description: 'Timestamp when user joined the organization',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:30:00Z'
  })
  joinedAt: Date;

  @ApiProperty({ 
    description: 'User ID who invited this member',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true
  })
  invitedBy: string | null;

  @ApiProperty({ 
    description: 'Creation timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;
}
