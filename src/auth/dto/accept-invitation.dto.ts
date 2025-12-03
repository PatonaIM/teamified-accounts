import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches, IsUUID } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Invitation token from the email link',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password for the account',
    example: 'MySecurePass123!',
    minLength: 8
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

  @ApiProperty({
    description: 'Password confirmation',
    example: 'MySecurePass123!'
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class AcceptInvitationResponseDto {
  @ApiProperty({
    description: 'User ID',
    format: 'uuid'
  })
  userId: string;

  @ApiProperty({
    description: 'Email address'
  })
  email: string;

  @ApiProperty({
    description: 'First name'
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name'
  })
  lastName: string;

  @ApiProperty({
    description: 'Account activation status'
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Email verification status'
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Message about next steps'
  })
  message: string;
}