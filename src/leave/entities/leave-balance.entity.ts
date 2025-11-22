import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Country } from '../../payroll/entities/country.entity';
import { LeaveType } from './leave-request.entity';

@Entity('leave_balances')
@Unique(['userId', 'countryCode', 'leaveType'])
export class LeaveBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'country_code', type: 'varchar', length: 3 })
  countryCode: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_code', referencedColumnName: 'code' })
  country: Country;

  @Column({
    name: 'leave_type',
    type: 'enum',
    enum: LeaveType,
    enumName: 'leave_type_enum',
  })
  leaveType: LeaveType;

  @Column({ name: 'total_days', type: 'decimal', precision: 6, scale: 2, default: 0 })
  totalDays: number;

  @Column({ name: 'used_days', type: 'decimal', precision: 6, scale: 2, default: 0 })
  usedDays: number;

  @Column({ name: 'available_days', type: 'decimal', precision: 6, scale: 2, default: 0 })
  availableDays: number;

  @Column({ name: 'accrual_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  accrualRate: number;

  @Column({ name: 'year', type: 'int' })
  year: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

