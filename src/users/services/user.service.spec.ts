import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../auth/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { BulkStatusUpdateDto } from '../dto/bulk-status-update.dto';
import { BulkRoleAssignmentDto } from '../dto/bulk-role-assignment.dto';
import { PasswordService } from '../../auth/services/password.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let passwordService: PasswordService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    address: { street: '123 Main St', city: 'New York' },
    profileData: { department: 'Engineering' },
    clientId: null,
    status: 'active',
    isActive: true,
    emailVerified: false,
    emailVerificationToken: null,
    emailVerificationTokenExpiry: null,
    passwordResetToken: null,
    migratedFromZoho: false,
    zohoUserId: null,
    supabaseUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    eorProfile: undefined,
    employmentRecords: [],
    userRoles: [],
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockPasswordService = {
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    passwordService = module.get<PasswordService>(PasswordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        address: { street: '123 Main St', city: 'New York' },
        profileData: { department: 'Engineering' },
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockPasswordService.hashPassword.mockResolvedValue('hashedPassword');
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(createUserDto.password);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        passwordHash: 'hashedPassword',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if user with email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated list of users', async () => {
      const queryDto: UserQueryDto = {
        page: 1,
        limit: 10,
        search: 'john',
        status: 'active',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      const mockUsers = [mockUser];
      const total = 1;

      mockRepository.findAndCount.mockResolvedValue([mockUsers, total]);

      const result = await service.findAll(queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          status: 'active',
          firstName: expect.any(Object), // Like('%john%')
        },
        skip: 0,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result.users).toEqual(mockUsers);
      expect(result.pagination.total).toBe(total);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['employmentRecords', 'userRoles'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['employmentRecords', 'userRoles'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      const existingUser = { ...mockUser, id: 'different-id' };

      mockRepository.findOne
        .mockResolvedValueOnce(mockUser) // First call for findOne by id
        .mockResolvedValueOnce(existingUser); // Second call for email check

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('should update user status successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const status = 'inactive';

      const updatedUser = { ...mockUser, status, isActive: false };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateStatus(userId, status);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['employmentRecords', 'userRoles'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        status,
        isActive: false,
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should update multiple user statuses successfully', async () => {
      const bulkStatusUpdateDto: BulkStatusUpdateDto = {
        userIds: ['user1', 'user2'],
        status: 'active',
      };

      const user1 = { ...mockUser, id: 'user1' };
      const user2 = { ...mockUser, id: 'user2' };

      mockRepository.findOne
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);
      mockRepository.save
        .mockResolvedValueOnce({ ...user1, status: 'active', isActive: true })
        .mockResolvedValueOnce({ ...user2, status: 'active', isActive: true });

      const result = await service.bulkUpdateStatus(bulkStatusUpdateDto);

      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(true);
    });

    it('should handle partial failures in bulk update', async () => {
      const bulkStatusUpdateDto: BulkStatusUpdateDto = {
        userIds: ['user1', 'user2'],
        status: 'active',
      };

      const user1 = { ...mockUser, id: 'user1' };

      mockRepository.findOne
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(null); // user2 not found
      mockRepository.save.mockResolvedValueOnce({ ...user1, status: 'active', isActive: true });

      const result = await service.bulkUpdateStatus(bulkStatusUpdateDto);

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(false);
    });
  });

  describe('bulkAssignRole', () => {
    it('should assign roles to multiple users successfully', async () => {
      const bulkRoleAssignmentDto: BulkRoleAssignmentDto = {
        userIds: ['user1', 'user2'],
        role: 'eor',
        scope: 'client',
        scopeId: 'client1',
      };

      const user1 = { ...mockUser, id: 'user1' };
      const user2 = { ...mockUser, id: 'user2' };

      mockRepository.findOne
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);

      const result = await service.bulkAssignRole(bulkRoleAssignmentDto);

      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(true);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const email = 'test@example.com';

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const email = 'test@example.com';

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findActiveUsers', () => {
    it('should return active users', async () => {
      const activeUsers = [mockUser];

      mockRepository.find.mockResolvedValue(activeUsers);

      const result = await service.findActiveUsers();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: 'active' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(activeUsers);
    });
  });
});
