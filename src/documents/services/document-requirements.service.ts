import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingDocumentRequirements } from '../entities/onboarding-document-requirements.entity';
import { UpdateDocumentRequirementsDto } from '../dto/update-document-requirements.dto';
import { DocumentRequirementsResponseDto } from '../dto/document-requirements-response.dto';

@Injectable()
export class DocumentRequirementsService {
  constructor(
    @InjectRepository(OnboardingDocumentRequirements)
    private readonly requirementsRepository: Repository<OnboardingDocumentRequirements>,
  ) {}

  /**
   * Get the current document requirements configuration
   * Returns the first (and only) row in the table
   */
  async getRequirements(): Promise<DocumentRequirementsResponseDto> {
    const results = await this.requirementsRepository.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });

    if (!results || results.length === 0) {
      throw new NotFoundException('Document requirements configuration not found');
    }

    return this.mapToResponseDto(results[0]);
  }

  /**
   * Update the document requirements configuration
   * Only admin and HR roles should be able to call this
   */
  async updateRequirements(
    dto: UpdateDocumentRequirementsDto,
    userId: string,
  ): Promise<DocumentRequirementsResponseDto> {
    // Get the existing configuration
    const results = await this.requirementsRepository.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });

    let requirements = results && results.length > 0 ? results[0] : null;

    if (!requirements) {
      // Create if doesn't exist (shouldn't happen but handle gracefully)
      requirements = this.requirementsRepository.create({
        ...dto,
        updatedBy: userId,
      });
    } else {
      // Update existing
      requirements.cvRequired = dto.cvRequired;
      requirements.identityRequired = dto.identityRequired;
      requirements.employmentRequired = dto.employmentRequired;
      requirements.educationRequired = dto.educationRequired;
      requirements.updatedBy = userId;
    }

    const saved = await this.requirementsRepository.save(requirements);
    return this.mapToResponseDto(saved);
  }

  /**
   * Check if a user's documents meet the requirements
   * Used during onboarding submission validation
   */
  async validateDocumentCounts(documentCounts: {
    cv: number;
    identity: number;
    employment: number;
    education: number;
  }): Promise<{ valid: boolean; missingCategories: string[] }> {
    const requirements = await this.getRequirements();

    const missingCategories: string[] = [];

    if (documentCounts.cv < requirements.cvRequired) {
      missingCategories.push(`CV (need ${requirements.cvRequired}, have ${documentCounts.cv})`);
    }
    if (documentCounts.identity < requirements.identityRequired) {
      missingCategories.push(`Identity (need ${requirements.identityRequired}, have ${documentCounts.identity})`);
    }
    if (documentCounts.employment < requirements.employmentRequired) {
      missingCategories.push(`Employment (need ${requirements.employmentRequired}, have ${documentCounts.employment})`);
    }
    if (documentCounts.education < requirements.educationRequired) {
      missingCategories.push(`Education (need ${requirements.educationRequired}, have ${documentCounts.education})`);
    }

    return {
      valid: missingCategories.length === 0,
      missingCategories,
    };
  }

  private mapToResponseDto(entity: OnboardingDocumentRequirements): DocumentRequirementsResponseDto {
    return {
      id: entity.id,
      cvRequired: entity.cvRequired,
      identityRequired: entity.identityRequired,
      employmentRequired: entity.employmentRequired,
      educationRequired: entity.educationRequired,
      updatedBy: entity.updatedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
