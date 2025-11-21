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
@Check(`"role_type" IN ('candidate', 'eor', 'admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client')`)
@Check(`"scope" IN ('user', 'group', 'client', 'all')`)
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ 
    name: 'role_type', 
    length: 50 
  })
  roleType: 'candidate' | 'eor' | 'admin' | 'hr' | 'account_manager' | 'recruiter' | 'hr_manager_client';

  @Column({ 
    name: 'scope', 
    length: 20 
  })
  scope: 'user' | 'group' | 'client' | 'all';

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
