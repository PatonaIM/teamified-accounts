import { ApiProperty } from '@nestjs/swagger';
import { ApiKeyType } from '../entities/api-key.entity';

export class ApiKeyResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Production API Key' })
  name: string;

  @ApiProperty({ enum: ApiKeyType, example: ApiKeyType.READ_ONLY })
  type: ApiKeyType;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-16T14:20:00Z', nullable: true })
  lastUsedAt: Date | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 1 })
  userId: number;
}

export class ApiKeyCreatedResponseDto extends ApiKeyResponseDto {
  @ApiProperty({
    example: 'tmf_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r',
    description: 'Plain text API key (only shown once)',
  })
  key: string;
}
