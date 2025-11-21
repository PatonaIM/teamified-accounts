import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ApiKeyType {
  FULL_ACCESS = 'full_access',
  READ_ONLY = 'read_only',
}

@Entity('api_keys')
@Index('IDX_API_KEY_PREFIX', ['keyPrefix'])
export class ApiKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 10 })
  @Index()
  keyPrefix: string; // First 10 chars of key (e.g., 'tmf_1a2b3c') for fast lookup

  @Column({ length: 255, unique: true })
  keyHash: string; // bcrypt hash of the full key

  @Column({
    type: 'enum',
    enum: ApiKeyType,
    default: ApiKeyType.READ_ONLY,
  })
  type: ApiKeyType;

  @Column({ type: 'int' })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
