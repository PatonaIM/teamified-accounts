import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, MaxLength, IsNotEmpty } from 'class-validator';

export class RecordActivityDto {
  @ApiProperty({
    description: 'The action performed by the user',
    example: 'view_dashboard',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  action: string;

  @ApiPropertyOptional({
    description: 'The feature or module where the action was performed',
    example: 'analytics',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  feature?: string;

  @ApiPropertyOptional({
    description: 'Human-readable description of the activity',
    example: 'Viewed the analytics dashboard',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata about the activity',
    example: { page: 'dashboard', filters: { dateRange: '7d' } },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ActivityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  action: string;

  @ApiPropertyOptional()
  feature?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: string;
}

export class AppActivityGroupDto {
  @ApiProperty({ description: 'OAuth client ID' })
  oauthClientId: string;

  @ApiProperty({ description: 'Application name' })
  appName: string;

  @ApiProperty({ description: 'First login timestamp' })
  firstLoginAt: string;

  @ApiProperty({ description: 'Last login timestamp' })
  lastLoginAt: string;

  @ApiProperty({ description: 'Total login count' })
  loginCount: number;

  @ApiProperty({ description: 'Recent activities in this app', type: [ActivityResponseDto] })
  activities: ActivityResponseDto[];

  @ApiProperty({ description: 'Top features used in this app' })
  topFeatures: Array<{ feature: string; count: number }>;
}

export class UserActivitySummaryDto {
  @ApiProperty({ description: 'Connected applications with their activities', type: [AppActivityGroupDto] })
  connectedApps: AppActivityGroupDto[];
}
