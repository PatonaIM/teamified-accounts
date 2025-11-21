import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  Check,
  Unique,
} from 'typeorm';

@Entity('employment_records')
@Index(['userId'])
@Index(['clientId'])
@Index(['countryId'])
@Index(['status'])
@Index(['startDate'])
@Check(`"status" IN ('onboarding', 'active', 'inactive', 'offboarding', 'terminated', 'completed')`)
@Check(`"end_date" IS NULL OR "end_date" >= "start_date"`)
@Unique('unique_active_employment_per_client', ['userId', 'clientId', 'status'])
export class EmploymentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @Column({ name: 'country_id', type: 'uuid' })
  countryId: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ name: 'role', length: 100 })
  role: string;

  @Column({ 
    name: 'status', 
    length: 20, 
    default: 'active',
    type: 'varchar'
  })
  status: 'onboarding' | 'active' | 'inactive' | 'offboarding' | 'terminated' | 'completed';

  @Column({ name: 'migrated_from_zoho', default: false })
  migratedFromZoho: boolean;

  @Column({ name: 'zoho_employment_id', length: 100, nullable: true })
  zohoEmploymentId: string | null;

  @Column({ name: 'onboarding_submitted_at', type: 'timestamp with time zone', nullable: true })
  onboardingSubmittedAt: Date | null;

  @Column({ name: 'onboarding_completed_at', type: 'timestamp with time zone', nullable: true })
  onboardingCompletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Client', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: any;

  @ManyToOne('Country', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'country_id' })
  country: any;

  @OneToMany('SalaryHistory', 'employmentRecord')
  salaryHistory?: any[];
}
