import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtTokenService } from './jwt.service';
import { User } from '../entities/user.entity';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

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

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<JwtTokenService>(JwtTokenService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload', () => {
      const expectedToken = 'access-token';
      configService.get.mockReturnValue('access-secret');
      jwtService.sign.mockReturnValue(expectedToken);

      const token = service.generateAccessToken(mockUser);

      expect(token).toBe(expectedToken);
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          roles: ['EOR'],
          jti: expect.any(String),
        }),
        {
          secret: 'access-secret',
          expiresIn: '15m',
        },
      );
      expect(configService.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with token family', () => {
      const expectedToken = 'refresh-token';
      const tokenFamily = 'family-uuid';
      configService.get.mockReturnValue('refresh-secret');
      jwtService.sign.mockReturnValue(expectedToken);

      const token = service.generateRefreshToken(mockUser, tokenFamily);

      expect(token).toBe(expectedToken);
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          tokenFamily,
          type: 'refresh',
          jti: expect.any(String),
        }),
        {
          secret: 'refresh-secret',
          expiresIn: '30d',
        },
      );
      expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', async () => {
      configService.get
        .mockReturnValueOnce('access-secret')
        .mockReturnValueOnce('refresh-secret');
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const tokens = await service.generateTokenPair(mockUser);

      expect(tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should use provided token family', async () => {
      const tokenFamily = 'existing-family';
      configService.get
        .mockReturnValueOnce('access-secret')
        .mockReturnValueOnce('refresh-secret');
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      await service.generateTokenPair(mockUser, tokenFamily);

      expect(jwtService.sign).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          tokenFamily,
        }),
        expect.any(Object),
      );
    });
  });

  describe('validateAccessToken', () => {
    it('should validate and return payload for valid token', () => {
      const token = 'valid-token';
      const expectedPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        roles: ['EOR'],
        iat: 1234567890,
        exp: 1234568890,
        jti: 'token-id',
      };
      
      configService.get.mockReturnValue('access-secret');
      jwtService.verify.mockReturnValue(expectedPayload);

      const result = service.validateAccessToken(token);

      expect(result).toEqual(expectedPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: 'access-secret',
      });
    });

    it('should throw UnauthorizedException for invalid token', () => {
      const token = 'invalid-token';
      configService.get.mockReturnValue('access-secret');
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.validateAccessToken(token)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate and return payload for valid refresh token', () => {
      const token = 'valid-refresh-token';
      const expectedPayload = {
        sub: mockUser.id,
        tokenFamily: 'family-uuid',
        type: 'refresh',
        iat: 1234567890,
        exp: 1234568890,
        jti: 'token-id',
      };
      
      configService.get.mockReturnValue('refresh-secret');
      jwtService.verify.mockReturnValue(expectedPayload);

      const result = service.validateRefreshToken(token);

      expect(result).toEqual(expectedPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: 'refresh-secret',
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', () => {
      const token = 'invalid-refresh-token';
      configService.get.mockReturnValue('refresh-secret');
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.validateRefreshToken(token)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid authorization header', () => {
      const authHeader = 'Bearer valid-token-123';
      const result = service.extractTokenFromHeader(authHeader);
      expect(result).toBe('valid-token-123');
    });

    it('should throw UnauthorizedException for missing authorization header', () => {
      expect(() => service.extractTokenFromHeader('')).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid authorization header format', () => {
      expect(() => service.extractTokenFromHeader('InvalidFormat token')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('generateTokenFamily', () => {
    it('should generate a UUID token family', () => {
      const family = service.generateTokenFamily();
      expect(family).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe('hashRefreshToken', () => {
    it('should hash refresh token using SHA256', () => {
      const token = 'refresh-token-123';
      const hash = service.hashRefreshToken(token);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA256 hex string length
    });

    it('should generate consistent hashes for same token', () => {
      const token = 'refresh-token-123';
      const hash1 = service.hashRefreshToken(token);
      const hash2 = service.hashRefreshToken(token);
      
      expect(hash1).toBe(hash2);
    });
  });
});