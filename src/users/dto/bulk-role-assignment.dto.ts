import { IsArray, IsString, IsUUID, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BulkRoleAssignmentDto {
  @ApiProperty({
    description: 'Array of user IDs to assign roles to',
    example: ['123e4567-e89b-12d3-a456-426614174000', '987fcdeb-51a2-43d1-b456-426614174000'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one user ID must be provided' })
  @IsUUID('4', { each: true, message: 'Each user ID must be a valid UUID' })
  userIds: string[];

  @ApiProperty({
    description: 'Role type to assign',
    example: 'eor'
  })
  @IsString()
  role: string;

  @ApiPropertyOptional({
    description: 'Scope of the role (user, group, client, all)',
    example: 'client'
  })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({
    description: 'Scope entity ID if scope is not "all"',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID('4', { message: 'Scope entity ID must be a valid UUID' })
  scopeId?: string;
}
