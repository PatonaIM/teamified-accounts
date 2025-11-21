import { PartialType } from '@nestjs/swagger';
import { CreateOAuthClientDto } from './create-oauth-client.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOAuthClientDto extends PartialType(CreateOAuthClientDto) {
  @ApiProperty({
    description: 'Whether the client is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
