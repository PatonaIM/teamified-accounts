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

export enum SalaryComponentType {
  EARNINGS = 'earnings',
  DEDUCTIONS = 'deductions',
  BENEFITS = 'benefits',
  REIMBURSEMENTS = 'reimbursements',
}

export enum CalculationType {
  FIXED_AMOUNT = 'fixed_amount',
  PERCENTAGE_OF_BASIC = 'percentage_of_basic',
  PERCENTAGE_OF_GROSS = 'percentage_of_gross',
  PERCENTAGE_OF_NET = 'percentage_of_net',
  FORMULA = 'formula',
}

@Entity('salary_components')
export class SalaryComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'country_id', type: 'uuid' })
  countryId: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ name: 'component_name', type: 'varchar', length: 100 })
  componentName: string;

  @Column({ name: 'component_code', type: 'varchar', length: 50 })
  componentCode: string; // e.g., 'BASIC', 'HRA', 'PF', 'TAX'

  @Column({
    name: 'component_type',
    type: 'enum',
    enum: SalaryComponentType,
  })
  componentType: SalaryComponentType;

  @Column({
    name: 'calculation_type',
    type: 'enum',
    enum: CalculationType,
  })
  calculationType: CalculationType;

  @Column({ name: 'calculation_value', type: 'decimal', precision: 18, scale: 4, nullable: true })
  calculationValue: number | null; // For fixed amounts or percentage values

  @Column({ name: 'calculation_formula', type: 'text', nullable: true })
  calculationFormula: string | null; // For complex formula-based calculations

  @Column({ name: 'is_taxable', type: 'boolean', default: true })
  isTaxable: boolean;

  @Column({ name: 'is_statutory', type: 'boolean', default: false })
  isStatutory: boolean; // Whether this is a statutory component (EPF, ESI, etc.)

  @Column({ name: 'is_mandatory', type: 'boolean', default: false })
  isMandatory: boolean; // Whether this component is mandatory for all employees

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number; // Order in which components appear in UI

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
