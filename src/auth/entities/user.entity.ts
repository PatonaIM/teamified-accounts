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
@Check(`"status" IN ('active', 'inactive', 'archived', 'invited', 'suspended')`)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string | null;

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

  @Column({ 
    name: 'status', 
    length: 20, 
    default: 'invited',
    type: 'varchar'
  })
  status: 'active' | 'inactive' | 'archived' | 'invited' | 'suspended';

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true })
  emailVerificationToken: string | null;

  @Column({ name: 'email_verification_token_expiry', type: 'timestamptz', nullable: true })
  emailVerificationTokenExpiry: Date | null;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken: string | null;

  @Column({ name: 'password_reset_token_expiry', type: 'timestamptz', nullable: true })
  passwordResetTokenExpiry: Date | null;

  @Column({ name: 'migrated_from_zoho', default: false })
  migratedFromZoho: boolean;

  @Column({ name: 'zoho_user_id', length: 100, nullable: true })
  zohoUserId: string | null;

  @Column({ name: 'supabase_user_id', type: 'uuid', nullable: true, unique: true })
  @Index()
  supabaseUserId: string | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'theme_preference', length: 20, nullable: true, default: 'light' })
  themePreference: 'light' | 'dark' | null;

  @Column({ name: 'profile_picture_url', type: 'text', nullable: true })
  profilePictureUrl: string | null;

  @Column({ name: 'must_change_password', default: false })
  mustChangePassword: boolean;

  @Column({ name: 'password_changed_by_admin_at', type: 'timestamptz', nullable: true })
  passwordChangedByAdminAt: Date | null;

  @Column({ name: 'password_changed_by_admin_id', type: 'uuid', nullable: true })
  passwordChangedByAdminId: string | null;

  @Column({ name: 'password_updated_at', type: 'timestamptz', nullable: true })
  passwordUpdatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'deleted_email', nullable: true })
  deletedEmail: string | null;

  @Column({ name: 'deleted_by', type: 'uuid', nullable: true })
  deletedBy: string | null;

  @Column({ name: 'deleted_reason', nullable: true })
  deletedReason: string | null;

  // Relations
  @OneToMany('UserRole', 'user')
  userRoles?: any[];

  @OneToMany('OrganizationMember', 'user')
  organizationMembers?: any[];
}