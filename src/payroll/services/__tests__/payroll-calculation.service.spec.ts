import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PayrollCalculationService } from '../payroll-calculation.service';
import { CountryService } from '../country.service';
import { CurrencyService } from '../currency.service';
import { PayrollPeriodService } from '../payroll-period.service';
import { SalaryComponentService } from '../salary-component.service';
import { StatutoryComponentService } from '../statutory-component.service';
import { Country } from '../../entities/country.entity';
import { RegionCalculationFactory, PayrollCalculationInput } from '../region-calculation.factory';
import { PayrollCalculationResult } from '../../dto/payroll-calculation.dto';

describe('PayrollCalculationService', () => {
  let service: PayrollCalculationService;
  let countryService: jest.Mocked<CountryService>;
  let payrollPeriodService: jest.Mocked<PayrollPeriodService>;
  let salaryComponentService: jest.Mocked<SalaryComponentService>;
  let statutoryComponentService: jest.Mocked<StatutoryComponentService>;
  let countryRepository: jest.Mocked<Repository<Country>>;

  const mockCountry = {
    id: 'country-id-123',
    code: 'IN',
    name: 'India',
    currencyCode: 'INR',
  };

  const mockPayrollPeriod = {
    id: 'period-id-123',
    countryId: 'country-id-123',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    periodType: 'monthly',
  };

  const mockSalaryComponents = [
    {
      id: 'salary-comp-1',
      name: 'Basic Salary',
      type: 'EARNINGS',
      componentType: 'EARNINGS',
      calculationType: 'FIXED',
      amount: 50000,
      isActive: true,
    },
  ];

  const mockStatutoryComponents = [
    {
      id: 'statutory-comp-1',
      name: 'EPF',
      componentType: 'EPF',
      contributionType: 'BOTH',
      employeeContributionPercentage: 12,
      employerContributionPercentage: 12,
      isActive: true,
    },
  ];

  // Mock RegionCalculationFactory
  class MockRegionCalculationFactory extends RegionCalculationFactory {
    async calculateGrossPay(input: PayrollCalculationInput) {
      return {
        grossPay: 60000,
        basicSalary: 50000,
        totalEarnings: 60000,
        overtimePay: 5000,
        nightShiftPay: 5000,
        components: [
          {
            componentId: 'comp-1',
            componentName: 'Basic Salary',
            componentType: 'EARNINGS',
            amount: 50000,
            currencyCode: 'INR',
            calculationMethod: 'FIXED',
          },
        ],
      };
    }

    async calculateStatutoryDeductions(input: PayrollCalculationInput, grossPayBreakdown: any) {
      return [
        {
          componentId: 'statutory-1',
          componentName: 'EPF',
          componentType: 'EPF',
          employeeContribution: 6000,
          employerContribution: 6000,
          totalContribution: 12000,
          currencyCode: 'INR',
          calculationBasis: 'BASIC_SALARY',
          rate: 12,
        },
      ];
    }

    getRegionName(): string {
      return 'India';
    }
  }

  beforeEach(async () => {
    const mockCountryRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockCountryService = {
      findOne: jest.fn(),
      findByCode: jest.fn(),
    };

    const mockCurrencyService = {
      findByCode: jest.fn(),
    };

    const mockPayrollPeriodService = {
      findOne: jest.fn(),
    };

    const mockSalaryComponentService = {
      findByCountry: jest.fn(),
    };

    const mockStatutoryComponentService = {
      findByCountry: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollCalculationService,
        {
          provide: getRepositoryToken(Country),
          useValue: mockCountryRepository,
        },
        {
          provide: CountryService,
          useValue: mockCountryService,
        },
        {
          provide: CurrencyService,
          useValue: mockCurrencyService,
        },
        {
          provide: PayrollPeriodService,
          useValue: mockPayrollPeriodService,
        },
        {
          provide: SalaryComponentService,
          useValue: mockSalaryComponentService,
        },
        {
          provide: StatutoryComponentService,
          useValue: mockStatutoryComponentService,
        },
      ],
    }).compile();

    service = module.get<PayrollCalculationService>(PayrollCalculationService);
    countryService = module.get(CountryService);
    payrollPeriodService = module.get(PayrollPeriodService);
    salaryComponentService = module.get(SalaryComponentService);
    statutoryComponentService = module.get(StatutoryComponentService);
    countryRepository = module.get(getRepositoryToken(Country));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerRegionFactory', () => {
    it('should register a region calculation factory', () => {
      const factory = new MockRegionCalculationFactory();
      service.registerRegionFactory('IN', factory);

      // Verify it was registered by attempting to use it
      expect(() => service['getRegionFactory']('IN')).not.toThrow();
    });

    it('should throw error when factory not found', () => {
      expect(() => service['getRegionFactory']('XYZ')).toThrow(
        BadRequestException,
      );
      expect(() => service['getRegionFactory']('XYZ')).toThrow(
        'No calculation factory registered for country: XYZ',
      );
    });
  });

  describe('calculatePayroll', () => {
    beforeEach(() => {
      // Register mock factory
      const factory = new MockRegionCalculationFactory();
      service.registerRegionFactory('IN', factory);

      // Setup mocks
      countryService.findOne.mockResolvedValue(mockCountry as any);
      payrollPeriodService.findOne.mockResolvedValue(mockPayrollPeriod as any);
      salaryComponentService.findByCountry.mockResolvedValue(
        mockSalaryComponents as any,
      );
      statutoryComponentService.findByCountry.mockResolvedValue(
        mockStatutoryComponents as any,
      );
    });

    it('should calculate payroll for a single employee successfully', async () => {
      const dto = {
        countryId: 'country-id-123',
        userId: 'user-id-123',
        payrollPeriodId: 'period-id-123',
      };

      const result = await service.calculatePayroll(dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.result).toBeDefined();
      expect(result.result.grossPay).toBe(60000);
      expect(result.result.totalStatutoryDeductions).toBe(6000);
      expect(result.result.netPay).toBeGreaterThan(0);
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should throw NotFoundException when country not found', async () => {
      countryService.findOne.mockResolvedValue(null);

      const dto = {
        countryId: 'invalid-country',
        userId: 'user-id-123',
        payrollPeriodId: 'period-id-123',
      };

      await expect(service.calculatePayroll(dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.calculatePayroll(dto)).rejects.toThrow(
        'Country not found',
      );
    });

    it('should throw NotFoundException when payroll period not found', async () => {
      payrollPeriodService.findOne.mockResolvedValue(null);

      const dto = {
        countryId: 'country-id-123',
        userId: 'user-id-123',
        payrollPeriodId: 'invalid-period',
      };

      await expect(service.calculatePayroll(dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.calculatePayroll(dto)).rejects.toThrow(
        'Payroll period not found',
      );
    });

    it('should throw BadRequestException when payroll period does not belong to country', async () => {
      const invalidPeriod = {
        ...mockPayrollPeriod,
        countryId: 'different-country-id',
      };
      payrollPeriodService.findOne.mockResolvedValue(invalidPeriod as any);

      const dto = {
        countryId: 'country-id-123',
        userId: 'user-id-123',
        payrollPeriodId: 'period-id-123',
      };

      await expect(service.calculatePayroll(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.calculatePayroll(dto)).rejects.toThrow(
        'Payroll period does not belong to the specified country',
      );
    });

    it('should include overtime and night shift when flags are true', async () => {
      const dto = {
        countryId: 'country-id-123',
        userId: 'user-id-123',
        payrollPeriodId: 'period-id-123',
        includeOvertime: true,
        includeNightShift: true,
      };

      const result = await service.calculatePayroll(dto);

      expect(result.result.overtimePay).toBeDefined();
      expect(result.result.nightShiftPay).toBeDefined();
    });

    it('should use custom calculation date when provided', async () => {
      const dto = {
        countryId: 'country-id-123',
        userId: 'user-id-123',
        payrollPeriodId: 'period-id-123',
        calculationDate: '2024-01-15',
      };

      const result = await service.calculatePayroll(dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
    });
  });

  describe('calculateBulkPayroll', () => {
    beforeEach(() => {
      // Register mock factory
      const factory = new MockRegionCalculationFactory();
      service.registerRegionFactory('IN', factory);

      // Setup mocks
      countryService.findOne.mockResolvedValue(mockCountry as any);
      payrollPeriodService.findOne.mockResolvedValue(mockPayrollPeriod as any);
      salaryComponentService.findByCountry.mockResolvedValue(
        mockSalaryComponents as any,
      );
      statutoryComponentService.findByCountry.mockResolvedValue(
        mockStatutoryComponents as any,
      );
    });

    it('should calculate payroll for multiple employees successfully', async () => {
      const dto = {
        countryId: 'country-id-123',
        payrollPeriodId: 'period-id-123',
        userIds: ['user-1', 'user-2', 'user-3'],
      };

      const result = await service.calculateBulkPayroll(dto);

      expect(result).toBeDefined();
      expect(result.totalRequested).toBe(3);
      expect(result.successCount).toBe(3);
      expect(result.failedCount).toBe(0);
      expect(result.results.length).toBe(3);
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should handle partial failures in bulk calculation', async () => {
      // Make second user fail
      let callCount = 0;
      countryService.findOne.mockImplementation(async () => {
        callCount++;
        if (callCount === 2) {
          return null; // Second call fails
        }
        return mockCountry as any;
      });

      const dto = {
        countryId: 'country-id-123',
        payrollPeriodId: 'period-id-123',
        userIds: ['user-1', 'user-2', 'user-3'],
      };

      const result = await service.calculateBulkPayroll(dto);

      expect(result.totalRequested).toBe(3);
      expect(result.successCount).toBe(2);
      expect(result.failedCount).toBe(1);
      expect(result.failedUserIds).toBeDefined();
      expect(result.failedUserIds.length).toBe(1);
      expect(result.errors).toBeDefined();
    });

    it('should process employees in parallel', async () => {
      const dto = {
        countryId: 'country-id-123',
        payrollPeriodId: 'period-id-123',
        userIds: Array.from({ length: 10 }, (_, i) => `user-${i}`),
      };

      const startTime = Date.now();
      const result = await service.calculateBulkPayroll(dto);
      const elapsed = Date.now() - startTime;

      expect(result.successCount).toBe(10);
      // Parallel processing should be faster than sequential
      // With sequential, each would take ~1ms minimum = 10ms
      // Parallel should complete faster
      expect(elapsed).toBeLessThan(100); // Reasonable threshold
    });
  });

  describe('validateCalculationAccess', () => {
    it('should allow admin role to calculate for any user', async () => {
      const result = await service.validateCalculationAccess(
        'user-123',
        'admin-456',
        'admin',
      );

      expect(result).toBe(true);
    });

    it('should allow hr role to calculate for any user', async () => {
      const result = await service.validateCalculationAccess(
        'user-123',
        'hr-456',
        'hr',
      );

      expect(result).toBe(true);
    });

    it('should allow user to calculate own payroll', async () => {
      const result = await service.validateCalculationAccess(
        'user-123',
        'user-123',
        'eor',
      );

      expect(result).toBe(true);
    });

    it('should deny non-admin user from calculating for other users', async () => {
      await expect(
        service.validateCalculationAccess('user-123', 'user-456', 'eor'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCalculationSummary', () => {
    it('should throw BadRequestException as not yet implemented', async () => {
      await expect(
        service.getCalculationSummary('country-id-123', 'period-id-123'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getCalculationSummary('country-id-123', 'period-id-123'),
      ).rejects.toThrow('Calculation summary not yet implemented');
    });
  });
});

