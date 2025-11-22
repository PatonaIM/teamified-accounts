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

@Entity('region_configurations')
export class RegionConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'country_id', type: 'uuid' })
  countryId: string;

  @ManyToOne(() => Country, (country) => country.regionConfigurations)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ name: 'config_key', type: 'varchar', length: 100 })
  configKey: string; // e.g., 'overtime_multiplier', 'night_shift_premium'

  @Column({ name: 'config_value', type: 'jsonb' })
  configValue: any; // Flexible JSON storage for country-specific settings

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

