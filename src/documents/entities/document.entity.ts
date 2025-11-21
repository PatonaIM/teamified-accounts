import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Check,
} from 'typeorm';
import { EORProfile } from '../../profiles/entities/eor-profile.entity';
import { User } from '../../auth/entities/user.entity';

export enum DocumentType {
  CV = 'CV',
  PAYSLIP = 'PAYSLIP',
  HR_DOCUMENT = 'HR_DOCUMENT',
  TAX_DOCUMENT = 'TAX_DOCUMENT',
}

@Entity('documents')
@Check(`(eor_profile_id IS NOT NULL AND user_id IS NULL) OR (eor_profile_id IS NULL AND user_id IS NOT NULL)`)
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // For EOR employees - links to their EOR profile
  @ManyToOne(() => EORProfile, (eorProfile) => eorProfile.documents, { nullable: true })
  @JoinColumn({ name: 'eor_profile_id' })
  eorProfile?: EORProfile;

  @Column({ name: 'eor_profile_id', nullable: true })
  eorProfileId?: string;

  // For candidates - links directly to user
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column({ name: 'category', nullable: true })
  category: string | null;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'content_type' })
  contentType: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'sha256_checksum' })
  sha256Checksum: string;

  @Column({ name: 'version_id' })
  versionId: string;

  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;

  @Column({ name: 'status', nullable: true })
  status: 'pending' | 'approved' | 'rejected' | 'needs_changes' | null;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedByUser: User;

  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @Column({ name: 'uploaded_by_role', default: 'candidate' })
  uploadedByRole: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}