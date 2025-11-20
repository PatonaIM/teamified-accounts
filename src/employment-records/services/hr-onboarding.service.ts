import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmploymentRecord } from '../entities/employment-record.entity';
import { User } from '../../auth/entities/user.entity';
import { Document } from '../../documents/entities/document.entity';
import { UserRole } from '../../user-roles/entities/user-role.entity';
import { DocumentRequirementsService } from '../../documents/services/document-requirements.service';

export interface OnboardingCandidate {
  employmentRecordId: string;
  userId: string;
  userName: string;
  userEmail: string;
  submittedAt: string;
  employmentStatus: string;
  onboardingCompletedAt?: string;
  documentProgress: {
    cv: { uploaded: number; verified: number; total: number };
    identity: { uploaded: number; verified: number; total: number };
    employment: { uploaded: number; verified: number; total: number };
    education: { uploaded: number; verified: number; total: number };
  };
}

@Injectable()
export class HROnboardingService {
  private readonly logger = new Logger(HROnboardingService.name);

  constructor(
    @InjectRepository(EmploymentRecord)
    private readonly employmentRecordRepository: Repository<EmploymentRecord>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly documentRequirementsService: DocumentRequirementsService,
  ) {}

  /**
   * Get all candidates with onboarding status
   */
  async getOnboardingCandidates(
    search?: string,
    sortBy: 'submittedAt' | 'name' | 'progress' = 'submittedAt',
    order: 'asc' | 'desc' = 'desc',
  ): Promise<{ candidates: OnboardingCandidate[] }> {
    try {
      // Find all employment records with onboarding status OR active status with completed onboarding
      const query = this.employmentRecordRepository
        .createQueryBuilder('employment')
        .leftJoinAndSelect('employment.user', 'user')
        .where(
          '(employment.status = :onboardingStatus OR (employment.status = :activeStatus AND employment.onboardingCompletedAt IS NOT NULL))',
          { onboardingStatus: 'onboarding', activeStatus: 'active' },
        );

      // Apply search filter if provided
      if (search) {
        query.andWhere(
          '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Apply sorting
      if (sortBy === 'name') {
        query.orderBy('user.firstName', order.toUpperCase() as 'ASC' | 'DESC');
      } else if (sortBy === 'submittedAt') {
        query.orderBy('employment.createdAt', order.toUpperCase() as 'ASC' | 'DESC');
      }

      const employmentRecords = await query.getMany();

      // Build candidate list with document progress
      const candidates: OnboardingCandidate[] = await Promise.all(
        employmentRecords.map(async (record) => {
          const documentProgress = await this.getDocumentProgress(record.userId);

          return {
            employmentRecordId: record.id,
            userId: record.userId,
            userName: `${record.user.firstName} ${record.user.lastName}`,
            userEmail: record.user.email,
            submittedAt: record.createdAt.toISOString(),
            employmentStatus: record.status,
            onboardingCompletedAt: record.onboardingCompletedAt?.toISOString(),
            documentProgress,
          };
        }),
      );

      // Sort by progress if requested
      if (sortBy === 'progress') {
        candidates.sort((a, b) => {
          const progressA = this.calculateOverallProgress(a.documentProgress);
          const progressB = this.calculateOverallProgress(b.documentProgress);
          return order === 'asc' ? progressA - progressB : progressB - progressA;
        });
      }

      this.logger.log(`Retrieved ${candidates.length} onboarding candidates`);

      return { candidates };
    } catch (error) {
      this.logger.error('Failed to get onboarding candidates:', error);
      throw error;
    }
  }

  /**
   * Get document progress for a specific user
   */
  async getDocumentProgress(userId: string) {
    const categories = ['cv', 'identity', 'employment', 'education'];
    const progress: any = {};

    // Fetch dynamic document requirements
    const requirements = await this.documentRequirementsService.getRequirements();

    for (const category of categories) {
      const documents = await this.documentRepository.find({
        where: { userId, category },
      });

      const total = this.getExpectedDocumentCount(category, requirements);
      const uploaded = documents.length;
      const verifiedCount = documents.filter((doc) => doc.status === 'approved').length;
      // Cap verified count at the required total to prevent >100% progress
      const verified = Math.min(verifiedCount, total);

      progress[category] = {
        uploaded,
        verified,
        total,
      };
    }

    return progress;
  }

  /**
   * Get expected document count for a category based on dynamic requirements
   */
  private getExpectedDocumentCount(category: string, requirements: any): number {
    const categoryMap: Record<string, string> = {
      cv: 'cvRequired',
      identity: 'identityRequired',
      employment: 'employmentRequired',
      education: 'educationRequired',
    };

    const requirementKey = categoryMap[category];
    // Use nullish coalescing to properly handle 0 values (0 is valid, only default to 1 if null/undefined)
    return requirements[requirementKey] ?? 1;
  }

  /**
   * Calculate overall progress percentage
   */
  private calculateOverallProgress(documentProgress: any): number {
    let totalExpected = 0;
    let totalVerified = 0;

    for (const category of Object.keys(documentProgress)) {
      totalExpected += documentProgress[category].total;
      totalVerified += documentProgress[category].verified;
    }

    return totalExpected > 0 ? (totalVerified / totalExpected) * 100 : 0;
  }

  /**
   * Get candidate documents by category
   */
  async getCandidateDocuments(userId: string, category?: string) {
    try {
      const query = this.documentRepository
        .createQueryBuilder('document')
        .where('document.userId = :userId', { userId });

      if (category) {
        query.andWhere('document.category = :category', { category });
      }

      query.orderBy('document.uploadedAt', 'DESC');

      const documents = await query.getMany();

      this.logger.log(
        `Retrieved ${documents.length} documents for user ${userId}${category ? ` (category: ${category})` : ''}`,
      );

      return documents;
    } catch (error) {
      this.logger.error(`Failed to get candidate documents for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Complete onboarding for a candidate (change status from 'onboarding' to 'active')
   * Validates that all required documents are approved before completion
   */
  async completeOnboarding(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find the employment record with status 'onboarding'
      const employmentRecord = await this.employmentRecordRepository.findOne({
        where: { userId, status: 'onboarding' },
      });

      if (!employmentRecord) {
        throw new Error('No onboarding employment record found for this user');
      }

      if (!employmentRecord.onboardingSubmittedAt) {
        throw new Error('Candidate has not submitted their onboarding yet');
      }

      // Check if all required documents are verified
      const progress = await this.getDocumentProgress(userId);
      const categories = ['cv', 'identity', 'employment', 'education'];

      for (const category of categories) {
        const categoryProgress = progress[category];
        if (categoryProgress.verified < categoryProgress.total) {
          throw new Error(
            `Cannot complete onboarding: Not all ${category} documents are verified (${categoryProgress.verified}/${categoryProgress.total})`
          );
        }
      }

      // Update employment record status and completion timestamp
      employmentRecord.status = 'active';
      employmentRecord.onboardingCompletedAt = new Date();
      await this.employmentRecordRepository.save(employmentRecord);

      // Assign Client Employee role to the user
      const existingEorRole = await this.userRoleRepository.findOne({
        where: { userId, roleType: 'client_employee' },
      });

      if (!existingEorRole) {
        const eorRole = this.userRoleRepository.create({
          userId,
          roleType: 'client_employee',
          scope: 'individual',
          scopeEntityId: null,
          grantedBy: null, // System-granted during onboarding completion
          expiresAt: null,
        });
        await this.userRoleRepository.save(eorRole);
        this.logger.log(`Client Employee role assigned to user ${userId}`);
      } else {
        this.logger.log(`User ${userId} already has Client Employee role`);
      }

      this.logger.log(`Onboarding completed for user ${userId} - status changed to active`);

      return {
        success: true,
        message: 'Onboarding completed successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to complete onboarding for user ${userId}:`, error);
      throw error;
    }
  }
}
