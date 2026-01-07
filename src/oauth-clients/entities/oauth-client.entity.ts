import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export type IntentType = 'client' | 'candidate' | 'both';
export type EnvironmentType = 'development' | 'staging' | 'production';

export interface RedirectUri {
  uri: string;
  environment: EnvironmentType;
}

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

  @Column({ type: 'jsonb', default: [] })
  redirect_uris: RedirectUri[];

  @Column({ type: 'simple-array', nullable: true })
  deleted_redirect_uris: string[];

  @Column({ default: true })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: ['client', 'candidate', 'both'],
    default: 'both',
  })
  default_intent: IntentType;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    app_url?: string;
    owner?: string;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date | null;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ default: false })
  allow_client_credentials: boolean;

  @Column({ type: 'simple-array', nullable: true })
  allowed_scopes: string[];

  @Column({ type: 'text', nullable: true })
  logout_uri: string;
}
