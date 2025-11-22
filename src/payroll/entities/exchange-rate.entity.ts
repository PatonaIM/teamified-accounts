import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Currency } from './currency.entity';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'from_currency_id', type: 'uuid' })
  fromCurrencyId: string;

  @ManyToOne(() => Currency, (currency) => currency.exchangeRatesFrom)
  @JoinColumn({ name: 'from_currency_id' })
  fromCurrency: Currency;

  @Column({ name: 'to_currency_id', type: 'uuid' })
  toCurrencyId: string;

  @ManyToOne(() => Currency, (currency) => currency.exchangeRatesTo)
  @JoinColumn({ name: 'to_currency_id' })
  toCurrency: Currency;

  @Column({ name: 'rate', type: 'decimal', precision: 18, scale: 6 })
  rate: number;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

