import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { AuditService } from '../../audit/audit.service';
import { EmailService } from '../../email/services/email.service';
import { VerifyEmailResponseDto, ProfileCompletionStatusDto, ResendVerificationResponseDto } from '../dto/verify-email.dto';

// In-memory rate limiting store (for production, use Redis)
interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  
  // Rate limiting: 3 resend attempts per email per hour
  private readonly RATE_LIMIT_MAX = 3;
  private readonly RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
  private rateLimitStore: Map<string, RateLimitEntry> = new Map();

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
      // Return friendly response instead of throwing exception
      return {
        message: 'This verification link is invalid or has expired. Please request a new verification email.',
        verified: false,
        tokenStatus: 'invalid',
      };
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
      // Return friendly response with email for resend flow
      return {
        message: 'This verification link has expired. Please request a new verification email.',
        verified: false,
        tokenStatus: 'expired',
        email: user.email,
      };
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
        tokenStatus: 'already_verified',
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

    // Send welcome email after successful verification
    await this.sendWelcomeEmail(user.id);

    return {
      message: 'Email verified successfully',
      verified: true,
    };
  }

  /**
   * OWASP-compliant resend verification email
   * - Always returns the same success message regardless of account state
   * - Rate limited to 3 per email per hour
   * - Invalidates previous verification tokens when generating new ones
   */
  async resendVerificationEmail(
    email: string,
    ip: string,
    userAgent: string,
  ): Promise<ResendVerificationResponseDto> {
    const normalizedEmail = email.toLowerCase().trim();
    this.logger.log(`Resend verification request for: ${normalizedEmail.substring(0, 3)}***`);

    // OWASP-compliant response - always the same regardless of outcome
    const owaspResponse: ResendVerificationResponseDto = {
      message: 'Thank you. If this email is registered and unverified, you will receive a verification email shortly.',
      success: true,
    };

    // Check rate limit
    if (this.isRateLimited(normalizedEmail)) {
      this.logger.warn(`Rate limit exceeded for resend verification: ${normalizedEmail.substring(0, 3)}***`);
      await this.auditService.log({
        action: 'resend_verification_rate_limited',
        entityType: 'User',
        entityId: null,
        actorUserId: null,
        actorRole: null,
        changes: { email: normalizedEmail, reason: 'rate_limit_exceeded' },
        ip,
        userAgent,
      });
      // Still return success message for OWASP compliance (no enumeration)
      return owaspResponse;
    }

    // Record this attempt for rate limiting
    this.recordRateLimitAttempt(normalizedEmail);

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // User doesn't exist - log but return success for OWASP compliance
      await this.auditService.log({
        action: 'resend_verification_user_not_found',
        entityType: 'User',
        entityId: null,
        actorUserId: null,
        actorRole: null,
        changes: { email: normalizedEmail },
        ip,
        userAgent,
      });
      return owaspResponse;
    }

    // Check if already verified
    if (user.emailVerified) {
      await this.auditService.log({
        action: 'resend_verification_already_verified',
        entityType: 'User',
        entityId: user.id,
        actorUserId: user.id,
        actorRole: 'EOR',
        changes: { email: normalizedEmail },
        ip,
        userAgent,
      });
      return owaspResponse;
    }

    // Invalidate previous token and generate new one
    // This ensures Link A becomes expired once Link B is issued
    user.emailVerificationToken = crypto.randomUUID();
    user.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.userRepository.save(user);

    this.logger.log(`New verification token generated for: ${normalizedEmail.substring(0, 3)}***`);

    // Send verification email using the reminder template (it's the same email)
    try {
      await this.emailService.sendEmailVerificationReminder(
        user.email,
        user.firstName,
        user.emailVerificationToken,
      );

      await this.auditService.log({
        action: 'resend_verification_sent',
        entityType: 'User',
        entityId: user.id,
        actorUserId: user.id,
        actorRole: 'EOR',
        changes: { email: normalizedEmail },
        ip,
        userAgent,
      });

      this.logger.log(`Verification email resent to: ${normalizedEmail.substring(0, 3)}***`);
    } catch (error) {
      this.logger.error(`Failed to resend verification email: ${error.message}`);
      // Still return success for OWASP compliance
    }

    return owaspResponse;
  }

  /**
   * Check if email has exceeded rate limit (3 per hour)
   */
  private isRateLimited(email: string): boolean {
    const entry = this.rateLimitStore.get(email);
    if (!entry) return false;
    
    // Check if window has expired
    if (new Date() > entry.resetAt) {
      this.rateLimitStore.delete(email);
      return false;
    }
    
    return entry.count >= this.RATE_LIMIT_MAX;
  }

  /**
   * Record rate limit attempt
   */
  private recordRateLimitAttempt(email: string): void {
    const entry = this.rateLimitStore.get(email);
    const now = new Date();
    
    if (!entry || now > entry.resetAt) {
      // Start new window
      this.rateLimitStore.set(email, {
        count: 1,
        resetAt: new Date(now.getTime() + this.RATE_LIMIT_WINDOW_MS),
      });
    } else {
      // Increment count
      entry.count++;
    }
  }

  private async sendWelcomeEmail(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['userRoles'],
      });

      if (!user) {
        this.logger.warn(`User not found for welcome email: ${userId}`);
        return;
      }

      const roleType = user.userRoles?.[0]?.roleType || 'candidate';
      const subject = 'Welcome to Teamified!';
      
      let htmlContent: string;
      let textContent: string;
      const displayName = user.firstName || 'there';

      if (roleType === 'candidate') {
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Teamified</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9333EA 0%, #7C3AED 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; background-color: #f8f9fa; }
        .cta-button { 
            display: inline-block; 
            background-color: #9333EA;
            color: white; 
            padding: 14px 36px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Teamified!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.95;">Your account is ready</p>
        </div>
        <div class="content">
            <h2 style="margin-top: 0; color: #9333EA;">Welcome to Teamified, ${displayName}!</h2>
            
            <p style="font-size: 16px;">Your email has been verified. Your candidate account is now ready!</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://jobseeker.teamified.com.au" class="cta-button" style="color: white !important; text-decoration: none;">Browse Jobs</a>
            </div>
            
            <p style="color: #666;">With Teamified, you can:</p>
            <ul style="color: #666; padding-left: 20px; line-height: 1.8;">
                <li>Browse and apply for exciting job opportunities</li>
                <li>Track your application status</li>
                <li>Build your professional profile</li>
            </ul>
        </div>
        <div class="footer">
            <p style="margin: 5px 0;">If you didn't create this account, please contact our support team.</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
        textContent = `Welcome to Teamified, ${displayName}!\n\nYour email has been verified. Your candidate account is now ready!\n\nBrowse Jobs: https://jobseeker.teamified.com.au\n\nWith Teamified, you can:\n- Browse and apply for exciting job opportunities\n- Track your application status\n- Build your professional profile\n\n© ${new Date().getFullYear()} Teamified. All rights reserved.`;
      } else {
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Teamified</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9333EA 0%, #7C3AED 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; background-color: #f8f9fa; }
        .cta-button { 
            display: inline-block; 
            background-color: #9333EA;
            color: white; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 10px 5px;
            font-weight: 600;
            font-size: 16px;
        }
        .cta-button-outline { 
            display: inline-block; 
            background-color: white;
            color: #9333EA; 
            padding: 12px 26px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 10px 5px;
            font-weight: 600;
            font-size: 16px;
            border: 2px solid #9333EA;
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Teamified!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.95;">Your employer account is ready</p>
        </div>
        <div class="content">
            <h2 style="margin-top: 0; color: #9333EA;">Welcome to Teamified, ${displayName}!</h2>
            
            <p style="font-size: 16px;">Your email has been verified. Your employer account is now ready!</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://ats.teamified.com.au" class="cta-button" style="color: white !important; text-decoration: none;">Post Your First Job</a>
                <a href="https://hris.teamified.com.au" class="cta-button-outline" style="color: #9333EA !important; text-decoration: none;">Set Up Your Organization</a>
            </div>
            
            <p style="color: #666;">With Teamified, you can:</p>
            <ul style="color: #666; padding-left: 20px; line-height: 1.8;">
                <li>Post job openings and attract top talent</li>
                <li>Manage your hiring pipeline</li>
                <li>Onboard and manage your team members</li>
            </ul>
        </div>
        <div class="footer">
            <p style="margin: 5px 0;">If you didn't create this account, please contact our support team.</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
        textContent = `Welcome to Teamified, ${displayName}!\n\nYour email has been verified. Your employer account is now ready!\n\nPost Your First Job: https://ats.teamified.com.au\nSet Up Your Organization: https://hris.teamified.com.au\n\nWith Teamified, you can:\n- Post job openings and attract top talent\n- Manage your hiring pipeline\n- Onboard and manage your team members\n\n© ${new Date().getFullYear()} Teamified. All rights reserved.`;
      }

      await this.emailService.sendEmail({
        to: user.email,
        subject,
        html: htmlContent,
        text: textContent,
      });

      this.logger.log(`Welcome email sent to ${user.email} after email verification (${roleType})`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to user ${userId}:`, error);
    }
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