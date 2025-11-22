import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ExchangeRate } from './exchange-rate.entity';

@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'code', type: 'varchar', length: 3, unique: true })
  code: string; // ISO 4217 code (INR, PHP, AUD, USD, EUR, etc.)

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'symbol', type: 'varchar', length: 10 })
  symbol: string; // ₹, ₱, $, €, etc.

  @Column({ name: 'decimal_places', type: 'int', default: 2 })
  decimalPlaces: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ExchangeRate, (rate) => rate.fromCurrency)
  exchangeRatesFrom: ExchangeRate[];

  @OneToMany(() => ExchangeRate, (rate) => rate.toCurrency)
  exchangeRatesTo: ExchangeRate[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

