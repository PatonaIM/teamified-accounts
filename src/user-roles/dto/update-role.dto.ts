import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role type to update to',
    enum: ['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client', 'eor', 'candidate'],
    example: 'hr',
    required: false,
  })
  @IsOptional()
  @IsEnum(['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client', 'eor', 'candidate'])
  role?: 'admin' | 'hr' | 'account_manager' | 'recruiter' | 'hr_manager_client' | 'eor' | 'candidate';

  @ApiProperty({
    description: 'Scope of the role assignment',
    enum: ['user', 'group', 'client', 'all'],
    example: 'client',
    required: false,
  })
  @IsOptional()
  @IsEnum(['user', 'group', 'client', 'all'])
  scope?: 'user' | 'group' | 'client' | 'all';

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
