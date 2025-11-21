import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('oauth_clients')
export class OAuthClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  client_id: string;

  @Column()
  client_secret: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array' })
  redirect_uris: string[];

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    app_url?: string;
    owner?: string;
    environment?: 'development' | 'staging' | 'production';
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;
}
