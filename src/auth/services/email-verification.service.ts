import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { AuditService } from '../../audit/audit.service';
import { EmailService } from '../../email/services/email.service';
import { VerifyEmailResponseDto, ProfileCompletionStatusDto } from '../dto/verify-email.dto';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
  ) {}

  async verifyEmail(
    token: string,
    ip: string,
    userAgent: string,
  ): Promise<VerifyEmailResponseDto> {
    this.logger.log(`Email verification attempt for token: ${token.substring(0, 8)}...`);

    // Find user by token
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      await this.auditService.log({
        action: 'email_verification_failed',
        entityType: 'User',
        entityId: null,
        actorUserId: null,
        actorRole: null,
        changes: { reason: 'Invalid token' },
        ip,
        userAgent,
      });
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Check if token is expired
    if (user.emailVerificationTokenExpiry && user.emailVerificationTokenExpiry < new Date()) {
      await this.auditService.log({
        action: 'email_verification_failed',
        entityType: 'User',
        entityId: user.id,
        actorUserId: user.id,
        actorRole: 'EOR',
        changes: { reason: 'Token expired' },
        ip,
        userAgent,
      });
      throw new BadRequestException('Verification token has expired');
    }

    // Check if email is already verified
    if (user.emailVerified) {
      await this.auditService.log({
        action: 'email_verification_attempted_already_verified',
        entityType: 'User',
        entityId: user.id,
        actorUserId: user.id,
        actorRole: 'EOR',
        changes: { email: user.email },
        ip,
        userAgent,
      });
      return {
        message: 'Email is already verified',
        verified: true,
      };
    }

    // Verify the email
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiry = null;
    await this.userRepository.save(user);

    // Log successful verification
    await this.auditService.logUserEmailVerified(
      user.id,
      'user',
      user.id,
      {
        email: user.email,
        verifiedAt: new Date().toISOString(),
      },
      ip,
      userAgent,
    );

    this.logger.log(`Email verification successful for user: ${user.email}`);

    return {
      message: 'Email verified successfully',
      verified: true,
    };
  }

  async sendVerificationReminder(userId: string): Promise<void> {
    this.logger.log(`Sending verification reminder for user: ${userId}`);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      this.logger.log(`User ${user.email} is already verified, skipping reminder`);
      return;
    }

    // Generate new verification token if needed
    if (!user.emailVerificationToken || 
        (user.emailVerificationTokenExpiry && user.emailVerificationTokenExpiry < new Date())) {
      user.emailVerificationToken = crypto.randomUUID();
      user.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await this.userRepository.save(user);
    }

    // Send reminder email
    await this.emailService.sendEmailVerificationReminder(
      user.email,
      user.firstName,
      user.emailVerificationToken,
    );

    // Log the reminder sent
    await this.auditService.log({
      action: 'email_verification_reminder_sent',
      entityType: 'User',
      entityId: user.id,
      actorUserId: null,
      actorRole: 'System',
      changes: { email: user.email, reminderType: 'verification' },
      ip: null,
      userAgent: 'System',
    });

    this.logger.log(`Verification reminder sent to: ${user.email}`);
  }

  async getProfileCompletionStatus(userId: string): Promise<ProfileCompletionStatusDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Define required fields for profile completion
    const requiredFields = [
      'firstName',
      'lastName', 
      'email',
      // Note: phone, address, country will be added in Epic 2 EORProfile entity
    ];

    const missingFields: string[] = [];
    
    // Check which required fields are missing
    if (!user.firstName?.trim()) missingFields.push('firstName');
    if (!user.lastName?.trim()) missingFields.push('lastName');
    if (!user.email?.trim()) missingFields.push('email');

    const completionPercentage = Math.round(
      ((requiredFields.length - missingFields.length) / requiredFields.length) * 100
    );

    const isComplete = missingFields.length === 0 && user.emailVerified;

    return {
      completionPercentage,
      requiredFields,
      missingFields,
      isComplete,
      emailVerified: user.emailVerified,
    };
  }

  async generateVerificationToken(user: User): Promise<void> {
    user.emailVerificationToken = crypto.randomUUID();
    user.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.userRepository.save(user);
  }
}