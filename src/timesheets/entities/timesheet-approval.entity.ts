import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Timesheet } from './timesheet.entity';

export enum ApprovalAction {
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESUBMITTED = 'resubmitted',
}

@Entity('timesheet_approvals')
@Index(['timesheetId'])
@Index(['reviewerId'])
@Index(['action'])
@Index(['actionDate'])
@Check(`"action" IN ('submitted', 'approved', 'rejected', 'resubmitted')`)
export class TimesheetApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'timesheet_id', type: 'uuid' })
  timesheetId: string;

  @ManyToOne(() => Timesheet, (timesheet) => timesheet.approvals)
  @JoinColumn({ name: 'timesheet_id' })
  timesheet: Timesheet;

  @Column({ name: 'reviewer_id', type: 'uuid', nullable: true })
  reviewerId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User | null;

  @Column({
    name: 'action',
    type: 'enum',
    enum: ApprovalAction,
  })
  action: ApprovalAction;

  @Column({ name: 'action_date', type: 'timestamp' })
  actionDate: Date;

  @Column({ name: 'comments', type: 'text', nullable: true })
  comments: string | null;

  @Column({ name: 'previous_status', type: 'varchar', length: 20, nullable: true })
  previousStatus: string | null;

  @Column({ name: 'new_status', type: 'varchar', length: 20 })
  newStatus: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: any | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

