import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { EmploymentRecordService } from './employment-record.service';
import { EmploymentRecord } from '../entities/employment-record.entity';
import { CreateEmploymentRecordDto } from '../dto/create-employment-record.dto';
import { UpdateEmploymentRecordDto } from '../dto/update-employment-record.dto';
import { TerminateEmploymentRecordDto } from '../dto/terminate-employment-record.dto';
import { AuditService } from '../../audit/audit.service';
import { CurrentUserData } from '../../common/decorators/current-user.decorator';
import {
  EmploymentRecordNotFoundException,
  EmploymentRecordOverlapException,
  EmploymentRecordStatusTransitionException,
  EmploymentRecordDateValidationException,
  EmploymentRecordTerminationException
} from '../exceptions/employment-record.exceptions';

describe('EmploymentRecordService', () => {
  let service: EmploymentRecordService;
  let mockRepository: jest.Mocked<Repository<EmploymentRecord>>;
  let mockAuditService: jest.Mocked<AuditService>;

  const mockCurrentUser: CurrentUserData = {
    id: 'current-user-id',
    email: 'admin@teamified.com',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User'
  };

  const mockEmploymentRecord: EmploymentRecord = {
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
  } as any;

  beforeEach(async () => {
    const mockAuditServiceValue = {
      logEmploymentRecordCreated: jest.fn(),
      logEmploymentRecordUpdated: jest.fn(),
      logEmploymentRecordTerminated: jest.fn(),
      logEmploymentRecordDeleted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmploymentRecordService,
        {
          provide: getRepositoryToken(EmploymentRecord),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: mockAuditServiceValue,
        },
      ],
    }).compile();

    service = module.get<EmploymentRecordService>(EmploymentRecordService);
    mockRepository = module.get(getRepositoryToken(EmploymentRecord));
    mockAuditService = module.get(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateEmploymentRecordDto = {
      userId: 'user-id',
      clientId: 'client-id',
      countryId: 'country-id',
      startDate: '2024-01-01',
      role: 'Software Engineer',
      status: 'active'
    };

    it('should create an employment record successfully', async () => {
      mockRepository.create.mockReturnValue(mockEmploymentRecord);
      mockRepository.save.mockResolvedValue(mockEmploymentRecord);
      mockRepository.findOne.mockResolvedValue(null); // No overlapping employment

      const result = await service.create(createDto, mockCurrentUser);

      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user-id',
        clientId: 'client-id',
        role: 'Software Engineer',
        status: 'active',
        startDate: expect.any(Date),
        endDate: null
      }));
      expect(mockRepository.save).toHaveBeenCalledWith(mockEmploymentRecord);
      expect(result).toEqual(expect.objectContaining({
        id: 'test-id',
        userId: 'user-id',
        clientId: 'client-id',
        role: 'Software Engineer',
        status: 'active'
      }));
    });

    it('should throw ConflictException when overlapping employment exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmploymentRecord);

      await expect(service.create(createDto, mockCurrentUser)).rejects.toThrow(EmploymentRecordOverlapException);
    });
  });

  describe('findOne', () => {
    it('should return an employment record when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmploymentRecord);

      const result = await service.findOne('test-id');

      expect(result).toEqual(expect.objectContaining({
        id: 'test-id',
        userId: 'user-id',
        clientId: 'client-id'
      }));
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['user', 'client']
      });
    });

    it('should throw NotFoundException when employment record not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('test-id')).rejects.toThrow(EmploymentRecordNotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return employment records for a user', async () => {
      const mockRecords = [mockEmploymentRecord];
      mockRepository.find.mockResolvedValue(mockRecords);

      const result = await service.findByUserId('user-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        userId: 'user-id'
      }));
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        relations: ['user', 'client'],
        order: { startDate: 'DESC' }
      });
    });
  });

  describe('findByClientId', () => {
    it('should return employment records for a client', async () => {
      const mockRecords = [mockEmploymentRecord];
      mockRepository.find.mockResolvedValue(mockRecords);

      const result = await service.findByClientId('client-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        clientId: 'client-id'
      }));
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { clientId: 'client-id' },
        relations: ['user', 'client'],
        order: { startDate: 'DESC' }
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateEmploymentRecordDto = {
      role: 'Senior Software Engineer',
      status: 'inactive'
    };

    it('should update an employment record successfully', async () => {
      const updatedRecord = { 
        ...mockEmploymentRecord, 
        role: 'Senior Software Engineer',
        status: 'inactive' as const
      };
      mockRepository.findOne.mockResolvedValue(mockEmploymentRecord);
      mockRepository.save.mockResolvedValue(updatedRecord);

      const result = await service.update('test-id', updateDto, mockCurrentUser);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['user', 'client']
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        role: 'Senior Software Engineer',
        status: 'inactive'
      }));
    });

    it('should throw NotFoundException when employment record not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('test-id', updateDto, mockCurrentUser)).rejects.toThrow(EmploymentRecordNotFoundException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const invalidUpdateDto = { status: 'active' as const };
      const terminatedRecord = { ...mockEmploymentRecord, status: 'terminated' as const };
      mockRepository.findOne.mockResolvedValue(terminatedRecord);

      await expect(service.update('test-id', invalidUpdateDto, mockCurrentUser)).rejects.toThrow(EmploymentRecordStatusTransitionException);
    });
  });

  describe('terminate', () => {
    const terminateDto: TerminateEmploymentRecordDto = {
      endDate: '2024-12-31'
    };

    it('should terminate an employment record successfully', async () => {
      const terminatedRecord = { 
        ...mockEmploymentRecord, 
        status: 'terminated' as const,
        endDate: new Date('2024-12-31')
      };
      mockRepository.findOne.mockResolvedValue(mockEmploymentRecord);
      mockRepository.save.mockResolvedValue(terminatedRecord);

      const result = await service.terminate('test-id', terminateDto, mockCurrentUser);

      expect(result).toEqual(expect.objectContaining({
        status: 'terminated',
        endDate: new Date('2024-12-31')
      }));
    });

    it('should throw NotFoundException when employment record not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.terminate('test-id', terminateDto, mockCurrentUser)).rejects.toThrow(EmploymentRecordNotFoundException);
    });

    it('should throw BadRequestException when already terminated', async () => {
      const terminatedRecord = { ...mockEmploymentRecord, status: 'terminated' as const };
      mockRepository.findOne.mockResolvedValue(terminatedRecord);

      await expect(service.terminate('test-id', terminateDto, mockCurrentUser)).rejects.toThrow(EmploymentRecordTerminationException);
    });
  });

  describe('remove', () => {
    it('should delete an employment record successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmploymentRecord);
      mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove('test-id', mockCurrentUser);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['user', 'client']
      });
      expect(mockRepository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should throw NotFoundException when employment record not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('test-id', mockCurrentUser)).rejects.toThrow(EmploymentRecordNotFoundException);
    });
  });
});
