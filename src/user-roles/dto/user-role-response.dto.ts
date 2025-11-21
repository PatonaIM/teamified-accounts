import { ApiProperty } from '@nestjs/swagger';

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
    enum: ['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client', 'eor', 'candidate'],
    example: 'hr',
  })
  role: 'admin' | 'hr' | 'account_manager' | 'recruiter' | 'hr_manager_client' | 'eor' | 'candidate';

  @ApiProperty({
    description: 'Scope of the role',
    enum: ['user', 'group', 'client', 'all'],
    example: 'all',
  })
  scope: 'user' | 'group' | 'client' | 'all';

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
