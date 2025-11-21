import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { BulkStatusUpdateDto } from '../dto/bulk-status-update.dto';
import { BulkRoleAssignmentDto } from '../dto/bulk-role-assignment.dto';
import { User } from '../../auth/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtTokenService } from '../../auth/services/jwt.service';
import { UserRolesService } from '../../user-roles/services/user-roles.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

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

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
    bulkUpdateStatus: jest.fn(),
    bulkAssignRole: jest.fn(),
  };

  const mockJwtTokenService = {
    extractTokenFromHeader: jest.fn(),
    validateAccessToken: jest.fn(),
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    generateTokenPair: jest.fn(),
    validateRefreshToken: jest.fn(),
    generateTokenFamily: jest.fn(),
    hashRefreshToken: jest.fn(),
  };

  const mockUserRolesService = {
    getUserRoles: jest.fn(),
    assignRole: jest.fn(),
    removeRole: jest.fn(),
    getUserRolesByScope: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtTokenService,
          useValue: mockJwtTokenService,
        },
        {
          provide: UserRolesService,
          useValue: mockUserRolesService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        Reflector,
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUserService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({ user: mockUser });
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

      const mockResponse = {
        users: [mockUser],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockUserService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto);

      expect(mockUserService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ user: mockUser });
    });
  });

  describe('update', () => {
    it('should update user (partial update)', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(mockUserService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual({ user: updatedUser });
    });
  });

  describe('fullUpdate', () => {
    it('should update user (full update)', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.fullUpdate(userId, updateUserDto);

      expect(mockUserService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual({ user: updatedUser });
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockUserService.remove.mockResolvedValue(undefined);

      await controller.remove(userId);

      expect(mockUserService.remove).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateStatus', () => {
    it('should update user status', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const status = 'inactive';

      const updatedUser = { ...mockUser, status, isActive: false };

      mockUserService.updateStatus.mockResolvedValue(updatedUser);

      const result = await controller.updateStatus(userId, { status });

      expect(mockUserService.updateStatus).toHaveBeenCalledWith(userId, status);
      expect(result).toEqual({ user: updatedUser });
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should bulk update user statuses', async () => {
      const bulkStatusUpdateDto: BulkStatusUpdateDto = {
        userIds: ['user1', 'user2'],
        status: 'active',
      };

      const mockResponse = {
        processed: 2,
        failed: 0,
        results: [
          { userId: 'user1', success: true },
          { userId: 'user2', success: true },
        ],
      };

      mockUserService.bulkUpdateStatus.mockResolvedValue(mockResponse);

      const result = await controller.bulkUpdateStatus(bulkStatusUpdateDto);

      expect(mockUserService.bulkUpdateStatus).toHaveBeenCalledWith(bulkStatusUpdateDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('bulkAssignRole', () => {
    it('should bulk assign roles to users', async () => {
      const bulkRoleAssignmentDto: BulkRoleAssignmentDto = {
        userIds: ['user1', 'user2'],
        role: 'eor',
        scope: 'client',
        scopeId: 'client1',
      };

      const mockResponse = {
        processed: 2,
        failed: 0,
        results: [
          { userId: 'user1', success: true },
          { userId: 'user2', success: true },
        ],
      };

      mockUserService.bulkAssignRole.mockResolvedValue(mockResponse);

      const result = await controller.bulkAssignRole(bulkRoleAssignmentDto);

      expect(mockUserService.bulkAssignRole).toHaveBeenCalledWith(bulkRoleAssignmentDto);
      expect(result).toEqual(mockResponse);
    });
  });
});
