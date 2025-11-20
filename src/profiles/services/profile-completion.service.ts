import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { EORProfile } from '../entities/eor-profile.entity';
import { CVService } from '../../documents/services/cv.service';

@Injectable()
export class ProfileCompletionService {
  constructor(
    @Inject(forwardRef(() => CVService))
    private readonly cvService: CVService,
  ) {}
  private readonly mandatoryFields: (keyof EORProfile)[] = [
    'phoneNumber',
    'dateOfBirth',
    'addressLine1',
    'city',
    'department',
    'startDate',
    'emergencyContactName',
    'emergencyContactPhone',
  ];

  private readonly optionalFields: (keyof EORProfile)[] = [
    'countryCode', // Always required but separate tracking
    'addressLine2',
    'stateProvince',
    'postalCode',
    'employeeId',
    'employmentType',
    'managerName',
    'skills',
    'experienceYears',
    'education',
    'certifications',
    'languages',
    'timezone',
    'emergencyContactRelationship',
  ];

  async calculateCompletion(profile: EORProfile): Promise<{
    percentage: number;
    status: 'incomplete' | 'pending' | 'complete';
    isComplete: boolean;
  }> {
    const mandatoryCompleted = this.mandatoryFields.filter(
      field => this.isFieldComplete(profile[field])
    ).length;
    
    const optionalCompleted = this.optionalFields.filter(
      field => this.isFieldComplete(profile[field])
    ).length;

    // Check if CV is uploaded (mandatory for completion)
    const hasCVUploaded = await this.cvService.hasCurrentCV({
      eorProfileId: profile.id,
      userType: 'eor',
    });

    const totalFields = this.mandatoryFields.length + this.optionalFields.length + 1; // +1 for CV
    const completedFields = mandatoryCompleted + optionalCompleted + (hasCVUploaded ? 1 : 0);
    
    const percentage = Math.round((completedFields / totalFields) * 100);
    
    const allMandatoryComplete = mandatoryCompleted === this.mandatoryFields.length && hasCVUploaded;
    const isComplete = allMandatoryComplete && percentage >= 80;
    
    let status: 'incomplete' | 'pending' | 'complete';
    
    if (isComplete) {
      status = 'complete';
    } else if (allMandatoryComplete && percentage >= 50) {
      status = 'pending';
    } else {
      status = 'incomplete';
    }

    return {
      percentage,
      status,
      isComplete,
    };
  }

  private isFieldComplete(value: any): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    return true;
  }

  getMissingMandatoryFields(profile: EORProfile): string[] {
    return this.mandatoryFields.filter(
      field => !this.isFieldComplete(profile[field])
    ).map(field => String(field));
  }

  async getMissingMandatoryFieldsWithCV(profile: EORProfile): Promise<string[]> {
    const missingFields = this.getMissingMandatoryFields(profile);
    
    const hasCVUploaded = await this.cvService.hasCurrentCV({
      eorProfileId: profile.id,
      userType: 'eor',
    });
    if (!hasCVUploaded) {
      missingFields.push('cv_upload');
    }
    
    return missingFields;
  }
}