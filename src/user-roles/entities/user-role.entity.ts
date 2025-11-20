import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';

@Entity('user_roles')
@Index(['userId'])
@Index(['roleType'])
@Index(['scope'])
@Index(['expiresAt'])
@Index(['scopeEntityId'])
@Check(`"role_type" IN (
  'super_admin',
  'internal_member',
  'internal_hr',
  'internal_recruiter',
  'internal_account_manager',
  'internal_finance',
  'internal_marketing',
  'client_admin',
  'client_hr',
  'client_finance',
  'client_recruiter',
  'client_employee',
  'candidate'
)`)
@Check(`"scope" IN ('global', 'organization', 'individual', 'all')`)
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ 
    name: 'role_type', 
    length: 50 
  })
  roleType: 
    | 'super_admin'
    | 'internal_member'
    | 'internal_hr'
    | 'internal_recruiter'
    | 'internal_account_manager'
    | 'internal_finance'
    | 'internal_marketing'
    | 'client_admin'
    | 'client_hr'
    | 'client_finance'
    | 'client_recruiter'
    | 'client_employee'
    | 'candidate';

  @Column({ 
    name: 'scope', 
    length: 20 
  })
  scope: 'global' | 'organization' | 'individual' | 'all';

  @Column({ name: 'scope_entity_id', type: 'uuid', nullable: true })
  scopeEntityId: string | null;

  @Column({ name: 'granted_by', type: 'uuid', nullable: true })
  grantedBy: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'granted_by' })
  grantedByUser: any;
}
