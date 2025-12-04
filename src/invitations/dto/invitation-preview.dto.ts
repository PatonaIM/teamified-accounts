import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus } from '../entities/invitation.entity';

export class InvitationPreviewDto {
  @ApiProperty({ 
    description: 'Organization name'
  })
  organizationName: string;

  @ApiProperty({ 
    description: 'Organization slug'
  })
  organizationSlug: string;

  @ApiProperty({ 
    description: 'Role being offered'
  })
  roleType: string;

  @ApiProperty({ 
    description: 'Name of the person who sent the invitation'
  })
  inviterName: string;

  @ApiProperty({ 
    description: 'Email of the person who sent the invitation'
  })
  inviterEmail: string;

  @ApiProperty({ 
    description: 'Invitation status',
    enum: InvitationStatus
  })
  status: InvitationStatus;

  @ApiProperty({ 
    description: 'Expiration date of the invitation'
  })
  expiresAt: Date;

  @ApiProperty({ 
    description: 'Whether the invitation is valid (pending and not expired)'
  })
  isValid: boolean;

  @ApiProperty({ 
    description: 'Human-readable validity message'
  })
  validityMessage: string;

  @ApiProperty({ 
    description: 'Created date'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Email address of the invited user',
    nullable: true
  })
  invitedEmail?: string;

  @ApiProperty({ 
    description: 'Whether the invited user has already completed signup (has password and name set)',
    default: false
  })
  hasCompletedSignup: boolean;

  @ApiProperty({ 
    description: 'First name of the invited user (if they have completed signup)',
    nullable: true
  })
  invitedUserFirstName?: string;

  @ApiProperty({ 
    description: 'Last name of the invited user (if they have completed signup)',
    nullable: true
  })
  invitedUserLastName?: string;
}
