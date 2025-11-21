import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PayrollPeriod } from './payroll-period.entity';
import { PayrollProcessingLog } from './payroll-processing-log.entity';

export enum MetricType {
  PROCESSING_TIME = 'processing_time',
  CALCULATION_TIME = 'calculation_time',
  TIMESHEET_FETCH = 'timesheet_fetch',
  LEAVE_FETCH = 'leave_fetch',
  PAYSLIP_STORAGE = 'payslip_storage',
  PDF_GENERATION = 'pdf_generation',
  NOTIFICATION_SEND = 'notification_send',
  API_RESPONSE_TIME = 'api_response_time',
  DATABASE_QUERY_TIME = 'database_query_time',
}

@Entity('performance_metrics')
@Index(['metricType', 'recordedAt'])
@Index(['payrollPeriodId', 'metricType'])
@Index(['processingLogId'])
export class PerformanceMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'metric_type',
    type: 'varchar',
    length: 50,
  })
  metricType: MetricType;

  @Column({
    name: 'metric_name',
    type: 'varchar',
    length: 100,
  })
  metricName: string;

  @Column({
    name: 'metric_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  metricValue: number;

  @Column({
    name: 'metric_unit',
    type: 'varchar',
    length: 20,
    default: 'ms',
  })
  metricUnit: string;

  @Column({ name: 'payroll_period_id', type: 'uuid', nullable: true })
  payrollPeriodId: string | null;

  @ManyToOne(() => PayrollPeriod, { nullable: true })
  @JoinColumn({ name: 'payroll_period_id' })
  payrollPeriod: PayrollPeriod | null;

  @Column({ name: 'processing_log_id', type: 'uuid', nullable: true })
  processingLogId: string | null;

  @ManyToOne(() => PayrollProcessingLog, { nullable: true })
  @JoinColumn({ name: 'processing_log_id' })
  processingLog: PayrollProcessingLog | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'country_id', type: 'uuid', nullable: true })
  countryId: string | null;

  @Column({ name: 'additional_data', type: 'jsonb', nullable: true })
  additionalData: any | null;

  @Column({
    name: 'recorded_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Index()
  recordedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

