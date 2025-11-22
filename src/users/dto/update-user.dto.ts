import { IsOptional, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'User status',
    enum: ['active', 'inactive', 'archived'],
    example: 'active'
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'archived'], {
    message: 'Status must be one of: active, inactive, archived'
  })
  status?: 'active' | 'inactive' | 'archived';

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
