import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkAccountDto {
  @ApiProperty({
    description: 'Supabase access token to link with existing Portal account',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  supabaseAccessToken: string;
}
