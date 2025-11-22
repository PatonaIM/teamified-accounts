import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  Check,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { EmploymentRecord } from '../../employment-records/entities/employment-record.entity';
import { PayrollPeriod } from '../../payroll/entities/payroll-period.entity';
import { TimesheetApproval } from './timesheet-approval.entity';

export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TimesheetType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

@Entity('timesheets')
@Index(['userId'])
@Index(['employmentRecordId'])
@Index(['payrollPeriodId'])
@Index(['workDate'])
@Index(['status'])
@Check(`"status" IN ('draft', 'submitted', 'approved', 'rejected')`)
@Check(`"timesheet_type" IN ('daily', 'weekly')`)
@Check(`"regular_hours" >= 0 AND "regular_hours" <= 24`)
@Check(`"overtime_hours" >= 0 AND "overtime_hours" <= 24`)
@Check(`"night_shift_hours" >= 0 AND "night_shift_hours" <= 24`)
@Check(`"double_overtime_hours" >= 0 AND "double_overtime_hours" <= 24`)
export class Timesheet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'employment_record_id', type: 'uuid' })
  employmentRecordId: string;

  @ManyToOne(() => EmploymentRecord)
  @JoinColumn({ name: 'employment_record_id' })
  employmentRecord: EmploymentRecord;

  @Column({ name: 'payroll_period_id', type: 'uuid', nullable: true })
  payrollPeriodId: string | null;

  @ManyToOne(() => PayrollPeriod)
  @JoinColumn({ name: 'payroll_period_id' })
  payrollPeriod: PayrollPeriod | null;

  @Column({
    name: 'timesheet_type',
    type: 'enum',
    enum: TimesheetType,
    default: TimesheetType.DAILY,
  })
  timesheetType: TimesheetType;

  @Column({ name: 'work_date', type: 'date' })
  workDate: Date;

  @Column({ name: 'week_start_date', type: 'date', nullable: true })
  weekStartDate: Date | null;

  @Column({ name: 'week_end_date', type: 'date', nullable: true })
  weekEndDate: Date | null;

  @Column({ name: 'weekly_hours_breakdown', type: 'jsonb', nullable: true })
  weeklyHoursBreakdown: {
    monday?: { regularHours: number; overtimeHours: number; doubleOvertimeHours: number; nightShiftHours: number };
    tuesday?: { regularHours: number; overtimeHours: number; doubleOvertimeHours: number; nightShiftHours: number };
    wednesday?: { regularHours: number; overtimeHours: number; doubleOvertimeHours: number; nightShiftHours: number };
    thursday?: { regularHours: number; overtimeHours: number; doubleOvertimeHours: number; nightShiftHours: number };
    friday?: { regularHours: number; overtimeHours: number; doubleOvertimeHours: number; nightShiftHours: number };
    saturday?: { regularHours: number; overtimeHours: number; doubleOvertimeHours: number; nightShiftHours: number };
    sunday?: { regularHours: number; overtimeHours: number; doubleOvertimeHours: number; nightShiftHours: number };
  } | null;

  @Column({ name: 'regular_hours', type: 'decimal', precision: 5, scale: 2, default: 0 })
  regularHours: number;

  @Column({ name: 'overtime_hours', type: 'decimal', precision: 5, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ name: 'double_overtime_hours', type: 'decimal', precision: 5, scale: 2, default: 0 })
  doubleOvertimeHours: number;

  @Column({ name: 'night_shift_hours', type: 'decimal', precision: 5, scale: 2, default: 0 })
  nightShiftHours: number;

  @Column({ name: 'total_hours', type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalHours: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: TimesheetStatus,
    default: TimesheetStatus.DRAFT,
  })
  status: TimesheetStatus;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'approved_by_id', type: 'uuid', nullable: true })
  approvedById: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: User | null;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt: Date | null;

  @Column({ name: 'rejected_by_id', type: 'uuid', nullable: true })
  rejectedById: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'rejected_by_id' })
  rejectedBy: User | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ name: 'payroll_processed', type: 'boolean', default: false })
  payrollProcessed: boolean;

  @Column({ name: 'payroll_processed_at', type: 'timestamp', nullable: true })
  payrollProcessedAt: Date | null;

  @Column({ name: 'calculation_metadata', type: 'jsonb', nullable: true })
  calculationMetadata: any | null;

  @OneToMany(() => TimesheetApproval, (approval) => approval.timesheet)
  approvals: TimesheetApproval[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

