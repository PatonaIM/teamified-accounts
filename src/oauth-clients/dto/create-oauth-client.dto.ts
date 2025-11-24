import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';

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
    description: 'Allowed redirect URIs for OAuth flow',
    example: [
      'https://app1.teamified.com/auth/callback',
      'https://app1-dev.repl.co/auth/callback',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  redirect_uris: string[];

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
    example: 'https://app1.teamified.com',
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
    description: 'Environment type',
    example: 'production',
    enum: ['development', 'staging', 'production'],
    required: false,
  })
  @IsEnum(['development', 'staging', 'production'])
  @IsOptional()
  environment?: 'development' | 'staging' | 'production';
}
