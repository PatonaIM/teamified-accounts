import { Test, TestingModule } from '@nestjs/testing';
import { ProfileCompletionService } from './profile-completion.service';
import { CVService } from '../../documents/services/cv.service';
import { EORProfile } from '../entities/eor-profile.entity';

describe('ProfileCompletionService', () => {
  let service: ProfileCompletionService;
  let cvService: jest.Mocked<CVService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileCompletionService,
        {
          provide: CVService,
          useValue: {
            hasCurrentCV: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileCompletionService>(ProfileCompletionService);
    cvService = module.get(CVService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCompletion', () => {
    let profile: EORProfile;

    beforeEach(() => {
      profile = new EORProfile();
      profile.id = 'test-id';
      profile.userId = 'test-user-id';
      profile.countryCode = 'IN';
      profile.profileCompletionPercentage = 0;
      profile.isProfileComplete = false;
      profile.profileStatus = 'incomplete';
      profile.createdAt = new Date();
      profile.updatedAt = new Date();
    });

    it('should return low completion for mostly empty profile', async () => {
      cvService.hasCurrentCV.mockResolvedValue(false);
      
      const result = await service.calculateCompletion(profile);
      
      expect(result.percentage).toBeLessThan(20);
      expect(result.isComplete).toBe(false);
      expect(result.status).toBe('incomplete');
    });

    it('should return correct completion for partially filled mandatory fields', async () => {
      cvService.hasCurrentCV.mockResolvedValue(false);
      
      profile.phoneNumber = '+919876543210';
      profile.dateOfBirth = new Date('1990-01-01');
      profile.addressLine1 = '123 Test Street';

      const result = await service.calculateCompletion(profile);
      
      expect(result.percentage).toBeGreaterThan(0);
      expect(result.isComplete).toBe(false);
      expect(result.status).toBe('incomplete');
    });

    it('should return complete status when all mandatory fields are filled and percentage >= 80', async () => {
      cvService.hasCurrentCV.mockResolvedValue(true);
      // Fill all mandatory fields
      profile.phoneNumber = '+919876543210';
      profile.dateOfBirth = new Date('1990-01-01');
      profile.addressLine1 = '123 Test Street';
      profile.city = 'Mumbai';

      profile.department = 'Engineering';
      profile.startDate = new Date('2023-01-01');
      profile.emergencyContactName = 'John Doe';
      profile.emergencyContactPhone = '+919876543211';

      // Fill most optional fields to get >= 80%
      profile.skills = ['JavaScript', 'TypeScript'];
      profile.experienceYears = 5;
      profile.timezone = 'Asia/Kolkata';
      profile.employeeId = 'EMP001';
      profile.addressLine2 = 'Apt 123';
      profile.stateProvince = 'Maharashtra';
      profile.postalCode = '400001';
      profile.employmentType = 'Full-time';
      profile.managerName = 'Jane Smith';
      profile.education = [{ degree: 'Bachelor', institution: 'IIT', year: 2020 }];
      profile.languages = [{ language: 'English', proficiency: 'advanced' }];

      const result = await service.calculateCompletion(profile);
      
      expect(result.isComplete).toBe(true);
      expect(result.status).toBe('complete');
      expect(result.percentage).toBeGreaterThanOrEqual(80);
    });

    it('should return pending status when all mandatory fields are filled but percentage < 80', async () => {
      cvService.hasCurrentCV.mockResolvedValue(true);
      // Fill all mandatory fields only
      profile.phoneNumber = '+919876543210';
      profile.dateOfBirth = new Date('1990-01-01');
      profile.addressLine1 = '123 Test Street';
      profile.city = 'Mumbai';

      profile.department = 'Engineering';
      profile.startDate = new Date('2023-01-01');
      profile.emergencyContactName = 'John Doe';
      profile.emergencyContactPhone = '+919876543211';

      // Add just a few optional fields to get over 50% but under 80%
      profile.skills = ['JavaScript'];
      profile.timezone = 'Asia/Kolkata';

      const result = await service.calculateCompletion(profile);
      
      expect(result.isComplete).toBe(false);
      expect(result.status).toBe('pending');
      expect(result.percentage).toBeGreaterThanOrEqual(30);
      expect(result.percentage).toBeLessThan(80);
    });

    it('should require CV upload for profile completion', async () => {
      // Fill all mandatory profile fields but no CV
      profile.phoneNumber = '+919876543210';
      profile.dateOfBirth = new Date('1990-01-01');
      profile.addressLine1 = '123 Test Street';
      profile.city = 'Mumbai';

      profile.department = 'Engineering';
      profile.startDate = new Date('2023-01-01');
      profile.emergencyContactName = 'Jane Doe';
      profile.emergencyContactPhone = '+919876543211';
      
      cvService.hasCurrentCV.mockResolvedValue(false);

      const result = await service.calculateCompletion(profile);

      expect(result.isComplete).toBe(false);
      expect(result.status).not.toBe('complete');
    });

    it('should include CV in completion calculation', async () => {
      // Same profile, but with CV
      profile.phoneNumber = '+919876543210';
      profile.dateOfBirth = new Date('1990-01-01');
      profile.addressLine1 = '123 Test Street';
      profile.city = 'Mumbai';

      profile.department = 'Engineering';
      profile.startDate = new Date('2023-01-01');
      profile.emergencyContactName = 'Jane Doe';
      profile.emergencyContactPhone = '+919876543211';
      profile.skills = ['JavaScript', 'TypeScript'];
      
      // Compare completion with and without CV
      cvService.hasCurrentCV.mockResolvedValue(false);
      const resultWithoutCV = await service.calculateCompletion(profile);
      
      cvService.hasCurrentCV.mockResolvedValue(true);
      const resultWithCV = await service.calculateCompletion(profile);

      expect(resultWithCV.percentage).toBeGreaterThan(resultWithoutCV.percentage);
    });
  });

  describe('getMissingMandatoryFields', () => {
    let profile: EORProfile;

    beforeEach(() => {
      profile = new EORProfile();
      profile.countryCode = 'IN';
    });

    it('should return all mandatory fields when profile is empty', () => {
      const missingFields = service.getMissingMandatoryFields(profile);
      
      expect(missingFields).toContain('phoneNumber');
      expect(missingFields).toContain('dateOfBirth');
      expect(missingFields).toContain('addressLine1');
      expect(missingFields).toContain('city');

      expect(missingFields).toContain('department');
      expect(missingFields).toContain('startDate');
      expect(missingFields).toContain('emergencyContactName');
      expect(missingFields).toContain('emergencyContactPhone');
      expect(missingFields).toHaveLength(8);
    });

    it('should return only missing mandatory fields', () => {
      profile.phoneNumber = '+919876543210';
      profile.dateOfBirth = new Date('1990-01-01');
      profile.addressLine1 = '123 Test Street';

      const missingFields = service.getMissingMandatoryFields(profile);
      
      expect(missingFields).not.toContain('phoneNumber');
      expect(missingFields).not.toContain('dateOfBirth');
      expect(missingFields).not.toContain('addressLine1');
      expect(missingFields).toContain('city');

    });

    it('should return empty array when all mandatory fields are filled', () => {
      profile.phoneNumber = '+919876543210';
      profile.dateOfBirth = new Date('1990-01-01');
      profile.addressLine1 = '123 Test Street';
      profile.city = 'Mumbai';

      profile.department = 'Engineering';
      profile.startDate = new Date('2023-01-01');
      profile.emergencyContactName = 'John Doe';
      profile.emergencyContactPhone = '+919876543211';

      const missingFields = service.getMissingMandatoryFields(profile);
      
      expect(missingFields).toHaveLength(0);
    });
  });

  describe('getMissingMandatoryFieldsWithCV', () => {
    let profile: EORProfile;

    beforeEach(() => {
      profile = new EORProfile();
      profile.id = 'test-id';
      profile.countryCode = 'IN';
    });

    it('should include cv_upload in missing fields when no CV uploaded', async () => {
      cvService.hasCurrentCV.mockResolvedValue(false);
      
      const missingFields = await service.getMissingMandatoryFieldsWithCV(profile);
      
      expect(missingFields).toContain('cv_upload');
    });

    it('should not include cv_upload when CV is uploaded', async () => {
      cvService.hasCurrentCV.mockResolvedValue(true);
      
      const missingFields = await service.getMissingMandatoryFieldsWithCV(profile);
      
      expect(missingFields).not.toContain('cv_upload');
    });
  });
});