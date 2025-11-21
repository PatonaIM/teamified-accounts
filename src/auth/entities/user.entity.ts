import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';

@Entity('users')
@Index(['email'])
@Check(`"status" IN ('active', 'inactive', 'archived')`)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'address', type: 'jsonb', nullable: true })
  address: any | null;

  @Column({ name: 'profile_data', type: 'jsonb', nullable: true })
  profileData: any | null;

  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId: string | null;

  @Column({ 
    name: 'status', 
    length: 20, 
    default: 'active',
    type: 'varchar'
  })
  status: 'active' | 'inactive' | 'archived';

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true })
  emailVerificationToken: string | null;

  @Column({ name: 'email_verification_token_expiry', type: 'timestamptz', nullable: true })
  emailVerificationTokenExpiry: Date | null;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken: string | null;

  @Column({ name: 'migrated_from_zoho', default: false })
  migratedFromZoho: boolean;

  @Column({ name: 'zoho_user_id', length: 100, nullable: true })
  zohoUserId: string | null;

  @Column({ name: 'supabase_user_id', type: 'uuid', nullable: true, unique: true })
  @Index()
  supabaseUserId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne('Client', { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client?: any;

  @OneToOne('EORProfile', 'user')
  eorProfile?: any;

  @OneToMany('EmploymentRecord', 'user')
  employmentRecords?: any[];

  @OneToMany('UserRole', 'user')
  userRoles?: any[];
}