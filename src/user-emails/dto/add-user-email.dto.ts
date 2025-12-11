import { IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailType } from '../entities/user-email.entity';

export class AddUserEmailDto {
  @ApiProperty({ description: 'Email address to add', example: 'john.doe@company.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ 
    description: 'Type of email', 
    enum: EmailType, 
    default: EmailType.PERSONAL 
  })
  @IsOptional()
  @IsEnum(EmailType)
  emailType?: EmailType;

  @ApiPropertyOptional({ 
    description: 'Organization ID for work emails',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
