import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID, IsInt, IsOptional, Min, registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export enum OrgInvitationRoleType {
  CANDIDATE = 'candidate',
  CLIENT_ADMIN = 'client_admin',
  CLIENT_HR = 'client_hr',
  CLIENT_FINANCE = 'client_finance',
  CLIENT_RECRUITER = 'client_recruiter',
  CLIENT_EMPLOYEE = 'client_employee',
}

// Custom validator to allow -1 for unlimited uses or positive integers
function IsMaxUses(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMaxUses',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === undefined || value === null) {
            return true; // Optional field
          }
          // Allow -1 for unlimited, or any positive integer >= 1
          return Number.isInteger(value) && (value === -1 || value >= 1);
        },
        defaultMessage(args: ValidationArguments) {
          return 'maxUses must be -1 (unlimited) or a positive integer';
        },
      },
    });
  };
}

export class GenerateOrgShareableLinkDto {
  @ApiProperty({ 
    description: 'Organization ID to generate invite link for',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ 
    description: 'Role type to assign to invited users',
    enum: OrgInvitationRoleType,
    example: 'client_employee'
  })
  @IsEnum(OrgInvitationRoleType)
  roleType: OrgInvitationRoleType;

  @ApiProperty({ 
    description: 'Maximum number of times this link can be used. Use -1 for unlimited uses.',
    required: false,
    example: 10,
    default: 1
  })
  @IsOptional()
  @IsInt()
  @IsMaxUses()
  maxUses?: number;
}
