import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Country } from '../../payroll/entities/country.entity';
import { PayrollPeriod } from '../../payroll/entities/payroll-period.entity';
import { LeaveApproval } from './leave-approval.entity';

export enum LeaveRequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum LeaveType {
  // India
  ANNUAL_LEAVE_IN = 'ANNUAL_LEAVE_IN',
  SICK_LEAVE_IN = 'SICK_LEAVE_IN',
  CASUAL_LEAVE_IN = 'CASUAL_LEAVE_IN',
  MATERNITY_LEAVE_IN = 'MATERNITY_LEAVE_IN',
  PATERNITY_LEAVE_IN = 'PATERNITY_LEAVE_IN',
  COMPENSATORY_OFF_IN = 'COMPENSATORY_OFF_IN',
  
  // Philippines
  VACATION_LEAVE_PH = 'VACATION_LEAVE_PH',
  SICK_LEAVE_PH = 'SICK_LEAVE_PH',
  MATERNITY_LEAVE_PH = 'MATERNITY_LEAVE_PH',
  PATERNITY_LEAVE_PH = 'PATERNITY_LEAVE_PH',
  SOLO_PARENT_LEAVE_PH = 'SOLO_PARENT_LEAVE_PH',
  SPECIAL_LEAVE_WOMEN_PH = 'SPECIAL_LEAVE_WOMEN_PH',
  
  // Australia
  ANNUAL_LEAVE_AU = 'ANNUAL_LEAVE_AU',
  SICK_CARERS_LEAVE_AU = 'SICK_CARERS_LEAVE_AU',
  LONG_SERVICE_LEAVE_AU = 'LONG_SERVICE_LEAVE_AU',
  PARENTAL_LEAVE_AU = 'PARENTAL_LEAVE_AU',
  COMPASSIONATE_LEAVE_AU = 'COMPASSIONATE_LEAVE_AU',
}

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'country_code', type: 'varchar', length: 3 })
  countryCode: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_code', referencedColumnName: 'code' })
  country: Country;

  @Column({
    name: 'leave_type',
    type: 'enum',
    enum: LeaveType,
    enumName: 'leave_type_enum',
  })
  leaveType: LeaveType;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'total_days', type: 'decimal', precision: 5, scale: 2 })
  totalDays: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: LeaveRequestStatus,
    enumName: 'leave_request_status_enum',
    default: LeaveRequestStatus.DRAFT,
  })
  status: LeaveRequestStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'payroll_period_id', type: 'uuid', nullable: true })
  payrollPeriodId: string | null;

  @ManyToOne(() => PayrollPeriod, { nullable: true })
  @JoinColumn({ name: 'payroll_period_id' })
  payrollPeriod: PayrollPeriod | null;

  @Column({ name: 'is_paid', type: 'boolean', default: true })
  isPaid: boolean;

  @OneToMany(() => LeaveApproval, (approval) => approval.leaveRequest)
  approvals: LeaveApproval[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

