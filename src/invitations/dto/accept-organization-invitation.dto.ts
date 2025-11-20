import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEmail, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class AcceptOrganizationInvitationDto {
  @ApiProperty({
    description: 'Unique invitation code from the invitation link',
    example: 'abc123xyz456',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  inviteCode: string;

  @ApiProperty({
    description: 'Email address of the user accepting the invitation',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({
    description: 'Password for the new account (min 8 characters, must include uppercase, lowercase, number, and special character)',
    example: 'MySecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Password confirmation - must match the password field',
    example: 'MySecurePass123!',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  lastName: string;
}
