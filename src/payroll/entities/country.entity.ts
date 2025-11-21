import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Currency } from './currency.entity';
import { TaxYear } from './tax-year.entity';
import { RegionConfiguration } from './region-configuration.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'code', type: 'varchar', length: 3, unique: true })
  code: string; // ISO 3166-1 alpha-2 code (IN, PH, AU, etc.)

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'currency_id', type: 'uuid' })
  currencyId: string;

  @ManyToOne(() => Currency, { eager: true })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({ name: 'tax_year_start_month', type: 'int' })
  taxYearStartMonth: number; // 1-12 (e.g., 4 for April in India, 7 for July in Australia)

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => TaxYear, (taxYear) => taxYear.country)
  taxYears: TaxYear[];

  @OneToMany(() => RegionConfiguration, (config) => config.country)
  regionConfigurations: RegionConfiguration[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

