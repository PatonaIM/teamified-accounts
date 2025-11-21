import { Test, TestingModule } from '@nestjs/testing';
import { EmploymentRecordController } from './employment-record.controller';
import { EmploymentRecordService } from '../services/employment-record.service';
import { CreateEmploymentRecordDto } from '../dto/create-employment-record.dto';
import { UpdateEmploymentRecordDto } from '../dto/update-employment-record.dto';
import { TerminateEmploymentRecordDto } from '../dto/terminate-employment-record.dto';
import { EmploymentRecordResponseDto } from '../dto/employment-record-response.dto';
import { CurrentUserData } from '../../common/decorators/current-user.decorator';

describe('EmploymentRecordController', () => {
  let controller: EmploymentRecordController;
  let service: jest.Mocked<EmploymentRecordService>;

  const mockCurrentUser: CurrentUserData = {
    id: 'current-user-id',
    email: 'admin@teamified.com',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User'
  };

  const mockEmploymentRecord: EmploymentRecordResponseDto = {
    id: 'test-id',
    userId: 'user-id',
    clientId: 'client-id',
    countryId: 'country-id',
    startDate: new Date('2024-01-01'),
    endDate: null,
    role: 'Software Engineer',
    status: 'active',
    migratedFromZoho: false,
    zohoEmploymentId: null,
    onboardingSubmittedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    },
    client: {
      id: 'client-id',
      name: 'Test Client',
      status: 'active'
    }
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUserId: jest.fn(),
      findByClientId: jest.fn(),
      update: jest.fn(),
      terminate: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmploymentRecordController],
      providers: [
        {
          provide: EmploymentRecordService,
          useValue: mockService,
        },
      ],
    })
    .overrideGuard(require('../../common/guards/jwt-auth.guard').JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(require('../../common/guards/roles.guard').RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<EmploymentRecordController>(EmploymentRecordController);
    service = module.get(EmploymentRecordService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an employment record', async () => {
      const createDto: CreateEmploymentRecordDto = {
        userId: 'user-id',
        clientId: 'client-id',
        countryId: 'country-id',
        startDate: '2024-01-01',
        role: 'Software Engineer',
        status: 'active'
      };

      service.create.mockResolvedValue(mockEmploymentRecord);

      const result = await controller.create(createDto, mockCurrentUser);

      expect(service.create).toHaveBeenCalledWith(createDto, mockCurrentUser);
      expect(result).toEqual({ employmentRecord: mockEmploymentRecord });
    });
  });

  describe('findAll', () => {
    it('should return employment records with pagination', async () => {
      const mockResult = {
        employmentRecords: [mockEmploymentRecord],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      service.findAll.mockResolvedValue(mockResult);

      const mockReq = { user: { roles: ['admin'], sub: 'user-id' } };
      const result = await controller.findAll({}, mockReq);

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResult);
    });
  });

  describe('findByUserId', () => {
    it('should return employment records for a user', async () => {
      const mockRecords = [mockEmploymentRecord];
      service.findByUserId.mockResolvedValue(mockRecords);

      const mockReq = {
        user: {
          sub: 'user-id',
          roles: ['admin'],
        },
      };

      const result = await controller.findByUserId('user-id', mockReq);

      expect(service.findByUserId).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({ employmentRecords: mockRecords });
    });
  });

  describe('findByClientId', () => {
    it('should return employment records for a client', async () => {
      const mockRecords = [mockEmploymentRecord];
      service.findByClientId.mockResolvedValue(mockRecords);

      const result = await controller.findByClientId('client-id');

      expect(service.findByClientId).toHaveBeenCalledWith('client-id');
      expect(result).toEqual({ employmentRecords: mockRecords });
    });
  });

  describe('findOne', () => {
    it('should return a specific employment record', async () => {
      service.findOne.mockResolvedValue(mockEmploymentRecord);

      const result = await controller.findOne('test-id');

      expect(service.findOne).toHaveBeenCalledWith('test-id');
      expect(result).toEqual({ employmentRecord: mockEmploymentRecord });
    });
  });

  describe('updateFull', () => {
    it('should update an employment record (full update)', async () => {
      const updateDto: UpdateEmploymentRecordDto = {
        role: 'Senior Software Engineer'
      };

      const updatedRecord = { ...mockEmploymentRecord, role: 'Senior Software Engineer' };
      service.update.mockResolvedValue(updatedRecord);

      const result = await controller.updateFull('test-id', updateDto, mockCurrentUser);

      expect(service.update).toHaveBeenCalledWith('test-id', updateDto, mockCurrentUser);
      expect(result).toEqual({ employmentRecord: updatedRecord });
    });
  });

  describe('update', () => {
    it('should update an employment record (partial update)', async () => {
      const updateDto: UpdateEmploymentRecordDto = {
        role: 'Senior Software Engineer'
      };

      const updatedRecord = { ...mockEmploymentRecord, role: 'Senior Software Engineer' };
      service.update.mockResolvedValue(updatedRecord);

      const result = await controller.update('test-id', updateDto, mockCurrentUser);

      expect(service.update).toHaveBeenCalledWith('test-id', updateDto, mockCurrentUser);
      expect(result).toEqual({ employmentRecord: updatedRecord });
    });
  });

  describe('terminate', () => {
    it('should terminate an employment record', async () => {
      const terminateDto: TerminateEmploymentRecordDto = {
        endDate: '2024-12-31'
      };

      const terminatedRecord = { 
        ...mockEmploymentRecord, 
        status: 'terminated' as const,
        endDate: new Date('2024-12-31')
      };
      service.terminate.mockResolvedValue(terminatedRecord);

      const result = await controller.terminate('test-id', terminateDto, mockCurrentUser);

      expect(service.terminate).toHaveBeenCalledWith('test-id', terminateDto, mockCurrentUser);
      expect(result).toEqual({ employmentRecord: terminatedRecord });
    });
  });

  describe('remove', () => {
    it('should delete an employment record', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('test-id', mockCurrentUser);

      expect(service.remove).toHaveBeenCalledWith('test-id', mockCurrentUser);
    });
  });
});
