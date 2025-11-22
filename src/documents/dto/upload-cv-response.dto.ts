import { IsString, IsBoolean, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadCVResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the CV record',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Unique identifier for this specific CV version',
    example: 'cv_123e4567-e89b-12d3-a456-426614174000',
    pattern: '^cv_[a-f0-9-]+$',
  })
  @IsString()
  versionId: string;

  @ApiProperty({
    description: 'Original filename of the uploaded CV',
    example: 'john_doe_cv_2025.pdf',
    maxLength: 255,
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'Whether this is the current active CV version',
    example: true,
  })
  @IsBoolean()
  isCurrent: boolean;

  @ApiProperty({
    description: 'ISO 8601 timestamp when the CV was uploaded',
    example: '2025-01-08T10:30:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  uploadedAt: string;
}