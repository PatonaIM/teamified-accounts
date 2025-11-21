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

export enum PayrollPeriodStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

@Entity('payroll_periods')
export class PayrollPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'country_id', type: 'uuid' })
  countryId: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ name: 'period_name', type: 'varchar', length: 100 })
  periodName: string; // e.g., "January 2024", "Q1 2024"

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'pay_date', type: 'date' })
  payDate: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PayrollPeriodStatus,
    default: PayrollPeriodStatus.DRAFT,
  })
  status: PayrollPeriodStatus;

  @Column({ name: 'total_employees', type: 'int', default: 0 })
  totalEmployees: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

