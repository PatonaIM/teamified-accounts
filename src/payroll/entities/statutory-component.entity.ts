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

export enum StatutoryComponentType {
  // India
  EPF = 'epf', // Employee Provident Fund
  ESI = 'esi', // Employee State Insurance
  PT = 'pt', // Professional Tax
  TDS = 'tds', // Tax Deducted at Source
  
  // Philippines
  SSS = 'sss', // Social Security System
  PHILHEALTH = 'philhealth', // PhilHealth
  PAGIBIG = 'pagibig', // Pag-IBIG Fund
  
  // Australia
  SUPERANNUATION = 'superannuation', // Superannuation Guarantee
  
  // Malaysia
  EPF_MY = 'epf_my', // Malaysia EPF
  SOCSO = 'socso', // Social Security Organization
  EIS = 'eis', // Employment Insurance Scheme
  
  // Singapore
  CPF = 'cpf', // Central Provident Fund
}

export enum ContributionType {
  EMPLOYEE = 'employee',
  EMPLOYER = 'employer',
  BOTH = 'both',
}

export enum CalculationBasis {
  GROSS_SALARY = 'gross_salary',
  BASIC_SALARY = 'basic_salary',
  CAPPED_AMOUNT = 'capped_amount',
  FIXED_AMOUNT = 'fixed_amount',
}

@Entity('statutory_components')
export class StatutoryComponent {
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
  componentCode: string; // e.g., 'EPF', 'ESI', 'SSS', 'PHILHEALTH'

  @Column({
    name: 'component_type',
    type: 'enum',
    enum: StatutoryComponentType,
  })
  componentType: StatutoryComponentType;

  @Column({
    name: 'contribution_type',
    type: 'enum',
    enum: ContributionType,
  })
  contributionType: ContributionType;

  @Column({
    name: 'calculation_basis',
    type: 'enum',
    enum: CalculationBasis,
  })
  calculationBasis: CalculationBasis;

  @Column({ name: 'employee_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  employeePercentage: number | null; // Employee contribution percentage

  @Column({ name: 'employer_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  employerPercentage: number | null; // Employer contribution percentage

  @Column({ name: 'minimum_amount', type: 'decimal', precision: 18, scale: 2, nullable: true })
  minimumAmount: number | null; // Minimum contribution amount

  @Column({ name: 'maximum_amount', type: 'decimal', precision: 18, scale: 2, nullable: true })
  maximumAmount: number | null; // Maximum contribution amount

  @Column({ name: 'wage_ceiling', type: 'decimal', precision: 18, scale: 2, nullable: true })
  wageCeiling: number | null; // Wage ceiling for calculation

  @Column({ name: 'wage_floor', type: 'decimal', precision: 18, scale: 2, nullable: true })
  wageFloor: number | null; // Wage floor for calculation

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: Date; // When this component becomes effective

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: Date | null; // When this component expires (null = indefinite)

  @Column({ name: 'is_mandatory', type: 'boolean', default: true })
  isMandatory: boolean; // Whether this is mandatory for all employees

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number; // Order in which components appear in UI

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'regulatory_reference', type: 'varchar', length: 200, nullable: true })
  regulatoryReference: string | null; // Reference to relevant labor law or regulation

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
