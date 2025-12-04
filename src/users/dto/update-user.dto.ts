import { IsOptional, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'User status',
    enum: ['active', 'inactive', 'archived', 'suspended'],
    example: 'active'
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'archived', 'suspended'], {
    message: 'Status must be one of: active, inactive, archived, suspended'
  })
  status?: 'active' | 'inactive' | 'archived' | 'suspended';

  @ApiPropertyOptional({
    description: 'User theme preference',
    enum: ['light', 'dark'],
    example: 'dark'
  })
  @IsOptional()
  @IsEnum(['light', 'dark'], {
    message: 'Theme preference must be either light or dark'
  })
  themePreference?: 'light' | 'dark';
}
