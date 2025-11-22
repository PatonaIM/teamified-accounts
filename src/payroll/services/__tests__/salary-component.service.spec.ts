import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SalaryComponentService } from '../salary-component.service';
import { SalaryComponent, SalaryComponentType, CalculationType } from '../../entities/salary-component.entity';
import { Country } from '../../entities/country.entity';
import { RegionConfigurationService } from '../region-configuration.service';
import { CreateSalaryComponentDto, UpdateSalaryComponentDto } from '../../dto/salary-component.dto';

describe('SalaryComponentService', () => {
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

  const mockSalaryComponent: SalaryComponent = {
    id: 'component-id',
    countryId: 'country-id',
    componentName: 'Basic Salary',
    componentCode: 'BASIC',
    componentType: SalaryComponentType.EARNINGS,
    calculationType: CalculationType.FIXED_AMOUNT,
    calculationValue: 50000,
    calculationFormula: null,
    isTaxable: true,
    isStatutory: false,
    isMandatory: true,
    displayOrder: 1,
    description: 'Basic salary component',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    country: mockCountry,
  } as SalaryComponent;

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

  describe('create', () => {
    const createDto: CreateSalaryComponentDto = {
      countryId: 'country-id',
      componentName: 'Basic Salary',
      componentCode: 'BASIC',
      componentType: SalaryComponentType.EARNINGS,
      calculationType: CalculationType.FIXED_AMOUNT,
      calculationValue: 50000,
      isTaxable: true,
      isStatutory: false,
      isMandatory: true,
      displayOrder: 1,
      description: 'Basic salary component',
      isActive: true,
    };

    it('should create a salary component successfully', async () => {
      countryRepository.findOne.mockResolvedValue(mockCountry);
      salaryComponentRepository.findOne.mockResolvedValue(null);
      salaryComponentRepository.create.mockReturnValue(mockSalaryComponent);
      salaryComponentRepository.save.mockResolvedValue(mockSalaryComponent);
      regionConfigurationService.findByCountry.mockResolvedValue([]);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.componentName).toBe('Basic Salary');
      expect(countryRepository.findOne).toHaveBeenCalledWith({ where: { id: 'country-id' } });
      expect(salaryComponentRepository.create).toHaveBeenCalledWith(createDto);
      expect(salaryComponentRepository.save).toHaveBeenCalledWith(mockSalaryComponent);
    });

    it('should throw NotFoundException when country not found', async () => {
      countryRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(countryRepository.findOne).toHaveBeenCalledWith({ where: { id: 'country-id' } });
    });

    it('should throw BadRequestException when component code already exists', async () => {
      countryRepository.findOne.mockResolvedValue(mockCountry);
      salaryComponentRepository.findOne.mockResolvedValue(mockSalaryComponent);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid calculation rules', async () => {
      const invalidDto = { ...createDto, calculationType: CalculationType.FIXED_AMOUNT, calculationValue: null };
      countryRepository.findOne.mockResolvedValue(mockCountry);
      salaryComponentRepository.findOne.mockResolvedValue(null);

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for formula without formula', async () => {
      const invalidDto = { ...createDto, calculationType: CalculationType.FORMULA, calculationFormula: null };
      countryRepository.findOne.mockResolvedValue(mockCountry);
      salaryComponentRepository.findOne.mockResolvedValue(null);

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should apply country-specific business rules', async () => {
      const indiaDto = { ...createDto, componentType: SalaryComponentType.EARNINGS, componentCode: 'BASIC' };
      countryRepository.findOne.mockResolvedValue({ ...mockCountry, code: 'IN' });
      salaryComponentRepository.findOne.mockResolvedValue(null);
      salaryComponentRepository.create.mockReturnValue(mockSalaryComponent);
      salaryComponentRepository.save.mockResolvedValue(mockSalaryComponent);
      regionConfigurationService.findByCountry.mockResolvedValue([]);

      const result = await service.create(indiaDto);

      expect(result).toBeDefined();
      expect(regionConfigurationService.findByCountry).toHaveBeenCalledWith('country-id');
    });
  });

  describe('findByCountry', () => {
    it('should return paginated salary components for a country', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockSalaryComponent], 1]),
      };

      salaryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findByCountry('country-id', 1, 10);

      expect(result).toEqual({
        components: [expect.objectContaining({ componentName: 'Basic Salary' })],
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

      salaryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findByCountry('country-id', 1, 10, 'earnings');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('component.componentType = :componentType', { componentType: 'earnings' });
    });

    it('should filter by active status', async () => {
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

      await service.findByCountry('country-id', 1, 10, undefined, true);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('component.isActive = :isActive', { isActive: true });
    });
  });

  describe('findOne', () => {
    it('should return a salary component by ID', async () => {
      salaryComponentRepository.findOne.mockResolvedValue(mockSalaryComponent);

      const result = await service.findOne('component-id');

      expect(result).toBeDefined();
      expect(result.componentName).toBe('Basic Salary');
      expect(salaryComponentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'component-id' },
        relations: ['country'],
      });
    });

    it('should throw NotFoundException when component not found', async () => {
      salaryComponentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateSalaryComponentDto = {
      componentName: 'Updated Basic Salary',
      calculationValue: 60000,
    };

    it('should update a salary component successfully', async () => {
      salaryComponentRepository.findOne.mockResolvedValue(mockSalaryComponent);
      salaryComponentRepository.save.mockResolvedValue({ ...mockSalaryComponent, ...updateDto });
      regionConfigurationService.findByCountry.mockResolvedValue([]);

      const result = await service.update('component-id', updateDto);

      expect(result).toBeDefined();
      expect(salaryComponentRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when component not found', async () => {
      salaryComponentRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when component code already exists', async () => {
      salaryComponentRepository.findOne.mockResolvedValue(mockSalaryComponent);
      salaryComponentRepository.findOne.mockResolvedValueOnce(mockSalaryComponent);

      const updateWithExistingCode = { ...updateDto, componentCode: 'EXISTING' };

      await expect(service.update('component-id', updateWithExistingCode)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a salary component successfully', async () => {
      salaryComponentRepository.findOne.mockResolvedValue(mockSalaryComponent);
      salaryComponentRepository.remove.mockResolvedValue(mockSalaryComponent);

      await service.remove('component-id');

      expect(salaryComponentRepository.remove).toHaveBeenCalledWith(mockSalaryComponent);
    });

    it('should throw NotFoundException when component not found', async () => {
      salaryComponentRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when trying to delete mandatory component', async () => {
      const mandatoryComponent = { ...mockSalaryComponent, isMandatory: true };
      salaryComponentRepository.findOne.mockResolvedValue(mandatoryComponent);

      await expect(service.remove('component-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByType', () => {
    it('should return salary components by type', async () => {
      salaryComponentRepository.find.mockResolvedValue([mockSalaryComponent]);

      const result = await service.findByType('country-id', 'earnings');

      expect(result).toHaveLength(1);
      expect(result[0].componentName).toBe('Basic Salary');
      expect(salaryComponentRepository.find).toHaveBeenCalledWith({
        where: {
          countryId: 'country-id',
          componentType: 'earnings',
          isActive: true,
        },
        order: {
          displayOrder: 'ASC',
          componentName: 'ASC',
        },
      });
    });
  });

  describe('validation rules', () => {
    it('should validate fixed amount calculation', () => {
      const service = new SalaryComponentService(
        salaryComponentRepository as any,
        countryRepository as any,
        regionConfigurationService as any,
      );

      const dto = {
        calculationType: CalculationType.FIXED_AMOUNT,
        calculationValue: null,
        calculationFormula: 'some formula',
      } as any;

      expect(() => service['validateCalculationRules'](dto)).toThrow(BadRequestException);
    });

    it('should validate percentage calculation', () => {
      const service = new SalaryComponentService(
        salaryComponentRepository as any,
        countryRepository as any,
        regionConfigurationService as any,
      );

      const dto = {
        calculationType: CalculationType.PERCENTAGE_OF_BASIC,
        calculationValue: 150, // Invalid: > 100
        calculationFormula: 'some formula',
      } as any;

      expect(() => service['validateCalculationRules'](dto)).toThrow(BadRequestException);
    });

    it('should validate formula calculation', () => {
      const service = new SalaryComponentService(
        salaryComponentRepository as any,
        countryRepository as any,
        regionConfigurationService as any,
      );

      const dto = {
        calculationType: CalculationType.FORMULA,
        calculationValue: 100,
        calculationFormula: null,
      } as any;

      expect(() => service['validateCalculationRules'](dto)).toThrow(BadRequestException);
    });
  });
});
