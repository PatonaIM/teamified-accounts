import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { StatutoryComponentService } from '../statutory-component.service';
import { 
  StatutoryComponent, 
  StatutoryComponentType, 
  ContributionType, 
  CalculationBasis 
} from '../../entities/statutory-component.entity';
import { Country } from '../../entities/country.entity';
import { RegionConfigurationService } from '../region-configuration.service';
import { CreateStatutoryComponentDto, UpdateStatutoryComponentDto } from '../../dto/statutory-component.dto';

describe('StatutoryComponentService', () => {
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

  const mockStatutoryComponent: StatutoryComponent = {
    id: 'component-id',
    countryId: 'country-id',
    componentName: 'Employee Provident Fund',
    componentCode: 'EPF',
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
    displayOrder: 1,
    description: 'Employee Provident Fund contribution',
    regulatoryReference: 'EPF Act 1952',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    country: mockCountry,
  } as StatutoryComponent;

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

  describe('create', () => {
    const createDto: CreateStatutoryComponentDto = {
      countryId: 'country-id',
      componentName: 'Employee Provident Fund',
      componentCode: 'EPF',
      componentType: StatutoryComponentType.EPF,
      contributionType: ContributionType.BOTH,
      calculationBasis: CalculationBasis.BASIC_SALARY,
      employeePercentage: 12.0,
      employerPercentage: 12.0,
      minimumAmount: 100,
      maximumAmount: 1800,
      wageCeiling: 15000,
      wageFloor: 1000,
      effectiveFrom: '2024-01-01',
      isMandatory: true,
      displayOrder: 1,
      description: 'Employee Provident Fund contribution',
      regulatoryReference: 'EPF Act 1952',
      isActive: true,
    };

    it('should create a statutory component successfully', async () => {
      countryRepository.findOne.mockResolvedValue(mockCountry);
      statutoryComponentRepository.findOne.mockResolvedValue(null);
      statutoryComponentRepository.create.mockReturnValue(mockStatutoryComponent);
      statutoryComponentRepository.save.mockResolvedValue(mockStatutoryComponent);
      regionConfigurationService.findByCountry.mockResolvedValue([]);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.componentName).toBe('Employee Provident Fund');
      expect(countryRepository.findOne).toHaveBeenCalledWith({ where: { id: 'country-id' } });
      expect(statutoryComponentRepository.create).toHaveBeenCalledWith(createDto);
      expect(statutoryComponentRepository.save).toHaveBeenCalledWith(mockStatutoryComponent);
    });

    it('should throw NotFoundException when country not found', async () => {
      countryRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(countryRepository.findOne).toHaveBeenCalledWith({ where: { id: 'country-id' } });
    });

    it('should throw BadRequestException when component code already exists', async () => {
      countryRepository.findOne.mockResolvedValue(mockCountry);
      statutoryComponentRepository.findOne.mockResolvedValue(mockStatutoryComponent);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid contribution rules', async () => {
      const invalidDto = { ...createDto, contributionType: ContributionType.EMPLOYEE, employeePercentage: null };
      countryRepository.findOne.mockResolvedValue(mockCountry);
      statutoryComponentRepository.findOne.mockResolvedValue(null);

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid effective dates', async () => {
      const invalidDto = { ...createDto, effectiveFrom: '2024-12-31', effectiveTo: '2024-01-01' };
      countryRepository.findOne.mockResolvedValue(mockCountry);
      statutoryComponentRepository.findOne.mockResolvedValue(null);

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should apply India-specific business rules', async () => {
      const indiaDto = { ...createDto, componentType: StatutoryComponentType.EPF };
      countryRepository.findOne.mockResolvedValue({ ...mockCountry, code: 'IN' });
      statutoryComponentRepository.findOne.mockResolvedValue(null);
      statutoryComponentRepository.create.mockReturnValue(mockStatutoryComponent);
      statutoryComponentRepository.save.mockResolvedValue(mockStatutoryComponent);
      regionConfigurationService.findByCountry.mockResolvedValue([]);

      const result = await service.create(indiaDto);

      expect(result).toBeDefined();
      expect(regionConfigurationService.findByCountry).toHaveBeenCalledWith('country-id');
    });

    it('should apply Philippines-specific business rules', async () => {
      const philippinesDto = { ...createDto, componentType: StatutoryComponentType.SSS };
      countryRepository.findOne.mockResolvedValue({ ...mockCountry, code: 'PH' });
      statutoryComponentRepository.findOne.mockResolvedValue(null);
      statutoryComponentRepository.create.mockReturnValue(mockStatutoryComponent);
      statutoryComponentRepository.save.mockResolvedValue(mockStatutoryComponent);
      regionConfigurationService.findByCountry.mockResolvedValue([]);

      const result = await service.create(philippinesDto);

      expect(result).toBeDefined();
      expect(regionConfigurationService.findByCountry).toHaveBeenCalledWith('country-id');
    });
  });

  describe('findByCountry', () => {
    it('should return paginated statutory components for a country', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockStatutoryComponent], 1]),
      };

      statutoryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findByCountry('country-id', 1, 10);

      expect(result).toEqual({
        components: [expect.objectContaining({ componentName: 'Employee Provident Fund' })],
        total: 1,
        page: 1,
        limit: 10,
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('component.countryId = :countryId', { countryId: 'country-id' });
    });

    it('should filter by component type', async () => {
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

      await service.findByCountry('country-id', 1, 10, 'epf');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('component.componentType = :componentType', { componentType: 'epf' });
    });
  });

  describe('findOne', () => {
    it('should return a statutory component by ID', async () => {
      statutoryComponentRepository.findOne.mockResolvedValue(mockStatutoryComponent);

      const result = await service.findOne('component-id');

      expect(result).toBeDefined();
      expect(result.componentName).toBe('Employee Provident Fund');
      expect(statutoryComponentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'component-id' },
        relations: ['country'],
      });
    });

    it('should throw NotFoundException when component not found', async () => {
      statutoryComponentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateStatutoryComponentDto = {
      componentName: 'Updated EPF',
      employeePercentage: 13.0,
    };

    it('should update a statutory component successfully', async () => {
      statutoryComponentRepository.findOne.mockResolvedValue(mockStatutoryComponent);
      statutoryComponentRepository.save.mockResolvedValue({ 
        ...mockStatutoryComponent, 
        ...updateDto,
        effectiveFrom: new Date(updateDto.effectiveFrom || mockStatutoryComponent.effectiveFrom),
        effectiveTo: updateDto.effectiveTo ? new Date(updateDto.effectiveTo) : mockStatutoryComponent.effectiveTo
      });
      regionConfigurationService.findByCountry.mockResolvedValue([]);

      const result = await service.update('component-id', updateDto);

      expect(result).toBeDefined();
      expect(statutoryComponentRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when component not found', async () => {
      statutoryComponentRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a statutory component successfully', async () => {
      statutoryComponentRepository.findOne.mockResolvedValue(mockStatutoryComponent);
      statutoryComponentRepository.remove.mockResolvedValue(mockStatutoryComponent);

      await service.remove('component-id');

      expect(statutoryComponentRepository.remove).toHaveBeenCalledWith(mockStatutoryComponent);
    });

    it('should throw NotFoundException when component not found', async () => {
      statutoryComponentRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when trying to delete mandatory component', async () => {
      const mandatoryComponent = { ...mockStatutoryComponent, isMandatory: true };
      statutoryComponentRepository.findOne.mockResolvedValue(mandatoryComponent);

      await expect(service.remove('component-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByType', () => {
    it('should return statutory components by type', async () => {
      statutoryComponentRepository.find.mockResolvedValue([mockStatutoryComponent]);

      const result = await service.findByType('country-id', 'epf');

      expect(result).toHaveLength(1);
      expect(result[0].componentName).toBe('Employee Provident Fund');
      expect(statutoryComponentRepository.find).toHaveBeenCalledWith({
        where: {
          countryId: 'country-id',
          componentType: 'epf',
          isActive: true,
        },
        order: {
          displayOrder: 'ASC',
          componentName: 'ASC',
        },
      });
    });
  });

  describe('findActiveByDate', () => {
    it('should return active statutory components for a specific date', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockStatutoryComponent]),
      };

      statutoryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const targetDate = new Date('2024-06-01');
      const result = await service.findActiveByDate('country-id', targetDate);

      expect(result).toHaveLength(1);
      expect(result[0].componentName).toBe('Employee Provident Fund');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('component.countryId = :countryId', { countryId: 'country-id' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('component.isActive = :isActive', { isActive: true });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('component.effectiveFrom <= :date', { date: targetDate });
    });
  });

  describe('validation rules', () => {
    it('should validate employee contribution requirements', () => {
      const service = new StatutoryComponentService(
        statutoryComponentRepository as any,
        countryRepository as any,
        regionConfigurationService as any,
      );

      const dto = {
        contributionType: ContributionType.EMPLOYEE,
        employeePercentage: null,
      } as any;

      expect(() => service['validateContributionRules'](dto)).toThrow(BadRequestException);
    });

    it('should validate employer contribution requirements', () => {
      const service = new StatutoryComponentService(
        statutoryComponentRepository as any,
        countryRepository as any,
        regionConfigurationService as any,
      );

      const dto = {
        contributionType: ContributionType.EMPLOYER,
        employerPercentage: null,
      } as any;

      expect(() => service['validateContributionRules'](dto)).toThrow(BadRequestException);
    });

    it('should validate effective date ranges', () => {
      const service = new StatutoryComponentService(
        statutoryComponentRepository as any,
        countryRepository as any,
        regionConfigurationService as any,
      );

      const dto = {
        effectiveFrom: '2024-12-31',
        effectiveTo: '2024-01-01',
      } as any;

      expect(() => service['validateContributionRules'](dto)).toThrow(BadRequestException);
    });

    it('should validate wage ceiling and floor', () => {
      const service = new StatutoryComponentService(
        statutoryComponentRepository as any,
        countryRepository as any,
        regionConfigurationService as any,
      );

      const dto = {
        wageCeiling: 1000,
        wageFloor: 2000,
      } as any;

      expect(() => service['validateContributionRules'](dto)).toThrow(BadRequestException);
    });

    it('should validate minimum and maximum amounts', () => {
      const service = new StatutoryComponentService(
        statutoryComponentRepository as any,
        countryRepository as any,
        regionConfigurationService as any,
      );

      const dto = {
        minimumAmount: 2000,
        maximumAmount: 1000,
      } as any;

      expect(() => service['validateContributionRules'](dto)).toThrow(BadRequestException);
    });
  });
});
