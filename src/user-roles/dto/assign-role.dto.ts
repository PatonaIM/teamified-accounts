import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { RoleType, RoleScope } from '../../common/types/role-types';

const ROLE_TYPES: RoleType[] = [
  'client_admin',
  'client_hr',
  'client_finance',
  'client_recruiter',
  'client_employee',
  'super_admin',
  'internal_hr',
  'internal_finance',
  'internal_account_manager',
  'internal_recruiter',
  'internal_marketing',
  'internal_employee',
];

const ROLE_SCOPES: RoleScope[] = ['all', 'global', 'organization', 'individual'];

export class AssignRoleDto {
  @ApiProperty({
    description: 'User ID to assign role to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Role type to assign',
    enum: ROLE_TYPES,
    example: 'client_hr',
  })
  @IsEnum(ROLE_TYPES)
  role: RoleType;

  @ApiProperty({
    description: 'Scope of the role assignment',
    enum: ROLE_SCOPES,
    example: 'organization',
    default: 'global',
  })
  @IsEnum(ROLE_SCOPES)
  scope: RoleScope;

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
