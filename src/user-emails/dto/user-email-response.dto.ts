import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailType } from '../entities/user-email.entity';

export class UserEmailResponseDto {
  @ApiProperty({ description: 'Email ID' })
  id: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Type of email', enum: EmailType })
  emailType: EmailType;

  @ApiPropertyOptional({ description: 'Organization ID for work emails' })
  organizationId: string | null;

  @ApiPropertyOptional({ description: 'Organization name for work emails' })
  organizationName?: string | null;

  @ApiProperty({ description: 'Whether this is the primary email' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Whether this email is verified' })
  isVerified: boolean;

  @ApiPropertyOptional({ description: 'When the email was verified' })
  verifiedAt: Date | null;

  @ApiProperty({ description: 'When the email was added' })
  addedAt: Date;
}
