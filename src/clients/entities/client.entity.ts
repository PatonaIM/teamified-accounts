import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Check,
} from 'typeorm';

@Entity('clients')
@Check(`"status" IN ('active', 'inactive')`)
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'contact_info', type: 'jsonb', nullable: true })
  contactInfo: any | null;

  @Column({ 
    name: 'status', 
    length: 20, 
    default: 'active',
    type: 'varchar'
  })
  status: 'active' | 'inactive';

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'migrated_from_zoho', default: false })
  migratedFromZoho: boolean;

  @Column({ name: 'zoho_client_id', length: 100, nullable: true })
  zohoClientId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany('EmploymentRecord', 'client')
  employmentRecords?: any[];
}