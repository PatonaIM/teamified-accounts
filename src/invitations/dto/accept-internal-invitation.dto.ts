import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInternalInvitationDto {
  @ApiProperty({
    description: 'Invitation code from the invite link',
    example: 'ABC123XYZ',
  })
  @IsString()
  @IsNotEmpty()
  inviteCode: string;

  @ApiProperty({
    description: 'Email address (required for shareable link invitations, validated against @teamified.com or @teamified.com.au)',
    example: 'john.doe@teamified.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @Matches(/@teamified\.com(\.au)?$/i, {
    message: 'Email must be from @teamified.com or @teamified.com.au domain',
  })
  email: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description: 'Password (min 8 chars, must include uppercase, lowercase, number, special char)',
    example: 'SecurePass123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Password confirmation',
    example: 'SecurePass123!',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
