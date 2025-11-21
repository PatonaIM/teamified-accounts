import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './services/email-verification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

describe('Auth Controllers Integration', () => {
  let app: INestApplication;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
    acceptInvitation: jest.fn(),
  };

  const mockEmailVerificationService = {
    verifyEmail: jest.fn(),
    getProfileCompletionStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
    
    authService = module.get(AuthService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      const mockResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          emailVerified: true,
        },
      };

      authService.login.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('User-Agent', 'Test-Agent')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        expect.any(String),
        'Test-Agent',
      );
    });

    it('should return 400 for invalid email format', async () => {
      const loginDto = {
        email: 'invalid-email',
        password: 'ValidPassword123!',
      };

      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(400);

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should return 400 for missing password', async () => {
      const loginDto = {
        email: 'test@example.com',
      };

      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(400);

      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authService.refresh.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/refresh')
        .set('User-Agent', 'Test-Agent')
        .send(refreshTokenDto)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(authService.refresh).toHaveBeenCalledWith(
        'valid-refresh-token',
        expect.any(String),
        'Test-Agent',
      );
    });

    it('should return 400 for missing refresh token', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/refresh')
        .send({})
        .expect(400);

      expect(authService.refresh).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const mockResponse = {
        message: 'Logout successful',
      };

      authService.logout.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .set('User-Agent', 'Test-Agent')
        .send(refreshTokenDto)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(authService.logout).toHaveBeenCalledWith(
        'valid-refresh-token',
        expect.any(String),
        'Test-Agent',
      );
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        emailVerified: true,
        roles: ['admin'],
      };

      // Mock the request user context
      const module = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: mockAuthService,
          },
          {
            provide: EmailVerificationService,
            useValue: mockEmailVerificationService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({
          canActivate: (context) => {
            const request = context.switchToHttp().getRequest();
            request.user = { sub: 'user-id' };
            return true;
          },
        })
        .compile();

      const testApp = module.createNestApplication();
      testApp.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
      await testApp.init();

      // Add the missing providers to this test module too
      const testModule: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: mockAuthService,
          },
          {
            provide: EmailVerificationService,
            useValue: mockEmailVerificationService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({
          canActivate: (context) => {
            const request = context.switchToHttp().getRequest();
            request.user = { sub: 'user-id' };
            return true;
          },
        })
        .compile();

      authService.getProfile.mockResolvedValue(mockUser);

      const response = await request(testApp.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(authService.getProfile).toHaveBeenCalledWith('user-id');

      await testApp.close();
    });
  });
});