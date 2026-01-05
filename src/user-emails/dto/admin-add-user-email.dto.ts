import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { EmailType } from '../entities/user-email.entity';

export class AdminAddUserEmailDto {
  @ApiProperty({ description: 'Email address to add' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Type of email (personal or work)',
    enum: EmailType,
    default: EmailType.PERSONAL,
  })
  @IsOptional()
  @IsEnum(EmailType)
  emailType?: EmailType;

  @ApiPropertyOptional({
    description: 'Organization ID for work emails',
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Set as primary email',
    default: false,
  })
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Mark email as already verified (skip verification email)',
    default: false,
  })
  @IsOptional()
  skipVerification?: boolean;
}
