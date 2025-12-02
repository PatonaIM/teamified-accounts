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

@Entity('user_oauth_logins')
@Index(['user_id', 'oauth_client_id'], { unique: true })
export class UserOAuthLogin {
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

  @Column({ type: 'int', default: 1 })
  login_count: number;

  @Column({ type: 'timestamp', nullable: true })
  first_login_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
