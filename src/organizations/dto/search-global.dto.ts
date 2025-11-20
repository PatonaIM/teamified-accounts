import { ApiProperty } from '@nestjs/swagger';
import { OrganizationResponseDto } from './organization-response.dto';

export class UserSearchResult {
  @ApiProperty({ 
    description: 'User unique identifier',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({ 
    description: 'User email',
    example: 'john.doe@example.com'
  })
  email: string;

  @ApiProperty({ 
    description: 'User full name',
    example: 'John Doe'
  })
  name: string;

  @ApiProperty({ 
    description: 'User role type',
    example: 'client_admin'
  })
  roleType: string;

  @ApiProperty({ 
    description: 'Organization the user belongs to',
    nullable: true
  })
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;

  @ApiProperty({ 
    description: 'User profile picture URL',
    example: '/objects/images/users/123_456.jpg',
    nullable: true
  })
  profilePicture: string | null;
}

export class GlobalSearchResponseDto {
  @ApiProperty({ 
    description: 'List of matching organizations',
    type: [OrganizationResponseDto]
  })
  organizations: OrganizationResponseDto[];

  @ApiProperty({ 
    description: 'List of matching users',
    type: [UserSearchResult]
  })
  users: UserSearchResult[];

  @ApiProperty({ 
    description: 'Total count of organizations found',
    example: 5
  })
  totalOrganizations: number;

  @ApiProperty({ 
    description: 'Total count of users found',
    example: 12
  })
  totalUsers: number;
}
