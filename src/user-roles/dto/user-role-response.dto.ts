import { ApiProperty } from '@nestjs/swagger';
import { RoleType, RoleScope } from '../../common/types/role-types';

export class UserRoleResponseDto {
  @ApiProperty({
    description: 'Role assignment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Role type',
    example: 'client_hr',
  })
  role: RoleType;

  @ApiProperty({
    description: 'Scope of the role',
    example: 'organization',
  })
  scope: RoleScope;

  @ApiProperty({
    description: 'Scope entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  scopeId: string | null;

  @ApiProperty({
    description: 'User who granted this role',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  grantedBy: string | null;

  @ApiProperty({
    description: 'Role expiration date',
    example: '2024-12-31T23:59:59.000Z',
    nullable: true,
  })
  expiresAt: Date | null;

  @ApiProperty({
    description: 'Role creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Role last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
