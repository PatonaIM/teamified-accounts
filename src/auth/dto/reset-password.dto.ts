import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from email',
    example: 'reset_123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  token: string;

  @ApiProperty({
    description: 'New password (min 8 characters)',
    example: 'NewSecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    description: 'Password confirmation',
    example: 'NewSecurePass123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  confirmPassword: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Your password has been reset successfully',
  })
  message: string;
}

export class ForceChangePasswordDto {
  @ApiProperty({
    description: 'New password (min 8 characters)',
    example: 'NewSecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string;

  @ApiProperty({
    description: 'Password confirmation',
    example: 'NewSecurePass123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  confirmPassword: string;
}

export class ForceChangePasswordResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Password changed successfully',
  })
  message: string;
}
