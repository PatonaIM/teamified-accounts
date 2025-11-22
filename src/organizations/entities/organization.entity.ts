import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
  Check,
} from 'typeorm';
import { OrganizationMember } from './organization-member.entity';
import { Invitation } from '../../invitations/entities/invitation.entity';

@Entity('organizations')
@Index(['slug'], { unique: true })
@Check(`"subscription_tier" IN ('free', 'basic', 'professional', 'enterprise', 'internal')`)
@Check(`"subscription_status" IN ('active', 'inactive', 'suspended', 'cancelled')`)
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ length: 100, nullable: true })
  industry: string | null;

  @Column({ name: 'company_size', length: 20, nullable: true })
  companySize: string | null;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  website: string | null;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  @Column({ 
    name: 'subscription_tier', 
    length: 50, 
    default: 'free' 
  })
  subscriptionTier: 'free' | 'basic' | 'professional' | 'enterprise' | 'internal';

  @Column({ 
    name: 'subscription_status', 
    length: 50, 
    default: 'active' 
  })
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'cancelled';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => OrganizationMember, (member) => member.organization)
  members?: OrganizationMember[];

  @OneToMany(() => Invitation, (invitation) => invitation.organization)
  invitations?: Invitation[];
}
