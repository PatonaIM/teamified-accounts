import { ApiProperty } from '@nestjs/swagger';
import { RoleScope } from '../../common/types/role-types';

export class PermissionResponseDto {
  @ApiProperty({
    description: 'Permission name',
    example: 'users.read',
  })
  permission: string;

  @ApiProperty({
    description: 'Permission scope',
    example: 'organization',
  })
  scope: RoleScope;

  @ApiProperty({
    description: 'Scope entity ID if applicable',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  scopeId: string | null;

  @ApiProperty({
    description: 'Whether permission is granted',
    example: true,
  })
  granted: boolean;

  @ApiProperty({
    description: 'Role that grants this permission',
    example: 'admin',
  })
  grantedBy: string;

  @ApiProperty({
    description: 'Permission expiration date',
    example: '2024-12-31T23:59:59.000Z',
    nullable: true,
  })
  expiresAt: Date | null;
}
