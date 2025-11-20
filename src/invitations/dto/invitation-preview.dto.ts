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
}
