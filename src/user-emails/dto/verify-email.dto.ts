import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Verification token sent to the email' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
