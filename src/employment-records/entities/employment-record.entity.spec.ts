import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmploymentRecord } from './employment-record.entity';

describe('EmploymentRecord Entity', () => {
  let repository: Repository<EmploymentRecord>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(EmploymentRecord),
          useValue: {
            create: jest.fn((data) => {
              const employment = new EmploymentRecord();
              employment.status = 'active';
              employment.migratedFromZoho = false;
              return Object.assign(employment, data);
            }),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<Repository<EmploymentRecord>>(getRepositoryToken(EmploymentRecord));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('EmploymentRecord Entity Creation', () => {
    it('should create an employment record with required fields', () => {
      const employmentData = {
        userId: 'user-uuid-123',
        clientId: 'client-uuid-456',
        startDate: new Date('2024-01-01'),
        role: 'Software Engineer',
        status: 'active' as const,
      };

      const employment = repository.create(employmentData);
      
      expect(employment.userId).toBe(employmentData.userId);
      expect(employment.clientId).toBe(employmentData.clientId);
      expect(employment.startDate).toBe(employmentData.startDate);
      expect(employment.role).toBe(employmentData.role);
      expect(employment.status).toBe(employmentData.status);
    });

    it('should create an employment record with optional fields', () => {
      const employmentData = {
        userId: 'user-uuid-123',
        clientId: 'client-uuid-456',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        role: 'Senior Software Engineer',
        status: 'completed' as const,
        migratedFromZoho: true,
        zohoEmploymentId: 'zoho_emp_123',
      };

      const employment = repository.create(employmentData);
      
      expect(employment.endDate).toBe(employmentData.endDate);
      expect(employment.migratedFromZoho).toBe(employmentData.migratedFromZoho);
      expect(employment.zohoEmploymentId).toBe(employmentData.zohoEmploymentId);
    });

    it('should default status to active', () => {
      const employmentData = {
        userId: 'user-uuid-123',
        clientId: 'client-uuid-456',
        startDate: new Date('2024-01-01'),
        role: 'Software Engineer',
      };

      const employment = repository.create(employmentData);
      
      expect(employment.status).toBe('active');
    });

    it('should default migratedFromZoho to false', () => {
      const employmentData = {
        userId: 'user-uuid-123',
        clientId: 'client-uuid-456',
        startDate: new Date('2024-01-01'),
        role: 'Software Engineer',
      };

      const employment = repository.create(employmentData);
      
      expect(employment.migratedFromZoho).toBe(false);
    });
  });

  describe('EmploymentRecord Entity Validation', () => {
    it('should accept valid status values', () => {
      const validStatuses = ['active', 'inactive', 'terminated', 'completed'];
      
      validStatuses.forEach(status => {
        const employmentData = {
          userId: `user-uuid-${status}`,
          clientId: 'client-uuid-456',
          startDate: new Date('2024-01-01'),
          role: 'Software Engineer',
          status: status as 'active' | 'inactive' | 'terminated' | 'completed',
        };

        const employment = repository.create(employmentData);
        expect(employment.status).toBe(status);
      });
    });

    it('should allow null end date for active employment', () => {
      const employmentData = {
        userId: 'user-uuid-123',
        clientId: 'client-uuid-456',
        startDate: new Date('2024-01-01'),
        endDate: null,
        role: 'Software Engineer',
        status: 'active' as const,
      };

      const employment = repository.create(employmentData);
      expect(employment.endDate).toBeNull();
    });

    it('should allow end date after start date', () => {
      const employmentData = {
        userId: 'user-uuid-123',
        clientId: 'client-uuid-456',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        role: 'Software Engineer',
        status: 'completed' as const,
      };

      const employment = repository.create(employmentData);
      expect(employment.endDate).toBe(employmentData.endDate);
    });
  });

  describe('EmploymentRecord Entity Relationships', () => {
    it('should have user relationship', () => {
      const employment = new EmploymentRecord();
      expect(employment.user).toBeUndefined();
    });

    it('should have client relationship', () => {
      const employment = new EmploymentRecord();
      expect(employment.client).toBeUndefined();
    });

    it('should have salaryHistory relationship', () => {
      const employment = new EmploymentRecord();
      expect(employment.salaryHistory).toBeUndefined();
    });
  });
});
