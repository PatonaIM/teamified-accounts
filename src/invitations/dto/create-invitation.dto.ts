import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID, IsOptional, IsInt, Min } from 'class-validator';

export enum RoleType {
  CANDIDATE = 'candidate',
  CLIENT_ADMIN = 'client_admin',
  CLIENT_HR = 'client_hr',
  CLIENT_FINANCE = 'client_finance',
  CLIENT_RECRUITER = 'client_recruiter',
  CLIENT_EMPLOYEE = 'client_employee',
  SUPER_ADMIN = 'super_admin',
  INTERNAL_HR = 'internal_hr',
  INTERNAL_RECRUITER = 'internal_recruiter',
  INTERNAL_ACCOUNT_MANAGER = 'internal_account_manager',
  INTERNAL_FINANCE = 'internal_finance',
  INTERNAL_MARKETING = 'internal_marketing',
  INTERNAL_EMPLOYEE = 'internal_member',
}

export class CreateInvitationDto {
  @ApiProperty({ 
    description: 'Organization ID to invite user to',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ 
    description: 'Role type to assign to the invited user',
    enum: RoleType,
    example: 'client_hr'
  })
  @IsEnum(RoleType)
  roleType: RoleType;

  @ApiProperty({ 
    description: 'Maximum number of times this invitation can be used (null for unlimited)',
    required: false,
    example: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;
}