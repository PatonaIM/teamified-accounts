import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('onboarding_document_requirements')
export class OnboardingDocumentRequirements {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cv_required', type: 'integer', default: 1 })
  cvRequired: number;

  @Column({ name: 'identity_required', type: 'integer', default: 1 })
  identityRequired: number;

  @Column({ name: 'employment_required', type: 'integer', default: 1 })
  employmentRequired: number;

  @Column({ name: 'education_required', type: 'integer', default: 1 })
  educationRequired: number;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
