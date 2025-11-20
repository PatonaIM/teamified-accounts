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
// Note: CHECK constraints removed to support legacy role types during migration
// Database allows both legacy (admin, eor, hr) and canonical (client_admin, client_employee, etc.) role types
// Backward compatibility handled by permission matrix in UserRolesService
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ 
    name: 'role_type', 
    length: 50 
  })
  roleType: string; // Accepts both legacy and canonical role types for backward compatibility

  @Column({ 
    name: 'scope', 
    length: 20 
  })
  scope: string; // Accepts both legacy and canonical scopes for backward compatibility

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
