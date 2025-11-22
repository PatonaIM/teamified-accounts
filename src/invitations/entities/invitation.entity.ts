import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../auth/entities/user.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('invitations')
@Index(['inviteCode'], { unique: true })
@Index(['organizationId'])
@Index(['status'])
@Index(['expiresAt'])
@Check(`"status" IN ('pending', 'accepted', 'expired', 'cancelled')`)
@Check(`"role_type" IN (
  'candidate',
  'client_admin',
  'client_hr',
  'client_finance',
  'client_recruiter',
  'client_employee',
  'super_admin',
  'internal_employee',
  'internal_hr',
  'internal_recruiter',
  'internal_account_manager',
  'internal_finance',
  'internal_marketing'
)`)
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ name: 'invite_code', length: 100, unique: true })
  inviteCode: string;

  @Column({ name: 'invited_by', type: 'uuid' })
  invitedBy: string;

  @Column({ name: 'invited_user_id', type: 'uuid', nullable: true })
  invitedUserId: string | null;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ 
    name: 'role_type', 
    length: 50 
  })
  roleType: 
    | 'candidate'
    | 'client_admin'
    | 'client_hr'
    | 'client_finance'
    | 'client_recruiter'
    | 'client_employee'
    | 'super_admin'
    | 'internal_employee'
    | 'internal_hr'
    | 'internal_recruiter'
    | 'internal_account_manager'
    | 'internal_finance'
    | 'internal_marketing';

  @Column({
    type: 'varchar',
    length: 20,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ name: 'expires_at', type: 'timestamptz', default: () => "NOW() + INTERVAL '7 days'" })
  expiresAt: Date;

  @Column({ name: 'max_uses', type: 'integer', nullable: true })
  maxUses: number | null;

  @Column({ name: 'current_uses', type: 'integer', default: 0 })
  currentUses: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_by' })
  inviter: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'invited_user_id' })
  invitedUser: User | null;
}
