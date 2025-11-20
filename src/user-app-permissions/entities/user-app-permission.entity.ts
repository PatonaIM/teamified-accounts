import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { OAuthClient } from '../../oauth-clients/entities/oauth-client.entity';

@Entity('user_app_permissions')
@Index(['user_id', 'oauth_client_id'], { unique: true })
export class UserAppPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  oauth_client_id: string;

  @ManyToOne(() => OAuthClient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'oauth_client_id' })
  oauthClient: OAuthClient;

  @Column({
    type: 'varchar',
    length: 20,
    comment: 'Explicit permission override: allow = grant access, deny = revoke access',
  })
  permission: 'allow' | 'deny';

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: 'Future use for granular permissions (e.g., read-only, full)',
  })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  granted_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'granted_by' })
  grantedByUser: User;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
