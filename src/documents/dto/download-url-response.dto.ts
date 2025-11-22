import { IsString, IsUrl, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DownloadUrlResponseDto {
  @ApiProperty({
    description: 'Secure, time-limited download URL for the CV file',
    example: 'https://api.teamified.com/files/download/cv_123e4567-e89b-12d3-a456-426614174000?token=abc123',
    format: 'uri',
    maxLength: 500,
  })
  @IsUrl()
  downloadUrl: string;

  @ApiProperty({
    description: 'ISO 8601 timestamp when the download URL expires',
    example: '2025-01-08T11:30:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  expiresAt: string;
}