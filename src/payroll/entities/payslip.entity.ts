import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Country } from './country.entity';
import { PayrollPeriod } from './payroll-period.entity';

/**
 * Payslip Entity
 * Stores payroll calculation results from Story 7.3 for employee access
 * This is a STORAGE-ONLY entity - all calculations come from PayrollCalculationService
 */
@Entity('payslips')
export class Payslip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'country_id' })
  countryId: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ name: 'payroll_period_id' })
  payrollPeriodId: string;

  @ManyToOne(() => PayrollPeriod)
  @JoinColumn({ name: 'payroll_period_id' })
  payrollPeriod: PayrollPeriod;

  @Column({ name: 'calculation_id', unique: true })
  calculationId: string;

  @Column({ name: 'calculated_at', type: 'timestamp' })
  calculatedAt: Date;

  // Core amounts
  @Column({ name: 'gross_pay', type: 'decimal', precision: 12, scale: 2 })
  grossPay: number;

  @Column({ name: 'basic_salary', type: 'decimal', precision: 12, scale: 2 })
  basicSalary: number;

  @Column({ name: 'total_earnings', type: 'decimal', precision: 12, scale: 2 })
  totalEarnings: number;

  @Column({ name: 'overtime_pay', type: 'decimal', precision: 12, scale: 2, nullable: true })
  overtimePay: number | null;

  @Column({ name: 'night_shift_pay', type: 'decimal', precision: 12, scale: 2, nullable: true })
  nightShiftPay: number | null;

  @Column({ name: 'total_statutory_deductions', type: 'decimal', precision: 12, scale: 2 })
  totalStatutoryDeductions: number;

  @Column({ name: 'total_other_deductions', type: 'decimal', precision: 12, scale: 2 })
  totalOtherDeductions: number;

  @Column({ name: 'total_deductions', type: 'decimal', precision: 12, scale: 2 })
  totalDeductions: number;

  @Column({ name: 'net_pay', type: 'decimal', precision: 12, scale: 2 })
  netPay: number;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

  // Detailed breakdowns stored as JSONB
  @Column({ name: 'salary_components', type: 'jsonb' })
  salaryComponents: Array<{
    componentId: string;
    componentName: string;
    componentType: string;
    amount: number;
    currencyCode: string;
    calculationMethod: string;
    baseAmount?: number;
    rate?: number;
  }>;

  @Column({ name: 'statutory_deductions', type: 'jsonb' })
  statutoryDeductions: Array<{
    componentId: string;
    componentName: string;
    componentType: string;
    employeeContribution: number;
    employerContribution: number;
    totalContribution: number;
    currencyCode: string;
    calculationBasis: string;
    rate?: number;
  }>;

  @Column({ name: 'other_deductions', type: 'jsonb' })
  otherDeductions: Array<{
    componentId: string;
    componentName: string;
    componentType: string;
    amount: number;
    currencyCode: string;
    calculationMethod: string;
    baseAmount?: number;
    rate?: number;
  }>;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  // Payslip status and access
  @Column({ name: 'status', default: 'draft' })
  status: 'draft' | 'processing' | 'available' | 'downloaded';

  @Column({ name: 'pdf_path', nullable: true })
  pdfPath: string | null;

  @Column({ name: 'pdf_generated_at', type: 'timestamp', nullable: true })
  pdfGeneratedAt: Date | null;

  @Column({ name: 'first_downloaded_at', type: 'timestamp', nullable: true })
  firstDownloadedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

