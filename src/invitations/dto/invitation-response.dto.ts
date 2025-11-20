import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus } from '../entities/invitation.entity';
import { RoleType } from './create-invitation.dto';

export class InvitationResponseDto {
  @ApiProperty({ 
    description: 'Invitation ID',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({ 
    description: 'Organization ID',
    format: 'uuid'
  })
  organizationId: string;

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
    description: 'Role type to assign',
    enum: RoleType
  })
  roleType: RoleType;

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
    description: 'Organization name (joined from organization relation)',
    required: false
  })
  organizationName?: string;

  @ApiProperty({ 
    description: 'Full shareable invitation URL',
    required: false
  })
  invitationUrl?: string;
}