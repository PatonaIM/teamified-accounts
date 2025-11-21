import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('supabase_deletion_failures')
export class SupabaseDeletionFailure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  supabaseUserId: string;

  @Column()
  email: string;

  @Column('uuid')
  portalUserId: string;

  @Column()
  deletedBy: string;

  @Column('int')
  attempts: number;

  @Column('text')
  lastError: string;

  @Column('text', { nullable: true })
  errorStack: string;

  @CreateDateColumn()
  failedAt: Date;

  @Column({
    type: 'enum',
    enum: ['requires_manual_intervention', 'manually_resolved', 'retrying'],
    default: 'requires_manual_intervention',
  })
  status: string;

  @Column('timestamp', { nullable: true })
  resolvedAt: Date;

  @Column('text', { nullable: true })
  resolutionNotes: string;
}
