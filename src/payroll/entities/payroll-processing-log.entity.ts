import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Country } from './country.entity';
import { PayrollPeriod } from './payroll-period.entity';

export enum ProcessingStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('payroll_processing_logs')
export class PayrollProcessingLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'country_id', type: 'uuid' })
  countryId: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ name: 'payroll_period_id', type: 'uuid', nullable: true })
  payrollPeriodId: string | null;

  @ManyToOne(() => PayrollPeriod)
  @JoinColumn({ name: 'payroll_period_id' })
  payrollPeriod: PayrollPeriod | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.STARTED,
  })
  status: ProcessingStatus;

  @Column({ name: 'started_at', type: 'timestamp' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'employees_processed', type: 'int', default: 0 })
  employeesProcessed: number;

  @Column({ name: 'employees_failed', type: 'int', default: 0 })
  employeesFailed: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'error_details', type: 'jsonb', nullable: true })
  errorDetails: any | null;

  @Column({ name: 'processing_metadata', type: 'jsonb', nullable: true })
  processingMetadata: any | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

