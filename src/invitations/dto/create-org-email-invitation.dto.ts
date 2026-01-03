import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID, IsEmail, IsOptional, IsString } from 'class-validator';

export enum OrgInvitationRoleType {
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
  INTERNAL_MEMBER = 'internal_member',
}

export class CreateOrgEmailInvitationDto {
  @ApiProperty({ 
    description: 'Organization ID to invite user to',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ 
    description: 'Email address of the person to invite',
    example: 'john.doe@example.com'
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ 
    description: 'First name of the person to invite (optional)',
    example: 'John',
    required: false
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ 
    description: 'Last name of the person to invite (optional)',
    example: 'Doe',
    required: false
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ 
    description: 'Role type to assign to the invited user',
    enum: OrgInvitationRoleType,
    example: 'client_employee'
  })
  @IsEnum(OrgInvitationRoleType)
  roleType: OrgInvitationRoleType;
}
