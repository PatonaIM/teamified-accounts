import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum Country {
  US = 'US',
  IN = 'IN',
  PH = 'PH',
  MX = 'MX',
  BR = 'BR',
  GB = 'GB',
  CA = 'CA',
  AU = 'AU',
}

export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
  RECRUITER = 'recruiter',
  EOR = 'eor',
  CANDIDATE = 'candidate',
  ACCOUNT_MANAGER = 'account_manager',
  HR_MANAGER_CLIENT = 'hr_manager_client',
}

/**
 * Legacy Invitation Entity
 * 
 * This entity represents the OLD invitation system (pre-multitenancy).
 * It uses the 'invitations' table and supports email-based invitations.
 * 
 * TODO: CLEANUP - Remove this entity after migrating all invitations to the new system
 * See: docs/Multitenancy_Features_PRD.md - Section on Legacy Invitation Cleanup
 */
@Entity('invitations')
@Index(['email'])
@Index(['status'])
@Index(['expiresAt'])
export class LegacyInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 2 })
  country: Country;

  @Column({ type: 'varchar', length: 50 })
  role: 'admin' | 'hr' | 'recruiter' | 'eor' | 'candidate' | 'account_manager' | 'hr_manager_client';

  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId: string | null;

  @Column({ length: 255, unique: true })
  token: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true })
  acceptedAt: Date | null;

  @Column({ name: 'accepted_by', type: 'uuid', nullable: true })
  acceptedBy: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
