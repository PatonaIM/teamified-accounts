import { ApiProperty } from '@nestjs/swagger';
import { Country, UserRole, InvitationStatus } from '../entities/invitation.entity';

export class InvitationResponseDto {
  @ApiProperty({ 
    description: 'Invitation ID',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({ 
    description: 'First name of the invitee'
  })
  firstName: string;

  @ApiProperty({ 
    description: 'Last name of the invitee'
  })
  lastName: string;

  @ApiProperty({ 
    description: 'Email address of the invitee'
  })
  email: string;

  @ApiProperty({ 
    description: 'Country code',
    enum: Country
  })
  country: Country;

  @ApiProperty({ 
    description: 'User role',
    enum: UserRole
  })
  role: UserRole;

  @ApiProperty({ 
    description: 'Client ID',
    format: 'uuid'
  })
  clientId: string;

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
    description: 'Creation date'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Created by user ID',
    format: 'uuid'
  })
  createdBy: string;
}