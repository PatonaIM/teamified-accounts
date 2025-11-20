import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsInt, Min, Matches, IsBoolean } from 'class-validator';

export enum InternalRoleType {
  SUPER_ADMIN = 'super_admin',
  INTERNAL_MEMBER = 'internal_member',
  INTERNAL_HR = 'internal_hr',
  INTERNAL_RECRUITER = 'internal_recruiter',
  INTERNAL_ACCOUNT_MANAGER = 'internal_account_manager',
  INTERNAL_FINANCE = 'internal_finance',
  INTERNAL_MARKETING = 'internal_marketing',
}

export class CreateInternalInvitationDto {
  @ApiProperty({ 
    description: 'Email address of the person to invite (must be @teamified.com or @teamified.com.au). Optional - if not provided, only a shareable link will be generated.',
    example: 'john.doe@teamified.com',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  @Matches(/@teamified\.com(\.au)?$/, {
    message: 'Email must be from @teamified.com or @teamified.com.au domain',
  })
  email?: string;

  @ApiProperty({ 
    description: 'Internal role type to assign to the invited user',
    enum: InternalRoleType,
    example: InternalRoleType.INTERNAL_HR
  })
  @IsEnum(InternalRoleType, {
    message: 'Role must be a valid internal role type',
  })
  roleType: InternalRoleType;

  @ApiProperty({ 
    description: 'Maximum number of times this invitation can be used (null for unlimited, default is 1 for internal invites)',
    required: false,
    default: 1,
    example: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @ApiProperty({ 
    description: 'Force resend invitation even if a pending invitation exists (cancels previous invitations)',
    required: false,
    default: false,
    example: false
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
