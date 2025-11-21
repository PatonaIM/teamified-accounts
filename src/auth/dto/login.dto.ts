import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: 'Remember me must be a boolean value' })
  rememberMe?: boolean;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    emailVerified: boolean;
    roles: string[];
  };
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class LogoutResponseDto {
  @ApiProperty()
  message: string;
}

export class UserProfileDto {
  @ApiProperty({ description: 'User unique identifier' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  lastName: string;

  @ApiProperty({ description: 'User phone number', required: false })
  phone: string | null;

  @ApiProperty({ description: 'User account status', enum: ['active', 'inactive', 'archived', 'invited'] })
  status: string;

  @ApiProperty({ description: 'Whether the user account is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Whether the user email is verified' })
  emailVerified: boolean;

  @ApiProperty({ type: [String], description: 'User roles (e.g., super_admin, admin, hr, etc.)' })
  roles: string[];

  @ApiProperty({ description: 'User theme preference', enum: ['light', 'dark'], required: false })
  themePreference: 'light' | 'dark' | null;

  @ApiProperty({ description: 'Profile picture URL', required: false })
  profilePictureUrl: string | null;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last account update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLoginAt: Date | null;
}