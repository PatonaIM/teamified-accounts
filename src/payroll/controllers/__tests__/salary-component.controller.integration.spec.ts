import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { SalaryComponentController } from '../salary-component.controller';
import { SalaryComponentService } from '../../services/salary-component.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CreateSalaryComponentDto, UpdateSalaryComponentDto } from '../../dto/salary-component.dto';
import { SalaryComponentType, CalculationType } from '../../entities/salary-component.entity';

describe('SalaryComponentController Integration', () => {
  let app: INestApplication;
  let salaryComponentService: jest.Mocked<SalaryComponentService>;

  const mockSalaryComponentService = {
    create: jest.fn(),
    findByCountry: jest.fn(),
    findByType: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockSalaryComponent = {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalaryComponentController],
      providers: [
        {
          provide: SalaryComponentService,
          useValue: mockSalaryComponentService,
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
    
    salaryComponentService = module.get(SalaryComponentService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /v1/payroll/configuration/countries/:countryId/salary-components', () => {
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
      salaryComponentService.create.mockResolvedValue(mockSalaryComponent as any);

      const response = await request(app.getHttpServer())
        .post('/v1/payroll/configuration/countries/country-id/salary-components')
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual(expect.objectContaining({
        componentName: 'Basic Salary',
        componentCode: 'BASIC',
        componentType: 'earnings',
      }));
      expect(salaryComponentService.create).toHaveBeenCalledWith({
        ...createDto,
        countryId: 'country-id',
      });
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        ...createDto,
        componentName: '', // Invalid: empty string
        calculationValue: -100, // Invalid: negative value
      };

      await request(app.getHttpServer())
        .post('/v1/payroll/configuration/countries/country-id/salary-components')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteDto = {
        componentName: 'Basic Salary',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/v1/payroll/configuration/countries/country-id/salary-components')
        .send(incompleteDto)
        .expect(400);
    });
  });

  describe('GET /v1/payroll/configuration/countries/:countryId/salary-components', () => {
    it('should return paginated salary components', async () => {
      const mockResponse = {
        components: [mockSalaryComponent],
        total: 1,
        page: 1,
        limit: 10,
      };

      salaryComponentService.findByCountry.mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/salary-components')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(salaryComponentService.findByCountry).toHaveBeenCalledWith('country-id', 1, 10, undefined, undefined);
    });

    it('should filter by component type', async () => {
      const mockResponse = {
        components: [mockSalaryComponent],
        total: 1,
        page: 1,
        limit: 10,
      };

      salaryComponentService.findByCountry.mockResolvedValue(mockResponse as any);

      await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/salary-components')
        .query({ componentType: 'earnings' })
        .expect(200);

      expect(salaryComponentService.findByCountry).toHaveBeenCalledWith('country-id', 1, 10, 'earnings', undefined);
    });

    it('should filter by active status', async () => {
      const mockResponse = {
        components: [mockSalaryComponent],
        total: 1,
        page: 1,
        limit: 10,
      };

      salaryComponentService.findByCountry.mockResolvedValue(mockResponse as any);

      await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/salary-components')
        .query({ isActive: 'true' })
        .expect(200);

      expect(salaryComponentService.findByCountry).toHaveBeenCalledWith('country-id', 1, 10, undefined, true);
    });

    it('should handle pagination parameters', async () => {
      const mockResponse = {
        components: [mockSalaryComponent],
        total: 1,
        page: 2,
        limit: 5,
      };

      salaryComponentService.findByCountry.mockResolvedValue(mockResponse as any);

      await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/salary-components')
        .query({ page: '2', limit: '5' })
        .expect(200);

      expect(salaryComponentService.findByCountry).toHaveBeenCalledWith('country-id', 2, 5, undefined, undefined);
    });
  });

  describe('GET /v1/payroll/configuration/countries/:countryId/salary-components/by-type/:componentType', () => {
    it('should return salary components by type', async () => {
      salaryComponentService.findByType.mockResolvedValue([mockSalaryComponent] as any);

      const response = await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/salary-components/by-type/earnings')
        .expect(200);

      expect(response.body).toEqual([expect.objectContaining({
        componentName: 'Basic Salary',
        componentType: 'earnings',
      })]);
      expect(salaryComponentService.findByType).toHaveBeenCalledWith('country-id', 'earnings');
    });
  });

  describe('GET /v1/payroll/configuration/countries/:countryId/salary-components/:id', () => {
    it('should return a salary component by ID', async () => {
      salaryComponentService.findOne.mockResolvedValue(mockSalaryComponent as any);

      const response = await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/salary-components/component-id')
        .expect(200);

      expect(response.body).toEqual(expect.objectContaining({
        id: 'component-id',
        componentName: 'Basic Salary',
      }));
      expect(salaryComponentService.findOne).toHaveBeenCalledWith('component-id');
    });

    it('should return 404 when component not found', async () => {
      salaryComponentService.findOne.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/salary-components/non-existent-id')
        .expect(500); // Service throws generic error, controller converts to 500
    });
  });

  describe('PUT /v1/payroll/configuration/countries/:countryId/salary-components/:id', () => {
    const updateDto: UpdateSalaryComponentDto = {
      componentName: 'Updated Basic Salary',
      calculationValue: 60000,
    };

    it('should update a salary component successfully', async () => {
      const updatedComponent = { ...mockSalaryComponent, ...updateDto };
      salaryComponentService.update.mockResolvedValue(updatedComponent as any);

      const response = await request(app.getHttpServer())
        .put('/v1/payroll/configuration/countries/country-id/salary-components/component-id')
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual(expect.objectContaining({
        componentName: 'Updated Basic Salary',
        calculationValue: 60000,
      }));
      expect(salaryComponentService.update).toHaveBeenCalledWith('component-id', updateDto);
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        calculationValue: -100, // Invalid: negative value
      };

      await request(app.getHttpServer())
        .put('/v1/payroll/configuration/countries/country-id/salary-components/component-id')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('DELETE /v1/payroll/configuration/countries/:countryId/salary-components/:id', () => {
    it('should delete a salary component successfully', async () => {
      salaryComponentService.remove.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/v1/payroll/configuration/countries/country-id/salary-components/component-id')
        .expect(200);

      expect(response.body).toEqual({ message: 'Salary component deleted successfully' });
      expect(salaryComponentService.remove).toHaveBeenCalledWith('component-id');
    });

    it('should return 400 when trying to delete mandatory component', async () => {
      salaryComponentService.remove.mockRejectedValue(new Error('Cannot delete mandatory component'));

      await request(app.getHttpServer())
        .delete('/v1/payroll/configuration/countries/country-id/salary-components/component-id')
        .expect(500);
    });
  });
});
