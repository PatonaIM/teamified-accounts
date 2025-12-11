import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEmail, Matches, IsOptional } from 'class-validator';
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
    description: 'Work email address (from the invitation) that will be linked to the organization',
    example: 'john@company.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiPropertyOptional({
    description: 'Optional personal email to link to an existing Teamified account. If provided and matches an existing active user, the work email will be linked to that account instead of creating a new user.',
    example: 'john.doe@gmail.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid personal email address' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  personalEmail?: string;

  @ApiProperty({
    description: 'Password for the new account (min 8 characters, must include uppercase, lowercase, number, and special character)',
    example: 'MySecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]/,
    {
      message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&.)',
    },
  )
  password: string;

  @ApiPropertyOptional({
    description: 'Password confirmation - must match the password field. Required for new accounts, not needed for account linking.',
    example: 'MySecurePass123!',
  })
  @IsOptional()
  @IsString()
  confirmPassword?: string;

  @ApiPropertyOptional({
    description: 'First name of the user. Required for new accounts, not needed for account linking.',
    example: 'John',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the user. Required for new accounts, not needed for account linking.',
    example: 'Doe',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName?: string;
}
