import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ 
    description: 'Current password',
    example: 'OldPassword123!'
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ 
    description: 'New password (minimum 8 characters)',
    example: 'NewPassword123!'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ 
    description: 'Confirm new password',
    example: 'NewPassword123!'
  })
  @IsString()
  @IsNotEmpty()
  confirmNewPassword: string;
}

export class ChangePasswordResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Whether the password was changed successfully' })
  success: boolean;
}
