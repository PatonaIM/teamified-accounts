import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExchangeTokenDto {
  @ApiProperty({
    description: 'Supabase access token from frontend',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  supabaseAccessToken: string;

  @ApiProperty({
    description: 'OAuth client ID of the requesting application',
    example: 'client_a1b2c3d4e5f6g7h8i9j0',
    required: false,
  })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({
    description: 'OAuth client secret of the requesting application',
    example: 'secret_x1y2z3a4b5c6d7e8f9g0',
    required: false,
  })
  @IsString()
  @IsOptional()
  clientSecret?: string;
}
