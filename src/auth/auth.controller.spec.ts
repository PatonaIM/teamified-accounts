import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './services/email-verification.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
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
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('acceptInvitation', () => {
    const acceptInvitationDto: AcceptInvitationDto = {
      token: 'valid-invitation-token',
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
    };

    const mockRequest = {
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
    };

    it('should accept invitation successfully', async () => {
      const mockResponse = {
        userId: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        emailVerified: false,
        message: 'Account activated successfully. Please check your email to verify your email address.',
      };

      authService.acceptInvitation.mockResolvedValue(mockResponse);

      const result = await controller.acceptInvitation(acceptInvitationDto, mockRequest);

      expect(result).toEqual(mockResponse);
      expect(authService.acceptInvitation).toHaveBeenCalledWith(
        acceptInvitationDto,
        '127.0.0.1',
        'Mozilla/5.0',
      );
    });

    it('should pass request metadata to service', async () => {
      const customRequest = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Custom User Agent'),
      };

      authService.acceptInvitation.mockResolvedValue({} as any);

      await controller.acceptInvitation(acceptInvitationDto, customRequest);

      expect(authService.acceptInvitation).toHaveBeenCalledWith(
        acceptInvitationDto,
        '192.168.1.1',
        'Custom User Agent',
      );
    });
  });
});