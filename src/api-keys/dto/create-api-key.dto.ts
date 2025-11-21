import { IsString, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiKeyType } from '../entities/api-key.entity';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'Human-readable name for the API key',
    example: 'Production API Key',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Type of API key',
    enum: ApiKeyType,
    example: ApiKeyType.READ_ONLY,
  })
  @IsEnum(ApiKeyType)
  type: ApiKeyType;
}
