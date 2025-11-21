import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
  Unique,
} from 'typeorm';

@Entity('salary_history')
@Index(['employmentRecordId'])
@Index(['effectiveDate'])
@Check(`"salary_amount" > 0`)
@Unique('unique_effective_date_per_employment', ['employmentRecordId', 'effectiveDate'])
export class SalaryHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employment_record_id', type: 'uuid' })
  employmentRecordId: string;

  @Column({ 
    name: 'salary_amount', 
    type: 'decimal', 
    precision: 12, 
    scale: 2 
  })
  salaryAmount: number;

  @Column({ 
    name: 'salary_currency', 
    length: 3, 
    default: 'USD' 
  })
  salaryCurrency: string;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @Column({ 
    name: 'change_reason', 
    length: 100 
  })
  changeReason: string;

  @Column({ name: 'changed_by', type: 'uuid', nullable: true })
  changedBy: string | null;

  @Column({ name: 'migrated_from_zoho', default: false })
  migratedFromZoho: boolean;

  @Column({ name: 'zoho_salary_id', length: 100, nullable: true })
  zohoSalaryId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne('EmploymentRecord', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employment_record_id' })
  employmentRecord: any;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'changed_by' })
  changedByUser: any;
}
