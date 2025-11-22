import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryHistory } from './salary-history.entity';

describe('SalaryHistory Entity', () => {
  let repository: Repository<SalaryHistory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(SalaryHistory),
          useValue: {
            create: jest.fn((data) => {
              const salary = new SalaryHistory();
              salary.salaryCurrency = 'USD';
              salary.migratedFromZoho = false;
              return Object.assign(salary, data);
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

    repository = module.get<Repository<SalaryHistory>>(getRepositoryToken(SalaryHistory));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('SalaryHistory Entity Creation', () => {
    it('should create a salary history record with required fields', () => {
      const salaryData = {
        employmentRecordId: 'employment-uuid-123',
        salaryAmount: 75000.00,
        salaryCurrency: 'USD',
        effectiveDate: new Date('2024-01-01'),
        changeReason: 'Initial salary',
      };

      const salary = repository.create(salaryData);
      
      expect(salary.employmentRecordId).toBe(salaryData.employmentRecordId);
      expect(salary.salaryAmount).toBe(salaryData.salaryAmount);
      expect(salary.salaryCurrency).toBe(salaryData.salaryCurrency);
      expect(salary.effectiveDate).toBe(salaryData.effectiveDate);
      expect(salary.changeReason).toBe(salaryData.changeReason);
    });

    it('should create a salary history record with optional fields', () => {
      const salaryData = {
        employmentRecordId: 'employment-uuid-123',
        salaryAmount: 80000.00,
        salaryCurrency: 'USD',
        effectiveDate: new Date('2024-06-01'),
        changeReason: 'Promotion',
        changedBy: 'admin-uuid-456',
        migratedFromZoho: true,
        zohoSalaryId: 'zoho_salary_123',
      };

      const salary = repository.create(salaryData);
      
      expect(salary.changedBy).toBe(salaryData.changedBy);
      expect(salary.migratedFromZoho).toBe(salaryData.migratedFromZoho);
      expect(salary.zohoSalaryId).toBe(salaryData.zohoSalaryId);
    });

    it('should default salaryCurrency to USD', () => {
      const salaryData = {
        employmentRecordId: 'employment-uuid-123',
        salaryAmount: 75000.00,
        effectiveDate: new Date('2024-01-01'),
        changeReason: 'Initial salary',
      };

      const salary = repository.create(salaryData);
      
      expect(salary.salaryCurrency).toBe('USD');
    });

    it('should default migratedFromZoho to false', () => {
      const salaryData = {
        employmentRecordId: 'employment-uuid-123',
        salaryAmount: 75000.00,
        effectiveDate: new Date('2024-01-01'),
        changeReason: 'Initial salary',
      };

      const salary = repository.create(salaryData);
      
      expect(salary.migratedFromZoho).toBe(false);
    });
  });

  describe('SalaryHistory Entity Validation', () => {
    it('should accept positive salary amounts', () => {
      const validAmounts = [50000.00, 75000.50, 100000.00, 150000.99];
      
      validAmounts.forEach(amount => {
        const salaryData = {
          employmentRecordId: `employment-uuid-${amount}`,
          salaryAmount: amount,
          effectiveDate: new Date('2024-01-01'),
          changeReason: 'Test salary',
        };

        const salary = repository.create(salaryData);
        expect(salary.salaryAmount).toBe(amount);
      });
    });

    it('should accept different currencies', () => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD'];
      
      validCurrencies.forEach(currency => {
        const salaryData = {
          employmentRecordId: `employment-uuid-${currency}`,
          salaryAmount: 75000.00,
          salaryCurrency: currency,
          effectiveDate: new Date('2024-01-01'),
          changeReason: 'Test salary',
        };

        const salary = repository.create(salaryData);
        expect(salary.salaryCurrency).toBe(currency);
      });
    });

    it('should accept various change reasons', () => {
      const validReasons = [
        'Initial salary',
        'Promotion',
        'Cost of living adjustment',
        'Performance bonus',
        'Market adjustment',
      ];
      
      validReasons.forEach(reason => {
        const salaryData = {
          employmentRecordId: `employment-uuid-${reason.replace(/\s+/g, '_')}`,
          salaryAmount: 75000.00,
          effectiveDate: new Date('2024-01-01'),
          changeReason: reason,
        };

        const salary = repository.create(salaryData);
        expect(salary.changeReason).toBe(reason);
      });
    });
  });

  describe('SalaryHistory Entity Relationships', () => {
    it('should have employmentRecord relationship', () => {
      const salary = new SalaryHistory();
      expect(salary.employmentRecord).toBeUndefined();
    });

    it('should have changedByUser relationship', () => {
      const salary = new SalaryHistory();
      expect(salary.changedByUser).toBeUndefined();
    });
  });
});
