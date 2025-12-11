import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum EmailType {
  PERSONAL = 'personal',
  WORK = 'work',
}

@Entity('user_emails')
@Unique(['email', 'organizationId'])
@Index(['userId'])
@Index(['email'])
@Index(['organizationId'])
export class UserEmail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({
    name: 'email_type',
    type: 'varchar',
    length: 20,
    default: EmailType.PERSONAL,
  })
  emailType: EmailType;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'verification_token', type: 'varchar', nullable: true })
  verificationToken: string | null;

  @Column({ name: 'verification_token_expiry', type: 'timestamptz', nullable: true })
  verificationTokenExpiry: Date | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Organization, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization | null;
}
