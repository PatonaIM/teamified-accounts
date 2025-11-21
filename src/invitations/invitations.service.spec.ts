import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { Invitation, InvitationStatus, Country, UserRole } from './entities/invitation.entity';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/services/email.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

describe('InvitationsService', () => {
  let service: InvitationsService;
  let invitationRepository: jest.Mocked<Repository<Invitation>>;
  let auditService: jest.Mocked<AuditService>;
  let emailService: jest.Mocked<EmailService>;

  const mockInvitationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAuditService = {
    logInviteCreated: jest.fn(),
    logInviteResent: jest.fn(),
  };

  const mockEmailService = {
    sendInvitationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        {
          provide: getRepositoryToken(Invitation),
          useValue: mockInvitationRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    invitationRepository = module.get(getRepositoryToken(Invitation));
    auditService = module.get(AuditService);
    emailService = module.get(EmailService);
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

    const createdBy = 'admin-user-id';
    const actorRole = 'Admin';

    it('should create invitation successfully', async () => {
      const mockInvitation = {
        id: 'invitation-id',
        ...createInvitationDto,
        token: 'mock-token',
        status: InvitationStatus.PENDING,
        createdBy,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      invitationRepository.findOne.mockResolvedValue(null); // No existing invitation
      invitationRepository.create.mockReturnValue(mockInvitation as any);
      invitationRepository.save.mockResolvedValue(mockInvitation as any);
      emailService.sendInvitationEmail.mockResolvedValue(true);
      auditService.logInviteCreated.mockResolvedValue({} as any);

      const result = await service.create(createInvitationDto, createdBy, actorRole);

      expect(result).toEqual({
        id: mockInvitation.id,
        firstName: mockInvitation.firstName,
        lastName: mockInvitation.lastName,
        email: mockInvitation.email,
        country: mockInvitation.country,
        role: mockInvitation.role,
        clientId: mockInvitation.clientId,
        status: mockInvitation.status,
        expiresAt: mockInvitation.expiresAt,
        createdAt: mockInvitation.createdAt,
        createdBy: mockInvitation.createdBy,
      });

      expect(invitationRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: createInvitationDto.email,
          clientId: createInvitationDto.clientId,
          status: InvitationStatus.PENDING,
          expiresAt: expect.any(Object), // MoreThan matcher
        },
      });
      expect(emailService.sendInvitationEmail).toHaveBeenCalledWith(mockInvitation);
      expect(auditService.logInviteCreated).toHaveBeenCalledWith(
        createdBy,
        actorRole,
        mockInvitation.id,
        expect.any(Object),
        undefined,
        undefined,
      );
    });

    it('should throw ConflictException if active invitation exists', async () => {
      const existingInvitation = { id: 'existing-id' };
      invitationRepository.findOne.mockResolvedValue(existingInvitation as any);

      await expect(
        service.create(createInvitationDto, createdBy, actorRole),
      ).rejects.toThrow(ConflictException);

      expect(invitationRepository.create).not.toHaveBeenCalled();
      expect(emailService.sendInvitationEmail).not.toHaveBeenCalled();
    });

    it('should handle email sending failure gracefully', async () => {
      const mockInvitation = {
        id: 'invitation-id',
        ...createInvitationDto,
        token: 'mock-token',
        status: InvitationStatus.PENDING,
        createdBy,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      invitationRepository.findOne.mockResolvedValue(null);
      invitationRepository.create.mockReturnValue(mockInvitation as any);
      invitationRepository.save.mockResolvedValue(mockInvitation as any);
      emailService.sendInvitationEmail.mockResolvedValue(false); // Email fails
      auditService.logInviteCreated.mockResolvedValue({} as any);

      const result = await service.create(createInvitationDto, createdBy, actorRole);

      expect(result).toBeDefined();
      expect(auditService.logInviteCreated).toHaveBeenCalled();
    });
  });

  describe('resend', () => {
    const invitationId = 'invitation-id';
    const actorUserId = 'admin-user-id';
    const actorRole = 'Admin';

    it('should resend invitation successfully', async () => {
      const mockInvitation = {
        id: invitationId,
        email: 'john.doe@example.com',
        status: InvitationStatus.PENDING,
        token: 'old-token',
        expiresAt: new Date(),
      };

      invitationRepository.findOne.mockResolvedValue(mockInvitation as any);
      invitationRepository.save.mockResolvedValue({
        ...mockInvitation,
        token: 'new-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      } as any);
      emailService.sendInvitationEmail.mockResolvedValue(true);
      auditService.logInviteResent.mockResolvedValue({} as any);

      const result = await service.resend(invitationId, actorUserId, actorRole);

      expect(result).toBeDefined();
      expect(mockInvitation.token).not.toBe('old-token'); // Token should be regenerated
      expect(emailService.sendInvitationEmail).toHaveBeenCalled();
      expect(auditService.logInviteResent).toHaveBeenCalled();
    });

    it('should throw NotFoundException if invitation not found', async () => {
      invitationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.resend(invitationId, actorUserId, actorRole),
      ).rejects.toThrow(NotFoundException);

      expect(emailService.sendInvitationEmail).not.toHaveBeenCalled();
      expect(auditService.logInviteResent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if invitation is not pending', async () => {
      const mockInvitation = {
        id: invitationId,
        status: InvitationStatus.ACCEPTED,
      };

      invitationRepository.findOne.mockResolvedValue(mockInvitation as any);

      await expect(
        service.resend(invitationId, actorUserId, actorRole),
      ).rejects.toThrow(BadRequestException);

      expect(emailService.sendInvitationEmail).not.toHaveBeenCalled();
      expect(auditService.logInviteResent).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted invitations', async () => {
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
          createdAt: new Date(),
          expiresAt: new Date(),
          createdBy: 'admin',
        },
      ];

      invitationRepository.find.mockResolvedValue(mockInvitations as any);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('invite-1');
      expect(invitationRepository.find).toHaveBeenCalledWith({
        where: { deletedAt: null },
        order: { createdAt: 'DESC' },
      });
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
        createdAt: new Date(),
        expiresAt: new Date(),
        createdBy: 'admin',
      };

      invitationRepository.findOne.mockResolvedValue(mockInvitation as any);

      const result = await service.findOne('invitation-id');

      expect(result.id).toBe('invitation-id');
      expect(invitationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invitation-id', deletedAt: null },
      });
    });

    it('should throw NotFoundException if invitation not found', async () => {
      invitationRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete invitation', async () => {
      const mockInvitation = {
        id: 'invitation-id',
        status: InvitationStatus.PENDING,
        deletedAt: null,
      };

      invitationRepository.findOne.mockResolvedValue(mockInvitation as any);
      invitationRepository.save.mockResolvedValue({
        ...mockInvitation,
        deletedAt: new Date(),
      } as any);

      await service.remove('invitation-id');

      expect(mockInvitation.deletedAt).toBeInstanceOf(Date);
      expect(invitationRepository.save).toHaveBeenCalledWith(mockInvitation);
    });

    it('should throw BadRequestException for accepted invitations', async () => {
      const mockInvitation = {
        id: 'invitation-id',
        status: InvitationStatus.ACCEPTED,
        deletedAt: null,
      };

      invitationRepository.findOne.mockResolvedValue(mockInvitation as any);

      await expect(service.remove('invitation-id')).rejects.toThrow(
        BadRequestException,
      );

      expect(invitationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('cleanupExpiredInvitations', () => {
    it('should clean up expired invitations', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      };

      invitationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.cleanupExpiredInvitations();

      expect(result).toBe(5);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Invitation);
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });
});