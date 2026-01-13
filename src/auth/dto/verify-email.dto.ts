import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'Token is required' })
  @IsString({ message: 'Token must be a string' })
  token: string;
}

export class VerifyEmailResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Email verified successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Verification status',
    example: true,
  })
  verified: boolean;

  @ApiPropertyOptional({
    description: 'Token status for expired/invalid tokens',
    example: 'expired',
    enum: ['expired', 'invalid', 'already_verified'],
  })
  tokenStatus?: 'expired' | 'invalid' | 'already_verified';

  @ApiPropertyOptional({
    description: 'Email address associated with the token (for resend flow)',
    example: 'user@example.com',
  })
  email?: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'Email address to resend verification to',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}

export class ResendVerificationResponseDto {
  @ApiProperty({
    description: 'OWASP-compliant success message (always the same regardless of account state)',
    example: 'Thank you. If this email is registered and unverified, you will receive a verification email shortly.',
  })
  message: string;

  @ApiProperty({
    description: 'Always true for OWASP compliance (no enumeration)',
    example: true,
  })
  success: boolean;
}

export class ProfileCompletionStatusDto {
  @ApiProperty({
    description: 'Profile completion percentage',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  completionPercentage: number;

  @ApiProperty({
    description: 'Required fields for profile completion',
    example: ['firstName', 'lastName', 'email', 'phone', 'address', 'country'],
    type: [String],
  })
  requiredFields: string[];

  @ApiProperty({
    description: 'Missing required fields',
    example: ['phone', 'address'],
    type: [String],
  })
  missingFields: string[];

  @ApiProperty({
    description: 'Whether profile is complete',
    example: false,
  })
  isComplete: boolean;

  @ApiProperty({
    description: 'Whether email is verified',
    example: true,
  })
  emailVerified: boolean;
}