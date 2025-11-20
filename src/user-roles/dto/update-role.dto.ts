import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { RoleType, RoleScope } from '../../common/types/role-types';

const ROLE_TYPES: RoleType[] = [
  'client_admin', 'client_member', 'super_admin', 'internal_member', 'internal_account_manager'
];

const ROLE_SCOPES: RoleScope[] = ['all', 'global', 'organization', 'individual'];

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role type to update to',
    enum: ROLE_TYPES,
    example: 'client_hr',
    required: false,
  })
  @IsOptional()
  @IsEnum(ROLE_TYPES)
  role?: RoleType;

  @ApiProperty({
    description: 'Scope of the role assignment',
    enum: ROLE_SCOPES,
    example: 'organization',
    required: false,
  })
  @IsOptional()
  @IsEnum(ROLE_SCOPES)
  scope?: RoleScope;

  @ApiProperty({
    description: 'Scope entity ID for scoped permissions',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  scopeId?: string;

  @ApiProperty({
    description: 'Role expiration date (ISO string)',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
