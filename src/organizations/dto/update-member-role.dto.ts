import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RoleType } from '../../invitations/dto/create-invitation.dto';

export class UpdateMemberRoleDto {
  @ApiProperty({ 
    description: 'New role type to assign',
    enum: RoleType,
    example: 'client_admin'
  })
  @IsEnum(RoleType)
  roleType: RoleType;
}
