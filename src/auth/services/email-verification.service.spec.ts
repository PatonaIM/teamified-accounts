import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { User } from '../entities/user.entity';
import { AuditService } from '../../audit/audit.service';
import { EmailService } from '../../email/services/email.service';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let userRepository: jest.Mocked<Repository<User>>;
  let auditService: jest.Mocked<AuditService>;
  let emailService: jest.Mocked<EmailService>;

  const mockUser: User = {
    id: 'user-id-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    passwordHash: 'hashed-password',
    phone: null,
    address: null,
    profileData: null,
    clientId: null,
    status: 'active',
    isActive: true,
    emailVerified: false,
    emailVerificationToken: 'verification-token-123',
    emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    passwordResetToken: null,
    passwordResetTokenExpiry: null,
    migratedFromZoho: false,
    zohoUserId: null,
    supabaseUserId: null,
    lastLoginAt: null,
    themePreference: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    eorProfile: undefined,
    employmentRecords: [],
    userRoles: [],
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockEmailService = {
    sendEmailVerificationReminder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
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

    service = module.get<EmailVerificationService>(EmailVerificationService);
    userRepository = module.get(getRepositoryToken(User));
    auditService = module.get(AuditService);
    emailService = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyEmail', () => {
    const ip = '127.0.0.1';
    const userAgent = 'Test-Agent';

    it('should verify email successfully for valid token', async () => {
      const token = 'valid-token-123';
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue({ ...mockUser, emailVerified: true });

      const result = await service.verifyEmail(token, ip, userAgent);

      expect(result).toEqual({
        message: 'Email verified successfully',
        verified: true,
      });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { emailVerificationToken: token },
      });

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationTokenExpiry: null,
        }),
      );

      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: 'email_verification_success',
        entityType: 'User',
        entityId: mockUser.id,
        actorUserId: mockUser.id,
        actorRole: 'EOR',
        changes: { email: mockUser.email, verified: true },
        ip,
        userAgent,
      });
    });

    it('should throw BadRequestException for invalid token', async () => {
      const token = 'invalid-token';
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyEmail(token, ip, userAgent)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: 'email_verification_failed',
        entityType: 'User',
        entityId: null,
        actorUserId: null,
        actorRole: null,
        changes: { reason: 'Invalid token' },
        ip,
        userAgent,
      });
    });

    it('should throw BadRequestException for expired token', async () => {
      const token = 'expired-token';
      const expiredUser = {
        ...mockUser,
        emailVerificationTokenExpiry: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      };
      mockUserRepository.findOne.mockResolvedValue(expiredUser);

      await expect(service.verifyEmail(token, ip, userAgent)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: 'email_verification_failed',
        entityType: 'User',
        entityId: mockUser.id,
        actorUserId: mockUser.id,
        actorRole: 'EOR',
        changes: { reason: 'Token expired' },
        ip,
        userAgent,
      });
    });

    it('should return success message if email is already verified', async () => {
      const token = 'valid-token';
      const verifiedUser = { ...mockUser, emailVerified: true };
      mockUserRepository.findOne.mockResolvedValue(verifiedUser);

      const result = await service.verifyEmail(token, ip, userAgent);

      expect(result).toEqual({
        message: 'Email is already verified',
        verified: true,
      });

      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: 'email_verification_attempted_already_verified',
        entityType: 'User',
        entityId: mockUser.id,
        actorUserId: mockUser.id,
        actorRole: 'EOR',
        changes: { email: mockUser.email },
        ip,
        userAgent,
      });
    });
  });

  describe('sendVerificationReminder', () => {
    it('should send verification reminder successfully', async () => {
      const userId = 'user-id-123';
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockEmailService.sendEmailVerificationReminder.mockResolvedValue(true);

      await service.sendVerificationReminder(userId);

      expect(mockEmailService.sendEmailVerificationReminder).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        mockUser.emailVerificationToken,
      );

      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: 'email_verification_reminder_sent',
        entityType: 'User',
        entityId: userId,
        actorUserId: null,
        actorRole: 'System',
        changes: { email: mockUser.email, reminderType: 'verification' },
        ip: null,
        userAgent: 'System',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'non-existent-user';
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.sendVerificationReminder(userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should skip reminder if user is already verified', async () => {
      const userId = 'user-id-123';
      const verifiedUser = { ...mockUser, emailVerified: true };
      mockUserRepository.findOne.mockResolvedValue(verifiedUser);

      await service.sendVerificationReminder(userId);

      expect(mockEmailService.sendEmailVerificationReminder).not.toHaveBeenCalled();
      expect(mockAuditService.log).not.toHaveBeenCalled();
    });

    it('should generate new token if token is expired', async () => {
      const userId = 'user-id-123';
      const userWithExpiredToken = {
        ...mockUser,
        emailVerificationTokenExpiry: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      };
      mockUserRepository.findOne.mockResolvedValue(userWithExpiredToken);
      mockUserRepository.save.mockResolvedValue({ ...userWithExpiredToken });
      mockEmailService.sendEmailVerificationReminder.mockResolvedValue(true);

      await service.sendVerificationReminder(userId);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          emailVerificationToken: expect.any(String),
          emailVerificationTokenExpiry: expect.any(Date),
        }),
      );
    });
  });

  describe('getProfileCompletionStatus', () => {
    it('should calculate completion status correctly for complete profile', async () => {
      const userId = 'user-id-123';
      const completeUser = { ...mockUser, emailVerified: true };
      mockUserRepository.findOne.mockResolvedValue(completeUser);

      const result = await service.getProfileCompletionStatus(userId);

      expect(result).toEqual({
        completionPercentage: 100,
        requiredFields: ['firstName', 'lastName', 'email'],
        missingFields: [],
        isComplete: true,
        emailVerified: true,
      });
    });

    it('should calculate completion status correctly for incomplete profile', async () => {
      const userId = 'user-id-123';
      const incompleteUser = { 
        ...mockUser, 
        firstName: '', 
        emailVerified: false 
      };
      mockUserRepository.findOne.mockResolvedValue(incompleteUser);

      const result = await service.getProfileCompletionStatus(userId);

      expect(result).toEqual({
        completionPercentage: 67, // 2/3 fields complete
        requiredFields: ['firstName', 'lastName', 'email'],
        missingFields: ['firstName'],
        isComplete: false,
        emailVerified: false,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'non-existent-user';
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfileCompletionStatus(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('generateVerificationToken', () => {
    it('should generate new verification token with 24 hour expiry', async () => {
      const user = { ...mockUser };
      mockUserRepository.save.mockResolvedValue(user);

      await service.generateVerificationToken(user);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          emailVerificationToken: expect.any(String),
          emailVerificationTokenExpiry: expect.any(Date),
        }),
      );
    });
  });
});