import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Country, UserRole, InvitationStatus } from './entities/invitation.entity';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

describe('InvitationsController', () => {
  let controller: InvitationsController;
  let service: jest.Mocked<InvitationsService>;

  const mockInvitationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    resend: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationsController],
      providers: [
        {
          provide: InvitationsService,
          useValue: mockInvitationsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<InvitationsController>(InvitationsController);
    service = module.get(InvitationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createInvitationDto: CreateInvitationDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      country: Country.IN,
      role: UserRole.EOR,
      clientId: '123e4567-e89b-12d3-a456-426614174000',
    };

    const currentUser: CurrentUserData = {
      id: 'admin-user-id',
      email: 'admin@example.com',
      role: 'Admin',
      firstName: 'Admin',
      lastName: 'User',
    };

    const mockRequest = {
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
    };

    it('should create invitation successfully', async () => {
      const mockResponse = {
        id: 'invitation-id',
        ...createInvitationDto,
        status: InvitationStatus.PENDING,
        expiresAt: new Date(),
        createdAt: new Date(),
        createdBy: currentUser.id,
      };

      service.create.mockResolvedValue(mockResponse);

      const result = await controller.create(
        createInvitationDto,
        currentUser,
        'idempotency-key-123',
        mockRequest,
      );

      expect(result).toEqual(mockResponse);
      expect(service.create).toHaveBeenCalledWith(
        createInvitationDto,
        currentUser.id,
        currentUser.role,
        '127.0.0.1',
        'Mozilla/5.0',
        'idempotency-key-123',
      );
    });
  });

  describe('findAll', () => {
    it('should return all invitations', async () => {
      const mockInvitations = [
        {
          id: 'invite-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          country: Country.IN,
          role: UserRole.EOR,
          clientId: 'client-1',
          status: InvitationStatus.PENDING,
          expiresAt: new Date(),
          createdAt: new Date(),
          createdBy: 'admin',
        },
      ];

      service.findAll.mockResolvedValue(mockInvitations);

      const result = await controller.findAll();

      expect(result).toEqual(mockInvitations);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return invitation by id', async () => {
      const mockInvitation = {
        id: 'invitation-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        country: Country.IN,
        role: UserRole.EOR,
        clientId: 'client-1',
        status: InvitationStatus.PENDING,
        expiresAt: new Date(),
        createdAt: new Date(),
        createdBy: 'admin',
      };

      service.findOne.mockResolvedValue(mockInvitation);

      const result = await controller.findOne('invitation-id');

      expect(result).toEqual(mockInvitation);
      expect(service.findOne).toHaveBeenCalledWith('invitation-id');
    });
  });

  describe('resend', () => {
    const currentUser: CurrentUserData = {
      id: 'admin-user-id',
      email: 'admin@example.com',
      role: 'Admin',
      firstName: 'Admin',
      lastName: 'User',
    };

    const mockRequest = {
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
    };

    it('should resend invitation successfully', async () => {
      const mockResponse = {
        id: 'invitation-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        country: Country.IN,
        role: UserRole.EOR,
        clientId: 'client-1',
        status: InvitationStatus.PENDING,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
        createdBy: 'admin',
      };

      service.resend.mockResolvedValue(mockResponse);

      const result = await controller.resend('invitation-id', currentUser, mockRequest);

      expect(result).toEqual(mockResponse);
      expect(service.resend).toHaveBeenCalledWith(
        'invitation-id',
        currentUser.id,
        currentUser.role,
        '127.0.0.1',
        'Mozilla/5.0',
      );
    });
  });

  describe('remove', () => {
    it('should remove invitation successfully', async () => {
      service.remove.mockResolvedValue();

      const result = await controller.remove('invitation-id');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('invitation-id');
    });
  });
});