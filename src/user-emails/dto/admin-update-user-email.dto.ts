import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class AdminUpdateUserEmailDto {
  @ApiProperty({ description: 'New email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Skip sending verification email (admin pre-verifies)',
    default: false,
  })
  @IsOptional()
  skipVerification?: boolean;
}
