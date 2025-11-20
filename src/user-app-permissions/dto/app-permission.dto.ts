import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetAppPermissionDto {
  @ApiProperty({
    description: 'OAuth client ID (app) to grant or revoke access to',
    example: 'client-uuid',
  })
  @IsUUID()
  oauthClientId: string;

  @ApiProperty({
    description: 'Permission type: allow = grant access, deny = revoke access',
    enum: ['allow', 'deny'],
    example: 'allow',
  })
  @IsEnum(['allow', 'deny'])
  permission: 'allow' | 'deny';

  @ApiPropertyOptional({
    description: 'Reason for granting/revoking this permission',
    example: 'User needs special access to Finance app for audit purposes',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AppPermissionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  oauthClientId: string;

  @ApiProperty()
  oauthClientName: string;

  @ApiProperty({ enum: ['allow', 'deny'] })
  permission: 'allow' | 'deny';

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  reason?: string;

  @ApiProperty({ required: false })
  grantedBy?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UserAppAccessResponseDto {
  @ApiProperty({ description: 'OAuth client ID' })
  oauthClientId: string;

  @ApiProperty({ description: 'OAuth client name' })
  oauthClientName: string;

  @ApiProperty({ description: 'App key identifier' })
  appKey: string;

  @ApiProperty({ description: 'Whether user can access this app' })
  canAccess: boolean;

  @ApiProperty({ description: 'Source of permission: default (from role) or override (custom)' })
  source: 'default' | 'override';

  @ApiProperty({ description: 'Access scope if applicable' })
  scope?: string;

  @ApiProperty({ description: 'Description of access level' })
  description?: string;

  @ApiProperty({ description: 'Override permission if exists', required: false })
  overridePermission?: 'allow' | 'deny';

  @ApiProperty({ description: 'Reason for override if exists', required: false })
  overrideReason?: string;
}
