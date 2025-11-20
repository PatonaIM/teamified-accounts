import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { RoleType } from '../../invitations/dto/create-invitation.dto';

export class AddMemberDto {
  @ApiProperty({ 
    description: 'User ID to add as a member',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  userId: string;

  @ApiProperty({ 
    description: 'Role type to assign (must be client_* role for organization membership)',
    enum: RoleType,
    example: 'client_hr'
  })
  @IsEnum(RoleType)
  roleType: RoleType;

  @ApiProperty({ 
    description: 'Status of the membership',
    enum: ['active', 'inactive', 'suspended'],
    example: 'active',
    required: false,
    default: 'active'
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: 'active' | 'inactive' | 'suspended';
}
