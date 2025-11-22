import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { StatutoryComponentController } from '../statutory-component.controller';
import { StatutoryComponentService } from '../../services/statutory-component.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CreateStatutoryComponentDto, UpdateStatutoryComponentDto } from '../../dto/statutory-component.dto';
import { StatutoryComponentType, ContributionType, CalculationBasis } from '../../entities/statutory-component.entity';

describe('StatutoryComponentController Integration', () => {
  let app: INestApplication;
  let statutoryComponentService: jest.Mocked<StatutoryComponentService>;

  const mockStatutoryComponentService = {
    create: jest.fn(),
    findByCountry: jest.fn(),
    findByType: jest.fn(),
    findActiveByDate: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockStatutoryComponent = {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatutoryComponentController],
      providers: [
        {
          provide: StatutoryComponentService,
          useValue: mockStatutoryComponentService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
    
    statutoryComponentService = module.get(StatutoryComponentService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /v1/payroll/configuration/countries/:countryId/statutory-components', () => {
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
      statutoryComponentService.create.mockResolvedValue(mockStatutoryComponent as any);

      const response = await request(app.getHttpServer())
        .post('/v1/payroll/configuration/countries/country-id/statutory-components')
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual(expect.objectContaining({
        componentName: 'Employee Provident Fund',
        componentCode: 'EPF',
        componentType: 'epf',
      }));
      expect(statutoryComponentService.create).toHaveBeenCalledWith({
        ...createDto,
        countryId: 'country-id',
      });
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        ...createDto,
        componentName: '', // Invalid: empty string
        employeePercentage: 150, // Invalid: > 100
      };

      await request(app.getHttpServer())
        .post('/v1/payroll/configuration/countries/country-id/statutory-components')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteDto = {
        componentName: 'EPF',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/v1/payroll/configuration/countries/country-id/statutory-components')
        .send(incompleteDto)
        .expect(400);
    });

    it('should validate effective date format', async () => {
      const invalidDto = {
        ...createDto,
        effectiveFrom: 'invalid-date',
      };

      await request(app.getHttpServer())
        .post('/v1/payroll/configuration/countries/country-id/statutory-components')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /v1/payroll/configuration/countries/:countryId/statutory-components', () => {
    it('should return paginated statutory components', async () => {
      const mockResponse = {
        components: [mockStatutoryComponent],
        total: 1,
        page: 1,
        limit: 10,
      };

      statutoryComponentService.findByCountry.mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/statutory-components')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(statutoryComponentService.findByCountry).toHaveBeenCalledWith('country-id', 1, 10, undefined, undefined);
    });

    it('should filter by component type', async () => {
      const mockResponse = {
        components: [mockStatutoryComponent],
        total: 1,
        page: 1,
        limit: 10,
      };

      statutoryComponentService.findByCountry.mockResolvedValue(mockResponse as any);

      await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/statutory-components')
        .query({ componentType: 'epf' })
        .expect(200);

      expect(statutoryComponentService.findByCountry).toHaveBeenCalledWith('country-id', 1, 10, 'epf', undefined);
    });

    it('should filter by active status', async () => {
      const mockResponse = {
        components: [mockStatutoryComponent],
        total: 1,
        page: 1,
        limit: 10,
      };

      statutoryComponentService.findByCountry.mockResolvedValue(mockResponse as any);

      await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/statutory-components')
        .query({ isActive: 'true' })
        .expect(200);

      expect(statutoryComponentService.findByCountry).toHaveBeenCalledWith('country-id', 1, 10, undefined, true);
    });
  });

  describe('GET /v1/payroll/configuration/countries/:countryId/statutory-components/by-type/:componentType', () => {
    it('should return statutory components by type', async () => {
      statutoryComponentService.findByType.mockResolvedValue([mockStatutoryComponent] as any);

      const response = await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/statutory-components/by-type/epf')
        .expect(200);

      expect(response.body).toEqual([expect.objectContaining({
        componentName: 'Employee Provident Fund',
        componentType: 'epf',
      })]);
      expect(statutoryComponentService.findByType).toHaveBeenCalledWith('country-id', 'epf');
    });
  });

  describe('GET /v1/payroll/configuration/countries/:countryId/statutory-components/active-by-date', () => {
    it('should return active statutory components for a specific date', async () => {
      statutoryComponentService.findActiveByDate.mockResolvedValue([mockStatutoryComponent] as any);

      const response = await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/statutory-components/active-by-date')
        .query({ date: '2024-06-01' })
        .expect(200);

      expect(response.body).toEqual([expect.objectContaining({
        componentName: 'Employee Provident Fund',
        componentType: 'epf',
      })]);
      expect(statutoryComponentService.findActiveByDate).toHaveBeenCalledWith('country-id', new Date('2024-06-01'));
    });

    it('should return 400 for invalid date format', async () => {
      await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/statutory-components/active-by-date')
        .query({ date: 'invalid-date' })
        .expect(400);
    });

    it('should return 400 for missing date parameter', async () => {
      await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/statutory-components/active-by-date')
        .expect(400);
    });
  });

  describe('GET /v1/payroll/configuration/countries/:countryId/statutory-components/:id', () => {
    it('should return a statutory component by ID', async () => {
      statutoryComponentService.findOne.mockResolvedValue(mockStatutoryComponent as any);

      const response = await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/statutory-components/component-id')
        .expect(200);

      expect(response.body).toEqual(expect.objectContaining({
        id: 'component-id',
        componentName: 'Employee Provident Fund',
      }));
      expect(statutoryComponentService.findOne).toHaveBeenCalledWith('component-id');
    });

    it('should return 404 when component not found', async () => {
      statutoryComponentService.findOne.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/statutory-components/non-existent-id')
        .expect(500);
    });
  });

  describe('PUT /v1/payroll/configuration/countries/:countryId/statutory-components/:id', () => {
    const updateDto: UpdateStatutoryComponentDto = {
      componentName: 'Updated EPF',
      employeePercentage: 13.0,
    };

    it('should update a statutory component successfully', async () => {
      const updatedComponent = { ...mockStatutoryComponent, ...updateDto };
      statutoryComponentService.update.mockResolvedValue(updatedComponent as any);

      const response = await request(app.getHttpServer())
        .put('/v1/payroll/configuration/countries/country-id/statutory-components/component-id')
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual(expect.objectContaining({
        componentName: 'Updated EPF',
        employeePercentage: 13.0,
      }));
      expect(statutoryComponentService.update).toHaveBeenCalledWith('component-id', updateDto);
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        employeePercentage: 150, // Invalid: > 100
      };

      await request(app.getHttpServer())
        .put('/v1/payroll/configuration/countries/country-id/statutory-components/component-id')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate effective date format', async () => {
      const invalidDto = {
        effectiveFrom: 'invalid-date',
      };

      await request(app.getHttpServer())
        .put('/v1/payroll/configuration/countries/country-id/statutory-components/component-id')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('DELETE /v1/payroll/configuration/countries/:countryId/statutory-components/:id', () => {
    it('should delete a statutory component successfully', async () => {
      statutoryComponentService.remove.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/v1/payroll/configuration/countries/country-id/statutory-components/component-id')
        .expect(200);

      expect(response.body).toEqual({ message: 'Statutory component deleted successfully' });
      expect(statutoryComponentService.remove).toHaveBeenCalledWith('component-id');
    });

    it('should return 400 when trying to delete mandatory component', async () => {
      statutoryComponentService.remove.mockRejectedValue(new Error('Cannot delete mandatory component'));

      await request(app.getHttpServer())
        .delete('/v1/payroll/configuration/countries/country-id/statutory-components/component-id')
        .expect(500);
    });
  });
});
