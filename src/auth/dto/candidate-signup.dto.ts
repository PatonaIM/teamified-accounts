import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CandidateSignupDto {
  @ApiProperty({
    example: 'candidate@example.com',
    description: 'Email address for the new candidate account',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password for the account (min 8 characters)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    example: 'Jane',
    description: 'First name of the candidate',
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @ApiProperty({
    example: 'Smith',
    description: 'Last name of the candidate',
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;
}

export class CandidateSignupResponseDto {
  @ApiProperty({
    description: 'Success message',
  })
  message: string;

  @ApiProperty({
    description: 'Whether email verification is required',
  })
  emailVerificationRequired: boolean;

  @ApiProperty({
    description: 'Email address where verification was sent',
  })
  email: string;
}
