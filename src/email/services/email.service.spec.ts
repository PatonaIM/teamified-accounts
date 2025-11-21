import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { Invitation, Country, UserRole, InvitationStatus } from '../../invitations/entities/invitation.entity';
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');
const mockNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('EmailService', () => {
  let service: EmailService;
  let configService: jest.Mocked<ConfigService>;

  const mockTransporter = {
    sendMail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        SMTP_HOST: 'smtp.test.com',
        SMTP_PORT: 587,
        SMTP_SECURE: false,
        SMTP_USER: 'test@example.com',
        SMTP_PASSWORD: 'password',
        SMTP_FROM: 'noreply@teamified.com',
        FRONTEND_URL: 'https://portal.teamified.com',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    mockNodemailer.createTransport.mockReturnValue(mockTransporter as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test text',
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await service.sendEmail(emailOptions);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@teamified.com',
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test text',
      });
    });

    it('should handle email sending failure', async () => {
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      const result = await service.sendEmail(emailOptions);

      expect(result).toBe(false);
    });
  });

  describe('sendInvitationEmail', () => {
    const mockInvitation: Invitation = {
      id: 'invitation-id',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      country: Country.IN,
      role: UserRole.EOR,
      clientId: 'client-id',
      token: 'invitation-token-123',
      expiresAt: new Date('2024-01-08'),
      status: InvitationStatus.PENDING,
      createdBy: 'admin-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      acceptedAt: null,
      acceptedBy: null,
      acceptor: null,
      deletedAt: null,
      client: null,
      creator: null,
    };

    it('should send invitation email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await service.sendInvitationEmail(mockInvitation);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john.doe@example.com',
          subject: 'Welcome to Teamified EOR Portal - Complete Your Registration',
          html: expect.stringContaining('John Doe'),
          text: expect.stringContaining('John Doe'),
        }),
      );

      // Check that the invitation link is properly formatted
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('https://portal.teamified.com/accept-invitation?token=invitation-token-123');
      expect(callArgs.text).toContain('https://portal.teamified.com/accept-invitation?token=invitation-token-123');
    });

    it('should include expiry date in email content', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await service.sendInvitationEmail(mockInvitation);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('1/8/2024'); // Formatted expiry date
      expect(callArgs.text).toContain('1/8/2024'); // Formatted expiry date
    });

    it('should include role information in email', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await service.sendInvitationEmail(mockInvitation);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('<strong>EOR</strong>');
      expect(callArgs.text).toContain('EOR');
    });

    it('should handle email sending failure for invitations', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      const result = await service.sendInvitationEmail(mockInvitation);

      expect(result).toBe(false);
    });
  });

  describe('configuration', () => {
    it('should use correct SMTP configuration', () => {
      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password',
        },
      });
    });

    it('should use configured frontend URL for invite links', async () => {
      const testInvitation: Invitation = {
        id: 'invitation-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        country: Country.IN,
        role: UserRole.EOR,
        clientId: 'client-id',
        token: 'test-token',
        expiresAt: new Date('2024-01-08'),
        status: InvitationStatus.PENDING,
        createdBy: 'admin-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        acceptedAt: null,
        acceptedBy: null,
        acceptor: null,
        deletedAt: null,
        client: null,
        creator: null,
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
      
      await service.sendInvitationEmail(testInvitation);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('https://portal.teamified.com/accept-invitation?token=test-token');
    });
  });
});