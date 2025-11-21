import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { SessionService, DeviceMetadata } from './session.service';
import { JwtTokenService } from './jwt.service';
import { Session } from '../entities/session.entity';
import { User } from '../entities/user.entity';

describe('SessionService', () => {
  let service: SessionService;
  let sessionRepository: jest.Mocked<Repository<Session>>;
  let jwtService: jest.Mocked<JwtTokenService>;

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
    emailVerified: true,
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

  const mockDeviceMetadata: DeviceMetadata = {
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 Test Browser',
    deviceFingerprint: 'device-123',
  };

  const mockSessionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    generateTokenFamily: jest.fn(),
    hashRefreshToken: jest.fn(),
    validateRefreshToken: jest.fn(),
    generateTokenPair: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepository,
        },
        {
          provide: JwtTokenService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    sessionRepository = module.get(getRepositoryToken(Session));
    jwtService = module.get(JwtTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create and save a new session', async () => {
      const refreshToken = 'refresh-token-123';
      const tokenFamily = 'family-uuid';
      const tokenHash = 'hashed-token';
      
      const mockSession = {
        id: 'session-id',
        userId: mockUser.id,
        refreshTokenHash: tokenHash,
        tokenFamily,
        deviceMetadata: mockDeviceMetadata,
        expiresAt: expect.any(Date),
      };

      mockJwtService.generateTokenFamily.mockReturnValue(tokenFamily);
      mockJwtService.hashRefreshToken.mockReturnValue(tokenHash);
      mockSessionRepository.create.mockReturnValue(mockSession as any);
      mockSessionRepository.save.mockResolvedValue(mockSession as any);

      const result = await service.createSession(mockUser, refreshToken, mockDeviceMetadata);

      expect(result).toEqual(mockSession);
      expect(mockJwtService.generateTokenFamily).toHaveBeenCalled();
      expect(mockJwtService.hashRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockSessionRepository.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        refreshTokenHash: tokenHash,
        tokenFamily,
        deviceMetadata: mockDeviceMetadata,
        expiresAt: expect.any(Date),
      });
      expect(mockSessionRepository.save).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('rotateRefreshToken', () => {
    it('should rotate refresh token successfully', async () => {
      const oldRefreshToken = 'old-refresh-token';
      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      
      const tokenPayload = {
        sub: mockUser.id,
        tokenFamily: 'family-uuid',
      };

      const existingSession = {
        id: 'session-id',
        userId: mockUser.id,
        tokenFamily: 'family-uuid',
        refreshTokenHash: 'old-hash',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        revokedAt: null,
      };

      const oldTokenHash = 'old-token-hash';
      const newTokenHash = 'new-token-hash';

      mockJwtService.validateRefreshToken.mockReturnValue(tokenPayload);
      mockJwtService.hashRefreshToken
        .mockReturnValueOnce(oldTokenHash)
        .mockReturnValueOnce(newTokenHash);
      mockJwtService.generateTokenPair.mockResolvedValue(newTokens);
      mockSessionRepository.findOne.mockResolvedValue(existingSession as any);
      mockSessionRepository.save.mockResolvedValue({
        ...existingSession,
        refreshTokenHash: newTokenHash,
      } as any);

      const result = await service.rotateRefreshToken(
        oldRefreshToken,
        mockUser,
        mockDeviceMetadata,
      );

      expect(result).toEqual({
        session: expect.objectContaining({
          refreshTokenHash: newTokenHash,
        }),
        newTokens,
      });

      expect(mockJwtService.validateRefreshToken).toHaveBeenCalledWith(oldRefreshToken);
      expect(mockJwtService.generateTokenPair).toHaveBeenCalledWith(mockUser, 'family-uuid');
      expect(mockSessionRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when session not found (token reuse)', async () => {
      const oldRefreshToken = 'old-refresh-token';
      const tokenPayload = {
        sub: mockUser.id,
        tokenFamily: 'family-uuid',
      };

      mockJwtService.validateRefreshToken.mockReturnValue(tokenPayload);
      mockJwtService.hashRefreshToken.mockReturnValue('token-hash');
      mockSessionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.rotateRefreshToken(oldRefreshToken, mockUser, mockDeviceMetadata),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockSessionRepository.update).toHaveBeenCalledWith(
        { tokenFamily: 'family-uuid', revokedAt: null },
        { revokedAt: expect.any(Date) },
      );
    });

    it('should throw UnauthorizedException when session is expired', async () => {
      const oldRefreshToken = 'old-refresh-token';
      const tokenPayload = {
        sub: mockUser.id,
        tokenFamily: 'family-uuid',
      };

      const expiredSession = {
        id: 'session-id',
        userId: mockUser.id,
        tokenFamily: 'family-uuid',
        refreshTokenHash: 'token-hash',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired
        revokedAt: null,
      };

      mockJwtService.validateRefreshToken.mockReturnValue(tokenPayload);
      mockJwtService.hashRefreshToken.mockReturnValue('token-hash');
      mockSessionRepository.findOne.mockResolvedValue(expiredSession as any);

      await expect(
        service.rotateRefreshToken(oldRefreshToken, mockUser, mockDeviceMetadata),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockSessionRepository.update).toHaveBeenCalledWith(
        'session-id',
        { revokedAt: expect.any(Date) },
      );
    });
  });

  describe('revokeSession', () => {
    it('should revoke session by ID', async () => {
      const sessionId = 'session-id';

      await service.revokeSession(sessionId);

      expect(mockSessionRepository.update).toHaveBeenCalledWith(sessionId, {
        revokedAt: expect.any(Date),
      });
    });
  });

  describe('revokeAllUserSessions', () => {
    it('should revoke all active sessions for user', async () => {
      const userId = 'user-id';

      await service.revokeAllUserSessions(userId);

      expect(mockSessionRepository.update).toHaveBeenCalledWith(
        { userId, revokedAt: null },
        { revokedAt: expect.any(Date) },
      );
    });
  });

  describe('revokeTokenFamily', () => {
    it('should revoke all sessions in token family', async () => {
      const tokenFamily = 'family-uuid';

      await service.revokeTokenFamily(tokenFamily);

      expect(mockSessionRepository.update).toHaveBeenCalledWith(
        { tokenFamily, revokedAt: null },
        { revokedAt: expect.any(Date) },
      );
    });
  });

  describe('revokeSessionByRefreshToken', () => {
    it('should revoke session by refresh token', async () => {
      const refreshToken = 'refresh-token';
      const tokenHash = 'token-hash';
      const session = { id: 'session-id' };

      mockJwtService.hashRefreshToken.mockReturnValue(tokenHash);
      mockSessionRepository.findOne.mockResolvedValue(session as any);

      await service.revokeSessionByRefreshToken(refreshToken);

      expect(mockJwtService.hashRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockSessionRepository.findOne).toHaveBeenCalledWith({
        where: { refreshTokenHash: tokenHash, revokedAt: null },
      });
      expect(mockSessionRepository.update).toHaveBeenCalledWith('session-id', {
        revokedAt: expect.any(Date),
      });
    });

    it('should handle case when session not found', async () => {
      const refreshToken = 'refresh-token';
      const tokenHash = 'token-hash';

      mockJwtService.hashRefreshToken.mockReturnValue(tokenHash);
      mockSessionRepository.findOne.mockResolvedValue(null);

      await service.revokeSessionByRefreshToken(refreshToken);

      expect(mockSessionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('should delete expired sessions', async () => {
      await service.cleanupExpiredSessions();

      expect(mockSessionRepository.delete).toHaveBeenCalledWith({
        expiresAt: expect.any(Date),
      });
    });
  });

  describe('getUserActiveSessions', () => {
    it('should return active sessions for user', async () => {
      const userId = 'user-id';
      const activeSessions = [
        { id: 'session-1', userId },
        { id: 'session-2', userId },
      ];

      mockSessionRepository.find.mockResolvedValue(activeSessions as any);

      const result = await service.getUserActiveSessions(userId);

      expect(result).toEqual(activeSessions);
      expect(mockSessionRepository.find).toHaveBeenCalledWith({
        where: {
          userId,
          revokedAt: null,
          expiresAt: expect.any(Date),
        },
        order: { createdAt: 'DESC' },
      });
    });
  });
});