import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RevokeVerificationDto {
  @ApiProperty({
    description: 'Detailed reason for revoking the verification (minimum 20 characters)',
    example: 'Document was verified in error. The information provided does not match our records and requires re-verification.',
    minLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Revocation reason must be at least 20 characters long for proper documentation' })
  reason: string;
}
