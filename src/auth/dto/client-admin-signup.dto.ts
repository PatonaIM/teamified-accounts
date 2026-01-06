import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Length, Matches, IsOptional, IsUrl, IsBoolean } from 'class-validator';
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
    example: 'acme-corp',
    description: 'URL-friendly slug for the organization (lowercase, alphanumeric and hyphens only). If not provided, will be auto-generated from company name.',
    required: false,
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @Length(2, 100, { message: 'Slug must be between 2 and 100 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only (e.g., acme-corp)'
  })
  slug?: string;

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
    example: '21-50 employees',
    description: 'Company size (e.g., 1-20 employees, 21-50 employees, etc.)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(30, { message: 'Company size must not exceed 30 characters' })
  companySize?: string;

  @ApiProperty({
    example: 'AU',
    description: 'Country code (ISO 3166-1 alpha-2)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2, { message: 'Country code must be 2 characters' })
  country?: string;

  @ApiProperty({
    example: 'AU',
    description: 'Mobile number country code (ISO 3166-1 alpha-2)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2, { message: 'Mobile country code must be 2 characters' })
  mobileCountryCode?: string;

  @ApiProperty({
    example: '412345678',
    description: 'Mobile phone number without country code',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Mobile number must not exceed 20 characters' })
  mobileNumber?: string;

  @ApiProperty({
    example: 'AU',
    description: 'Phone number country code (ISO 3166-1 alpha-2)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2, { message: 'Phone country code must be 2 characters' })
  phoneCountryCode?: string;

  @ApiProperty({
    example: '98765432',
    description: 'Phone number without country code',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  phoneNumber?: string;

  @ApiProperty({
    example: 'https://acmecorp.com',
    description: 'Company website URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Website URL must not exceed 255 characters' })
  website?: string;

  @ApiProperty({
    example: 'We are a technology company specializing in cloud solutions.',
    description: 'Description of the business',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Business description must not exceed 2000 characters' })
  businessDescription?: string;

  @ApiProperty({
    example: 'Software Engineers, Product Managers',
    description: 'Roles the company is looking to hire',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Roles needed must not exceed 500 characters' })
  rolesNeeded?: string;

  @ApiProperty({
    example: 'We need help building our engineering team.',
    description: 'How Teamified can help the company',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'How can we help must not exceed 1000 characters' })
  howCanWeHelp?: string;

  @ApiProperty({
    example: true,
    description: 'User has accepted the terms, privacy policy, and service agreement',
  })
  @IsBoolean({ message: 'Terms acceptance is required' })
  @IsNotEmpty({ message: 'You must accept the terms and conditions' })
  termsAccepted: boolean;
}

export class ClientAdminSignupResponseDto {
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

  @ApiProperty({
    description: 'Created organization slug',
  })
  organizationSlug: string;

  @ApiProperty({
    description: 'HubSpot contact creation result',
    required: false,
  })
  hubspotContactCreated?: boolean;

  @ApiProperty({
    description: 'HubSpot contact ID if created',
    required: false,
  })
  hubspotContactId?: string;
}

export class AnalyzeWebsiteDto {
  @ApiProperty({
    example: 'https://acmecorp.com',
    description: 'Website URL to analyze',
  })
  @IsString()
  @IsNotEmpty({ message: 'Website URL is required' })
  @MaxLength(255, { message: 'Website URL must not exceed 255 characters' })
  websiteUrl: string;
}

export class AnalyzeWebsiteResponseDto {
  @ApiProperty({
    description: 'Whether the analysis was successful',
  })
  success: boolean;

  @ApiProperty({
    description: 'AI-generated business description',
    required: false,
  })
  businessDescription?: string;

  @ApiProperty({
    description: 'Error message if analysis failed',
    required: false,
  })
  error?: string;
}
