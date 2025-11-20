import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus } from '../entities/invitation.entity';

export class InternalInvitationResponseDto {
  @ApiProperty({ 
    description: 'Invitation ID',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({ 
    description: 'Unique invitation code'
  })
  inviteCode: string;

  @ApiProperty({ 
    description: 'User ID who created the invitation',
    format: 'uuid'
  })
  invitedBy: string;

  @ApiProperty({ 
    description: 'Internal role type to assign',
    example: 'super_admin'
  })
  roleType: string;

  @ApiProperty({ 
    description: 'Invitation status',
    enum: InvitationStatus
  })
  status: InvitationStatus;

  @ApiProperty({ 
    description: 'Invitation expiry date'
  })
  expiresAt: Date;

  @ApiProperty({ 
    description: 'Maximum uses (null for unlimited)'
  })
  maxUses: number | null;

  @ApiProperty({ 
    description: 'Current number of uses'
  })
  currentUses: number;

  @ApiProperty({ 
    description: 'Creation date'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Full shareable invitation URL',
    required: false
  })
  invitationUrl?: string;
}
