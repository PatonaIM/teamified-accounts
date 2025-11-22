import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryComponentService } from '../salary-component.service';
import { SalaryComponent, SalaryComponentType, CalculationType } from '../../entities/salary-component.entity';
import { Country } from '../../entities/country.entity';
import { RegionConfigurationService } from '../region-configuration.service';

describe('SalaryComponentService Performance', () => {
  let service: SalaryComponentService;
  let salaryComponentRepository: jest.Mocked<Repository<SalaryComponent>>;
  let countryRepository: jest.Mocked<Repository<Country>>;
  let regionConfigurationService: jest.Mocked<RegionConfigurationService>;

  const mockSalaryComponentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    remove: jest.fn(),
  };

  const mockCountryRepository = {
    findOne: jest.fn(),
  };

  const mockRegionConfigurationService = {
    findByCountry: jest.fn(),
  };

  const mockCountry: Country = {
    id: 'country-id',
    code: 'IN',
    name: 'India',
    currencyId: 'currency-id',
    taxYearStartMonth: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Country;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalaryComponentService,
        {
          provide: getRepositoryToken(SalaryComponent),
          useValue: mockSalaryComponentRepository,
        },
        {
          provide: getRepositoryToken(Country),
          useValue: mockCountryRepository,
        },
        {
          provide: RegionConfigurationService,
          useValue: mockRegionConfigurationService,
        },
      ],
    }).compile();

    service = module.get<SalaryComponentService>(SalaryComponentService);
    salaryComponentRepository = module.get(getRepositoryToken(SalaryComponent));
    countryRepository = module.get(getRepositoryToken(Country));
    regionConfigurationService = module.get(RegionConfigurationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Performance Tests', () => {
    it('should handle large number of salary components efficiently', async () => {
      // Generate 1000 salary components
      const largeComponentList = Array.from({ length: 1000 }, (_, index) => ({
        id: `component-${index}`,
        countryId: 'country-id',
        componentName: `Component ${index}`,
        componentCode: `COMP_${index}`,
        componentType: SalaryComponentType.EARNINGS,
        calculationType: CalculationType.FIXED_AMOUNT,
        calculationValue: 1000 + index,
        isTaxable: true,
        isStatutory: false,
        isMandatory: false,
        displayOrder: index,
        description: `Description for component ${index}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([largeComponentList, 1000]),
      };

      salaryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const startTime = Date.now();
      const result = await service.findByCountry('country-id', 1, 1000);
      const endTime = Date.now();

      expect(result.components).toHaveLength(1000);
      expect(result.total).toBe(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle pagination efficiently with large datasets', async () => {
      const largeComponentList = Array.from({ length: 100 }, (_, index) => ({
        id: `component-${index}`,
        countryId: 'country-id',
        componentName: `Component ${index}`,
        componentCode: `COMP_${index}`,
        componentType: SalaryComponentType.EARNINGS,
        calculationType: CalculationType.FIXED_AMOUNT,
        calculationValue: 1000 + index,
        isTaxable: true,
        isStatutory: false,
        isMandatory: false,
        displayOrder: index,
        description: `Description for component ${index}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([largeComponentList.slice(0, 10), 1000]),
      };

      salaryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const startTime = Date.now();
      const result = await service.findByCountry('country-id', 50, 10); // Page 50, limit 10
      const endTime = Date.now();

      expect(result.components).toHaveLength(10);
      expect(result.total).toBe(1000);
      expect(result.page).toBe(50);
      expect(result.limit).toBe(10);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle filtering efficiently with large datasets', async () => {
      const earningsComponents = Array.from({ length: 500 }, (_, index) => ({
        id: `earnings-${index}`,
        countryId: 'country-id',
        componentName: `Earnings Component ${index}`,
        componentCode: `EARN_${index}`,
        componentType: SalaryComponentType.EARNINGS,
        calculationType: CalculationType.FIXED_AMOUNT,
        calculationValue: 1000 + index,
        isTaxable: true,
        isStatutory: false,
        isMandatory: false,
        displayOrder: index,
        description: `Earnings description ${index}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([earningsComponents, 500]),
      };

      salaryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const startTime = Date.now();
      const result = await service.findByCountry('country-id', 1, 100, 'earnings');
      const endTime = Date.now();

      expect(result.components).toHaveLength(500);
      expect(result.total).toBe(500);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle bulk operations efficiently', async () => {
      const components = Array.from({ length: 100 }, (_, index) => ({
        id: `component-${index}`,
        countryId: 'country-id',
        componentName: `Component ${index}`,
        componentCode: `COMP_${index}`,
        componentType: SalaryComponentType.EARNINGS,
        calculationType: CalculationType.FIXED_AMOUNT,
        calculationValue: 1000 + index,
        isTaxable: true,
        isStatutory: false,
        isMandatory: false,
        displayOrder: index,
        description: `Description for component ${index}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      salaryComponentRepository.find.mockResolvedValue(components as any);

      const startTime = Date.now();
      const result = await service.findByType('country-id', 'earnings');
      const endTime = Date.now();

      expect(result).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(200); // Should complete within 200ms
    });

    it('should handle concurrent requests efficiently', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      salaryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const startTime = Date.now();
      
      // Simulate 10 concurrent requests
      const promises = Array.from({ length: 10 }, (_, index) => 
        service.findByCountry(`country-${index}`, 1, 10)
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(1000); // All requests should complete within 1 second
    });

    it('should handle memory efficiently with large result sets', async () => {
      const largeComponentList = Array.from({ length: 10000 }, (_, index) => ({
        id: `component-${index}`,
        countryId: 'country-id',
        componentName: `Component ${index}`,
        componentCode: `COMP_${index}`,
        componentType: SalaryComponentType.EARNINGS,
        calculationType: CalculationType.FIXED_AMOUNT,
        calculationValue: 1000 + index,
        isTaxable: true,
        isStatutory: false,
        isMandatory: false,
        displayOrder: index,
        description: `Description for component ${index}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([largeComponentList, 10000]),
      };

      salaryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const startTime = Date.now();
      const result = await service.findByCountry('country-id', 1, 10000);
      const endTime = Date.now();

      expect(result.components).toHaveLength(10000);
      expect(result.total).toBe(10000);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});
