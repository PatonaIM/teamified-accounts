import { IsArray, IsEnum, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkStatusUpdateDto {
  @ApiProperty({
    description: 'Array of user IDs to update',
    example: ['123e4567-e89b-12d3-a456-426614174000', '987fcdeb-51a2-43d1-b456-426614174000'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one user ID must be provided' })
  @IsUUID('4', { each: true, message: 'Each user ID must be a valid UUID' })
  userIds: string[];

  @ApiProperty({
    description: 'New status to apply to all users',
    enum: ['active', 'inactive', 'archived'],
    example: 'active'
  })
  @IsEnum(['active', 'inactive', 'archived'], {
    message: 'Status must be one of: active, inactive, archived'
  })
  status: 'active' | 'inactive' | 'archived';
}
