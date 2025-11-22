import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClientAdminSignupDto {
  @ApiProperty({
    example: 'admin@acmecorp.com',
    description: 'Email address for the new admin account',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password for the account (min 8 characters, must include uppercase, lowercase, number, and special character)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the admin user',
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the admin user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @ApiProperty({
    example: 'Acme Corporation',
    description: 'Name of the organization to create',
  })
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  @MaxLength(255, { message: 'Company name must not exceed 255 characters' })
  companyName: string;

  @ApiProperty({
    example: 'Technology',
    description: 'Industry of the organization',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Industry must not exceed 100 characters' })
  industry?: string;

  @ApiProperty({
    example: '11-50',
    description: 'Company size (e.g., 1-10, 11-50, 51-200, 201-500, 501+)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Company size must not exceed 20 characters' })
  companySize?: string;
}

export class ClientAdminSignupResponseDto {
  @ApiProperty({
    description: 'Authentication access token (JWT)',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };

  @ApiProperty({
    description: 'Created organization information',
  })
  organization: {
    id: string;
    name: string;
    slug: string;
    industry: string | null;
    companySize: string | null;
  };

  @ApiProperty({
    description: 'Success message',
  })
  message: string;
}
