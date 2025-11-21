import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, IsUUID, MaxLength } from 'class-validator';
import { Country, UserRole } from '../entities/invitation.entity';

export class CreateInvitationDto {
  @ApiProperty({ 
    description: 'First name of the invitee',
    maxLength: 100,
    example: 'John'
  })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ 
    description: 'Last name of the invitee',
    maxLength: 100,
    example: 'Doe'
  })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ 
    description: 'Email address of the invitee',
    format: 'email',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Country code',
    enum: Country,
    example: 'IN'
  })
  @IsEnum(Country)
  country: Country;

  @ApiProperty({ 
    description: 'User role',
    enum: UserRole,
    example: 'EOR'
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ 
    description: 'Client ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  clientId: string;
}