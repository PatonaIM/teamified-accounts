import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEnum, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class RedirectUriDto {
  @ApiProperty({
    description: 'The redirect URI',
    example: 'https://app.teamified.com/auth/callback',
  })
  @IsString()
  uri: string;

  @ApiProperty({
    description: 'Environment for this redirect URI',
    example: 'production',
    enum: ['development', 'staging', 'production'],
  })
  @IsEnum(['development', 'staging', 'production'])
  environment: 'development' | 'staging' | 'production';
}

export class CreateOAuthClientDto {
  @ApiProperty({
    description: 'Name of the application',
    example: 'Job Application Portal',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the application',
    example: 'Internal job application management system',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Allowed redirect URIs for OAuth flow with environment tags',
    example: [
      { uri: 'https://app.teamified.com/auth/callback', environment: 'production' },
      { uri: 'https://app-dev.repl.co/auth/callback', environment: 'development' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RedirectUriDto)
  redirect_uris: RedirectUriDto[];

  @ApiProperty({
    description: 'Target user audience for this application. Controls which user types can access this app.',
    example: 'both',
    enum: ['client', 'candidate', 'both'],
    required: false,
    default: 'both',
  })
  @IsEnum(['client', 'candidate', 'both'])
  @IsOptional()
  default_intent?: 'client' | 'candidate' | 'both';

  @ApiProperty({
    description: 'Application URL',
    example: 'https://app.teamified.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  app_url?: string;

  @ApiProperty({
    description: 'Owner or team responsible for the app',
    example: 'Engineering Team',
    required: false,
  })
  @IsString()
  @IsOptional()
  owner?: string;
}
