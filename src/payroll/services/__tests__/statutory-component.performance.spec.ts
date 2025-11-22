import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatutoryComponentService } from '../statutory-component.service';
import { 
  StatutoryComponent, 
  StatutoryComponentType, 
  ContributionType, 
  CalculationBasis 
} from '../../entities/statutory-component.entity';
import { Country } from '../../entities/country.entity';
import { RegionConfigurationService } from '../region-configuration.service';

describe('StatutoryComponentService Performance', () => {
  let service: StatutoryComponentService;
  let statutoryComponentRepository: jest.Mocked<Repository<StatutoryComponent>>;
  let countryRepository: jest.Mocked<Repository<Country>>;
  let regionConfigurationService: jest.Mocked<RegionConfigurationService>;

  const mockStatutoryComponentRepository = {
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
        StatutoryComponentService,
        {
          provide: getRepositoryToken(StatutoryComponent),
          useValue: mockStatutoryComponentRepository,
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

    service = module.get<StatutoryComponentService>(StatutoryComponentService);
    statutoryComponentRepository = module.get(getRepositoryToken(StatutoryComponent));
    countryRepository = module.get(getRepositoryToken(Country));
    regionConfigurationService = module.get(RegionConfigurationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Performance Tests', () => {
    it('should handle large number of statutory components efficiently', async () => {
      // Generate 1000 statutory components
      const largeComponentList = Array.from({ length: 1000 }, (_, index) => ({
        id: `component-${index}`,
        countryId: 'country-id',
        componentName: `Statutory Component ${index}`,
        componentCode: `STAT_${index}`,
        componentType: StatutoryComponentType.EPF,
        contributionType: ContributionType.BOTH,
        calculationBasis: CalculationBasis.BASIC_SALARY,
        employeePercentage: 12.0,
        employerPercentage: 12.0,
        minimumAmount: 100,
        maximumAmount: 1800,
        wageCeiling: 15000,
        wageFloor: 1000,
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: null,
        isMandatory: true,
        displayOrder: index,
        description: `Description for statutory component ${index}`,
        regulatoryReference: `Reference ${index}`,
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

      statutoryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

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
        componentType: StatutoryComponentType.EPF,
        contributionType: ContributionType.BOTH,
        calculationBasis: CalculationBasis.BASIC_SALARY,
        employeePercentage: 12.0,
        employerPercentage: 12.0,
        minimumAmount: 100,
        maximumAmount: 1800,
        wageCeiling: 15000,
        wageFloor: 1000,
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: null,
        isMandatory: true,
        displayOrder: index,
        description: `Description for component ${index}`,
        regulatoryReference: `Reference ${index}`,
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

      statutoryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

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
      const epfComponents = Array.from({ length: 500 }, (_, index) => ({
        id: `epf-${index}`,
        countryId: 'country-id',
        componentName: `EPF Component ${index}`,
        componentCode: `EPF_${index}`,
        componentType: StatutoryComponentType.EPF,
        contributionType: ContributionType.BOTH,
        calculationBasis: CalculationBasis.BASIC_SALARY,
        employeePercentage: 12.0,
        employerPercentage: 12.0,
        minimumAmount: 100,
        maximumAmount: 1800,
        wageCeiling: 15000,
        wageFloor: 1000,
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: null,
        isMandatory: true,
        displayOrder: index,
        description: `EPF description ${index}`,
        regulatoryReference: `EPF Reference ${index}`,
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
        getManyAndCount: jest.fn().mockResolvedValue([epfComponents, 500]),
      };

      statutoryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const startTime = Date.now();
      const result = await service.findByCountry('country-id', 1, 100, 'epf');
      const endTime = Date.now();

      expect(result.components).toHaveLength(500);
      expect(result.total).toBe(500);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle date-based filtering efficiently', async () => {
      const activeComponents = Array.from({ length: 200 }, (_, index) => ({
        id: `component-${index}`,
        countryId: 'country-id',
        componentName: `Component ${index}`,
        componentCode: `COMP_${index}`,
        componentType: StatutoryComponentType.EPF,
        contributionType: ContributionType.BOTH,
        calculationBasis: CalculationBasis.BASIC_SALARY,
        employeePercentage: 12.0,
        employerPercentage: 12.0,
        minimumAmount: 100,
        maximumAmount: 1800,
        wageCeiling: 15000,
        wageFloor: 1000,
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: null,
        isMandatory: true,
        displayOrder: index,
        description: `Description for component ${index}`,
        regulatoryReference: `Reference ${index}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(activeComponents),
      };

      statutoryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const targetDate = new Date('2024-06-01');
      const startTime = Date.now();
      const result = await service.findActiveByDate('country-id', targetDate);
      const endTime = Date.now();

      expect(result).toHaveLength(200);
      expect(endTime - startTime).toBeLessThan(300); // Should complete within 300ms
    });

    it('should handle bulk operations efficiently', async () => {
      const components = Array.from({ length: 100 }, (_, index) => ({
        id: `component-${index}`,
        countryId: 'country-id',
        componentName: `Component ${index}`,
        componentCode: `COMP_${index}`,
        componentType: StatutoryComponentType.EPF,
        contributionType: ContributionType.BOTH,
        calculationBasis: CalculationBasis.BASIC_SALARY,
        employeePercentage: 12.0,
        employerPercentage: 12.0,
        minimumAmount: 100,
        maximumAmount: 1800,
        wageCeiling: 15000,
        wageFloor: 1000,
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: null,
        isMandatory: true,
        displayOrder: index,
        description: `Description for component ${index}`,
        regulatoryReference: `Reference ${index}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      statutoryComponentRepository.find.mockResolvedValue(components as any);

      const startTime = Date.now();
      const result = await service.findByType('country-id', 'epf');
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

      statutoryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

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
        componentType: StatutoryComponentType.EPF,
        contributionType: ContributionType.BOTH,
        calculationBasis: CalculationBasis.BASIC_SALARY,
        employeePercentage: 12.0,
        employerPercentage: 12.0,
        minimumAmount: 100,
        maximumAmount: 1800,
        wageCeiling: 15000,
        wageFloor: 1000,
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: null,
        isMandatory: true,
        displayOrder: index,
        description: `Description for component ${index}`,
        regulatoryReference: `Reference ${index}`,
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

      statutoryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const startTime = Date.now();
      const result = await service.findByCountry('country-id', 1, 10000);
      const endTime = Date.now();

      expect(result.components).toHaveLength(10000);
      expect(result.total).toBe(10000);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle complex date range queries efficiently', async () => {
      const componentsWithDateRanges = Array.from({ length: 1000 }, (_, index) => ({
        id: `component-${index}`,
        countryId: 'country-id',
        componentName: `Component ${index}`,
        componentCode: `COMP_${index}`,
        componentType: StatutoryComponentType.EPF,
        contributionType: ContributionType.BOTH,
        calculationBasis: CalculationBasis.BASIC_SALARY,
        employeePercentage: 12.0,
        employerPercentage: 12.0,
        minimumAmount: 100,
        maximumAmount: 1800,
        wageCeiling: 15000,
        wageFloor: 1000,
        effectiveFrom: new Date(`2024-${String(index % 12 + 1).padStart(2, '0')}-01`),
        effectiveTo: index % 2 === 0 ? new Date(`2024-${String(index % 12 + 2).padStart(2, '0')}-01`) : null,
        isMandatory: true,
        displayOrder: index,
        description: `Description for component ${index}`,
        regulatoryReference: `Reference ${index}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(componentsWithDateRanges.slice(0, 500)),
      };

      statutoryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const targetDate = new Date('2024-06-15');
      const startTime = Date.now();
      const result = await service.findActiveByDate('country-id', targetDate);
      const endTime = Date.now();

      expect(result).toHaveLength(500);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });
  });
});
