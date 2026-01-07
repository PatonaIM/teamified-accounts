import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEnum, ValidateNested, IsIn, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum EnvironmentType {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

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
    enum: EnvironmentType,
  })
  @IsIn(['development', 'staging', 'production'])
  environment: 'development' | 'staging' | 'production';

  constructor(data?: Partial<RedirectUriDto>) {
    if (data) {
      this.uri = data.uri;
      this.environment = data.environment;
    }
  }
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
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item: any) => {
        if (item instanceof RedirectUriDto) return item;
        return new RedirectUriDto(item);
      });
    }
    return value;
  })
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

  @ApiProperty({
    description: 'Enable client credentials grant for service-to-service authentication',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allow_client_credentials?: boolean;

  @ApiProperty({
    description: 'Allowed scopes for client credentials grant (e.g., read:users, read:organizations)',
    example: ['read:users', 'read:organizations'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowed_scopes?: string[];

  @ApiProperty({
    description: 'Logout URI for front-channel Single Sign-Out. When a user logs out from any app, this URI will be called via iframe to clear the local session.',
    example: 'https://app.teamified.com/auth/logout/callback',
    required: false,
  })
  @IsString()
  @IsOptional()
  logout_uri?: string;
}
