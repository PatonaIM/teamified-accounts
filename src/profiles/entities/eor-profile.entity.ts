import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import {
  IsOptional,
  IsDateString,
  IsPhoneNumber,
  IsString,
  MaxLength,
  IsArray,
  IsIn,
  IsInt,
  Min,
  Max,
  IsBoolean,
  Length,
  IsISO8601,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { User } from '../../auth/entities/user.entity';
import { Document } from '../../documents/entities/document.entity';

@Entity('eor_profiles')
export class EORProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToMany(() => Document, (document) => document.eorProfile)
  documents: Document[];

  // Personal Information
  @IsOptional()
  @IsDateString()
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Column({ name: 'address_line1', nullable: true })
  addressLine1: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Column({ name: 'address_line2', nullable: true })
  addressLine2: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Column({ name: 'city', nullable: true })
  city: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Column({ name: 'state_province', nullable: true })
  stateProvince: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Column({ name: 'postal_code', nullable: true })
  postalCode: string | null;

  // Professional Information
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Column({ name: 'job_title', nullable: true })
  jobTitle: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Column({ name: 'department', nullable: true })
  department: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Column({ name: 'employee_id', nullable: true })
  employeeId: string | null;

  @IsOptional()
  @IsDateString()
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Column({ name: 'employment_type', nullable: true })
  employmentType: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Column({ name: 'manager_name', nullable: true })
  managerName: string | null;

  // CV Information
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Column({ name: 'skills', type: 'jsonb', nullable: true })
  skills: string[] | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  @Column({ name: 'experience_years', type: 'integer', nullable: true })
  experienceYears: number | null;

  @Column({ name: 'education', type: 'jsonb', nullable: true })
  education: Array<{
    degree: string;
    institution: string;
    year: number;
    field?: string;
  }> | null;

  @Column({ name: 'certifications', type: 'jsonb', nullable: true })
  certifications: Array<{
    name: string;
    issuer: string;
    year: number;
    expiryYear?: number;
  }> | null;

  @Column({ name: 'languages', type: 'jsonb', nullable: true })
  languages: Array<{
    language: string;
    proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
  }> | null;

  // Profile Completion
  @IsInt()
  @Min(0)
  @Max(100)
  @Column({ name: 'profile_completion_percentage', type: 'integer', default: 0 })
  profileCompletionPercentage: number;

  @IsBoolean()
  @Column({ name: 'is_profile_complete', default: false })
  isProfileComplete: boolean;

  @IsIn(['incomplete', 'pending', 'complete'])
  @Column({ name: 'profile_status', default: 'incomplete' })
  profileStatus: 'incomplete' | 'pending' | 'complete';

  // Country Configuration
  @Length(2, 2)
  @Column({ name: 'country_code', length: 2 })
  countryCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Column({ name: 'timezone', nullable: true })
  timezone: string | null;

  // Emergency Contact
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Column({ name: 'emergency_contact_relationship', nullable: true })
  emergencyContactRelationship: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}