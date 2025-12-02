import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { LegacyInvitation, InvitationStatus } from '../invitations/entities/legacy-invitation.entity';
import { AcceptInvitationDto, AcceptInvitationResponseDto } from './dto/accept-invitation.dto';
import { LoginDto, LoginResponseDto, RefreshTokenResponseDto, LogoutResponseDto, UserProfileDto } from './dto/login.dto';
import { ClientAdminSignupDto, ClientAdminSignupResponseDto } from './dto/client-admin-signup.dto';
import { CandidateSignupDto, CandidateSignupResponseDto } from './dto/candidate-signup.dto';
import { PasswordService } from './services/password.service';
import { JwtTokenService } from './services/jwt.service';
import { SessionService, DeviceMetadata } from './services/session.service';
import { EmailService } from '../email/services/email.service';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { OrganizationMember } from '../organizations/entities/organization-member.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(LegacyInvitation)
    private invitationRepository: Repository<LegacyInvitation>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private organizationMemberRepository: Repository<OrganizationMember>,
    private passwordService: PasswordService,
    private jwtService: JwtTokenService,
    private sessionService: SessionService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  private async getUserPrimaryRole(userId: string): Promise<string> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId },
      order: { createdAt: 'ASC' }, // Get the first role assigned
    });
    return userRole?.roleType || 'User';
  }

  /**
   * Legacy Invitation Acceptance (Pre-Multitenancy)
   * 
   * TODO: CLEANUP AFTER PHASE 3 - This method uses the old invitation system
   * Once Phase 3 is complete and all invitations are migrated to the new multitenancy
   * system, this method should be removed and replaced with organization-based acceptance.
   * 
   * See: docs/Multitenancy_Features_PRD.md - Section on Legacy Invitation Cleanup
   */
  async acceptInvitation(
    acceptInvitationDto: AcceptInvitationDto,
    baseUrl: string,
    ip?: string,
    userAgent?: string,
  ): Promise<AcceptInvitationResponseDto> {
    const { token, password, confirmPassword } = acceptInvitationDto;

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Validate password policy
    const passwordValidation = this.passwordService.validatePasswordPolicy(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    // Find and validate invitation
    const invitation = await this.invitationRepository.findOne({
      where: {
        token,
        status: InvitationStatus.PENDING,
        deletedAt: null as any,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid or expired invitation token');
    }

    // Check if expired
    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // Check if invitation was already accepted
    if (invitation.acceptedAt) {
      throw new ConflictException('Invitation has already been accepted');
    }

    // Check if user already exists with this email
    let user = await this.userRepository.findOne({
      where: { email: invitation.email },
    });

    if (user && user.isActive) {
      throw new ConflictException('User account already exists and is active');
    }

    // Hash the password
    const hashedPassword = await this.passwordService.hashPassword(password);

    // Create or update user
    if (!user) {
      user = this.userRepository.create({
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        passwordHash: hashedPassword,
        isActive: true,
        emailVerified: false,
        emailVerificationToken: uuidv4(),
        emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
    } else {
      user.passwordHash = hashedPassword;
      user.isActive = true;
      user.emailVerified = false;
      user.emailVerificationToken = uuidv4();
      user.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    const savedUser = await this.userRepository.save(user);

    // Update invitation status
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = savedUser.id;

    await this.invitationRepository.save(invitation);

    // Send email verification
    try {
      await this.sendEmailVerification(savedUser, baseUrl);
    } catch (error) {
      this.logger.warn(`Failed to send email verification to ${savedUser.email}: ${error.message}`);
      // Don't fail the process if email sending fails
    }

    // Create audit logs
    await Promise.all([
      this.auditService.logInvitationAccepted(
        savedUser.id,
        invitation.role,
        invitation.id,
        {
          invitationId: invitation.id,
          email: invitation.email,
          acceptedAt: invitation.acceptedAt.toISOString(),
        },
        ip,
        userAgent,
      ),
      this.auditService.log({
        actorUserId: savedUser.id,
        actorRole: invitation.role,
        action: 'password_set',
        entityType: 'User',
        entityId: savedUser.id,
        changes: {
          passwordChanged: true,
        },
        ip,
        userAgent,
      }),
      this.auditService.log({
        actorUserId: savedUser.id,
        actorRole: invitation.role,
        action: 'account_activated',
        entityType: 'User',
        entityId: savedUser.id,
        changes: {
          isActive: true,
          activatedAt: new Date().toISOString(),
        },
        ip,
        userAgent,
      }),
    ]);

    return {
      userId: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      isActive: savedUser.isActive,
      emailVerified: savedUser.emailVerified,
      message: 'Account activated successfully. Please check your email to verify your email address.',
    };
  }

  private async sendEmailVerification(user: User, baseUrl: string): Promise<void> {
    const verificationLink = this.generateEmailVerificationLink(user.emailVerificationToken, baseUrl);
    
    const htmlTemplate = this.generateEmailVerificationHtmlTemplate(user, verificationLink);
    const textTemplate = this.generateEmailVerificationTextTemplate(user, verificationLink);

    const emailSent = await this.emailService.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Teamified',
      html: htmlTemplate,
      text: textTemplate,
    });

    if (emailSent) {
      await this.auditService.log({
        actorUserId: user.id,
        actorRole: 'User',
        action: 'email_verification_sent',
        entityType: 'User',
        entityId: user.id,
        changes: {
          email: user.email,
          verificationToken: user.emailVerificationToken,
        },
      });
    }
  }

  private generateEmailVerificationLink(token: string, baseUrl: string): string {
    return `${baseUrl}/verify-email?token=${token}`;
  }

  private generateEmailVerificationHtmlTemplate(user: User, verificationLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Teamified</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background-color: #f8f9fa; }
        .cta-button { 
            display: inline-block; 
            background-color: #27ae60; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Email Verification</h1>
        </div>
        <div class="content">
            <h2>Welcome ${user.firstName} ${user.lastName}!</h2>
            <p>Your account has been successfully created. To complete your setup, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="${verificationLink}" class="cta-button">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f1f1f1; padding: 10px; border-radius: 3px;">
                ${verificationLink}
            </p>
            
            <p>Once your email is verified, you'll be able to access all features of Teamified.</p>
        </div>
        <div class="footer">
            <p>This is an automated message from Teamified.</p>
            <p>© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateEmailVerificationTextTemplate(user: User, verificationLink: string): string {
    return `
Email Verification - Teamified

Welcome ${user.firstName} ${user.lastName}!

Your account has been successfully created. To complete your setup, please verify your email address by visiting:

${verificationLink}

Once your email is verified, you'll be able to access all features of Teamified.

This is an automated message from Teamified.
© ${new Date().getFullYear()} Teamified. All rights reserved.
`;
  }

  async validateEmailForLogin(email: string, ip?: string): Promise<{ valid: boolean; message?: string }> {
    // Add random timing jitter (200-400ms) to prevent timing attacks
    const jitter = Math.floor(Math.random() * 200) + 200;
    await new Promise(resolve => setTimeout(resolve, jitter));

    // Check if user exists and is active (ignore soft-deleted users)
    const user = await this.userRepository.findOne({
      where: { email, isActive: true, deletedAt: IsNull() },
    });

    if (!user) {
      return {
        valid: false,
        message: "Couldn't find your account"
      };
    }

    return {
      valid: true
    };
  }

  async login(
    loginDto: LoginDto,
    ip?: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user by email with roles (ignore soft-deleted users)
    const user = await this.userRepository.findOne({
      where: { email, isActive: true, deletedAt: IsNull() },
      relations: ['userRoles'],
    });

    if (!user) {
      // Skip audit logging for failed logins when there's no user ID
      // since the database requires actorUserId to be NOT NULL
      // await this.auditService.log({
      //   actorUserId: null,
      //   actorRole: null,
      //   action: 'login_failure',
      //   entityType: 'User',
      //   entityId: null,
      //   changes: {
      //     email,
      //     reason: 'user_not_found',
      //   },
      //   ip,
      //   userAgent,
      // });
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      const userRole = await this.getUserPrimaryRole(user.id);
      await this.auditService.log({
        actorUserId: user.id,
        actorRole: userRole,
        action: 'login_failure',
        entityType: 'User',
        entityId: user.id,
        changes: {
          email,
          reason: 'invalid_password',
        },
        ip,
        userAgent,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.jwtService.generateTokenPair(user);
    
    // Create session
    const deviceMetadata: DeviceMetadata = {
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
    };

    await this.sessionService.createSession(user, tokens.refreshToken, deviceMetadata);

    // Log successful login
    const userRole = await this.getUserPrimaryRole(user.id);
    await this.auditService.log({
      actorUserId: user.id,
      actorRole: userRole,
      action: 'login_success',
      entityType: 'User',
      entityId: user.id,
      changes: {
        email: user.email,
        loginTime: new Date().toISOString(),
      },
      ip,
      userAgent,
    });

    // Extract roles from userRoles relation
    const roles = user.userRoles?.map(userRole => userRole.roleType) || [];

    // Extract theme preference from profileData if available
    const themePreference = user.profileData?.themePreference?.themeMode || 'light';

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        roles: roles,
        themePreference: themePreference,
        mustChangePassword: user.mustChangePassword || false,
      },
    };
  }

  async refresh(
    refreshToken: string,
    ip?: string,
    userAgent?: string,
  ): Promise<RefreshTokenResponseDto> {
    try {
      const payload = this.jwtService.validateRefreshToken(refreshToken);
      
      const user = await this.userRepository.findOne({
        where: { id: payload.sub, isActive: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const deviceMetadata: DeviceMetadata = {
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown',
      };

      const { newTokens } = await this.sessionService.rotateRefreshToken(
        refreshToken,
        user,
        deviceMetadata,
      );

      // Log token refresh
      await this.auditService.log({
        actorUserId: user.id,
        actorRole: 'User',
        action: 'token_refresh',
        entityType: 'User',
        entityId: user.id,
        changes: {
          tokenFamily: payload.tokenFamily,
          refreshTime: new Date().toISOString(),
        },
        ip,
        userAgent,
      });

      return newTokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(
    refreshToken: string,
    ip?: string,
    userAgent?: string,
  ): Promise<LogoutResponseDto> {
    try {
      const payload = this.jwtService.validateRefreshToken(refreshToken);
      
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      // Revoke the session
      await this.sessionService.revokeSessionByRefreshToken(refreshToken);

      // Log logout
      await this.auditService.log({
        actorUserId: user?.id || payload.sub,
        actorRole: 'User',
        action: 'logout',
        entityType: 'User',
        entityId: user?.id || payload.sub,
        changes: {
          logoutTime: new Date().toISOString(),
          tokenFamily: payload.tokenFamily,
        },
        ip,
        userAgent,
      });

      return {
        message: 'Logout successful',
      };
    } catch (error) {
      // Even if token is invalid, consider logout successful
      return {
        message: 'Logout successful',
      };
    }
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['userRoles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Extract roles from userRoles relation
    const roles = user.userRoles?.map(userRole => userRole.roleType) || [];

    // Extract profile picture URL from profileData JSONB
    const profilePictureUrl = user.profileData?.profilePictureUrl || null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      status: user.status,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      roles,
      themePreference: user.themePreference,
      profilePictureUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  async getProfileData(userId: string): Promise<{ profileData: any }> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If user doesn't have profile data, return empty structure
    if (!user.profileData) {
      return {
        profileData: {
          personal: {},
          governmentIds: {},
          banking: {},
          employment: {},
          documents: {},
          preferences: {},
          onboarding: {
            status: 'pending',
            completedSteps: [],
            pendingSteps: ['personal', 'governmentIds', 'banking', 'documents', 'preferences']
          },
          metadata: {
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            version: '1.0'
          }
        }
      };
    }

    return { profileData: user.profileData };
  }

  async updateProfileData(userId: string, profileData: any): Promise<{ profileData: any }> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update the profile data with metadata
    const updatedProfileData = {
      ...profileData,
      metadata: {
        ...profileData.metadata,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      }
    };

    // Update the user's profile data
    await this.userRepository.update(userId, {
      profileData: updatedProfileData,
    });

    // Log the profile update
    await this.auditService.log({
      actorUserId: userId,
      actorRole: await this.getUserPrimaryRole(userId),
      action: 'update',
      entityType: 'UserProfile',
      entityId: userId,
      changes: {
        profileDataUpdated: true,
        updateTime: new Date().toISOString(),
      },
    });

    return { profileData: updatedProfileData };
  }

  async forgotPassword(email: string, ip?: string, userAgent?: string): Promise<{ message: string }> {
    // Always return the same message for security (prevent email enumeration)
    const securityMessage = 'If an account exists with this email, a password reset link has been sent';

    try {
      // Find user by email (ignore soft-deleted users)
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase(), isActive: true, deletedAt: IsNull() },
      });

      // If user doesn't exist, still return success message (security)
      if (!user) {
        this.logger.warn(`Password reset requested for non-existent email: ${email}`);
        await this.auditService.log({
          actorUserId: null,
          actorRole: 'anonymous',
          action: 'password_reset_failed',
          entityType: 'User',
          entityId: null,
          changes: {
            email,
            reason: 'User not found',
          },
          ip,
          userAgent,
        });
        return { message: securityMessage };
      }

      // Generate reset token
      const resetToken = uuidv4();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token to user
      await this.userRepository.update(user.id, {
        passwordResetToken: resetToken,
        passwordResetTokenExpiry: resetTokenExpiry,
      });

      // Send password reset email
      try {
        await this.emailService.sendPasswordResetEmail(user, resetToken);
        this.logger.log(`Password reset email sent to ${user.email}`);
      } catch (error) {
        this.logger.error(`Failed to send password reset email to ${user.email}: ${error.message}`);
        // Don't throw error - we don't want to reveal if user exists
      }

      // Log the password reset request
      await this.auditService.log({
        actorUserId: user.id,
        actorRole: await this.getUserPrimaryRole(user.id),
        action: 'password_reset_requested',
        entityType: 'User',
        entityId: user.id,
        changes: {
          resetTokenGenerated: true,
          expiresAt: resetTokenExpiry.toISOString(),
        },
        ip,
        userAgent,
      });

      return { message: securityMessage };
    } catch (error) {
      this.logger.error(`Error in forgotPassword: ${error.message}`);
      return { message: securityMessage };
    }
  }

  async adminSendPasswordReset(
    userId: string,
    adminUserId: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    // Find the user
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token and expiry (24 hours for admin-initiated resets)
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 24);

    // Save reset token
    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetTokenExpiry: resetTokenExpiry,
    });

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(user, resetToken);
      this.logger.log(`Admin ${adminUserId} sent password reset email to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${user.email}: ${error.message}`);
      throw new BadRequestException('Failed to send password reset email');
    }

    // Log the password reset request with admin as actor
    await this.auditService.log({
      actorUserId: adminUserId,
      actorRole: await this.getUserPrimaryRole(adminUserId),
      action: 'admin_password_reset_sent',
      entityType: 'User',
      entityId: user.id,
      changes: {
        targetUserEmail: user.email,
        resetTokenGenerated: true,
        expiresAt: resetTokenExpiry.toISOString(),
      },
      ip,
      userAgent,
    });

    return { message: 'Password reset email sent successfully' };
  }

  async adminSetPassword(
    userId: string,
    password: string,
    adminUserId: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ message: string; warning: string }> {
    // Find the user
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate password policy
    const passwordValidation = this.passwordService.validatePasswordPolicy(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    // Hash the new password
    const hashedPassword = await this.passwordService.hashPassword(password);

    // Update password, set mustChangePassword flag, and clear any reset tokens
    await this.userRepository.update(user.id, {
      passwordHash: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
      mustChangePassword: true,
      passwordChangedByAdminAt: new Date(),
      passwordChangedByAdminId: adminUserId,
    });

    // Invalidate all existing sessions for security
    await this.sessionRepository.update(
      { userId: user.id },
      { revokedAt: new Date() },
    );

    // Log the admin password set action
    await this.auditService.log({
      actorUserId: adminUserId,
      actorRole: await this.getUserPrimaryRole(adminUserId),
      action: 'admin_password_set',
      entityType: 'User',
      entityId: user.id,
      changes: {
        targetUserEmail: user.email,
        passwordChanged: true,
        sessionsInvalidated: true,
        mustChangePassword: true,
      },
      ip,
      userAgent,
    });

    this.logger.log(`Admin ${adminUserId} set password for user ${user.email}`);

    return { 
      message: 'Password set successfully. User will be required to change password on first login.',
      warning: 'IMPORTANT: Copy and save this password now. Share it securely with the user. This password will not be shown again.',
    };
  }

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Validate password policy
    const passwordValidation = this.passwordService.validatePasswordPolicy(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    // Find user with valid reset token
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetTokenExpiry: MoreThan(new Date()),
        isActive: true,
      },
    });

    if (!user) {
      // Log failed reset attempt
      await this.auditService.log({
        actorUserId: null,
        actorRole: 'anonymous',
        action: 'password_reset_failed',
        entityType: 'User',
        entityId: null,
        changes: {
          reason: 'Invalid or expired token',
          token: token.substring(0, 8) + '...', // Log partial token for debugging
        },
        ip,
        userAgent,
      });
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // Hash the new password
    const hashedPassword = await this.passwordService.hashPassword(password);

    // Update user password and clear reset token
    await this.userRepository.update(user.id, {
      passwordHash: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
    });

    // Invalidate all existing sessions for security
    await this.sessionRepository.update(
      { userId: user.id },
      { revokedAt: new Date() },
    );

    // Log the password reset
    await this.auditService.log({
      actorUserId: user.id,
      actorRole: await this.getUserPrimaryRole(user.id),
      action: 'password_reset_completed',
      entityType: 'User',
      entityId: user.id,
      changes: {
        passwordChanged: true,
        sessionsInvalidated: true,
      },
      ip,
      userAgent,
    });

    this.logger.log(`Password successfully reset for user: ${user.email}`);

    return { message: 'Your password has been reset successfully' };
  }

  /**
   * Normalize slug: trim whitespace, convert to lowercase, collapse consecutive hyphens, remove trailing/leading hyphens
   */
  private normalizeSlug(slug: string): string {
    return slug
      .trim()
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate a unique slug from company name
   */
  private async generateUniqueSlug(companyName: string): Promise<string> {
    let baseSlug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);

    if (!baseSlug) {
      baseSlug = 'organization';
    }

    let slug = baseSlug;
    let counter = 1;

    while (await this.organizationRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Client Admin Signup - Create user and organization
   */
  async clientAdminSignup(
    signupDto: ClientAdminSignupDto,
    ip?: string,
    userAgent?: string,
  ): Promise<ClientAdminSignupResponseDto> {
    const { email, password, firstName, lastName, companyName, slug: providedSlug, industry, companySize } = signupDto;

    // Check for existing active user (ignore soft-deleted users to allow re-registration)
    const existingUser = await this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordValidation = this.passwordService.validatePasswordPolicy(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    let slug: string;
    
    if (providedSlug) {
      slug = this.normalizeSlug(providedSlug);
      
      const existingOrg = await this.organizationRepository.findOne({
        where: { slug },
      });
      
      if (existingOrg) {
        throw new ConflictException(`Organization slug '${slug}' is already taken. Please choose a different slug.`);
      }
    } else {
      slug = await this.generateUniqueSlug(companyName);
    }

    const hashedPassword = await this.passwordService.hashPassword(password);

    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      passwordHash: hashedPassword,
      isActive: true,
      emailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    const organization = this.organizationRepository.create({
      name: companyName,
      slug,
      industry: industry || null,
      companySize: companySize || null,
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      settings: {},
    });

    const savedOrg = await this.organizationRepository.save(organization);

    const clientAdminRole = this.userRoleRepository.create({
      userId: savedUser.id,
      roleType: 'client_admin',
      scope: 'organization',
      scopeEntityId: savedOrg.id,
    });

    await this.userRoleRepository.save(clientAdminRole);

    const orgMember = this.organizationMemberRepository.create({
      organizationId: savedOrg.id,
      userId: savedUser.id,
      status: 'active',
      invitedBy: null,
    });

    await this.organizationMemberRepository.save(orgMember);

    const tokens = await this.jwtService.generateTokenPair(savedUser);
    
    const deviceMetadata: DeviceMetadata = {
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
    };

    await this.sessionService.createSession(savedUser, tokens.refreshToken, deviceMetadata);

    await this.auditService.log({
      actorUserId: savedUser.id,
      actorRole: 'client_admin',
      action: 'client_admin_signup',
      entityType: 'User',
      entityId: savedUser.id,
      changes: {
        email: savedUser.email,
        organizationId: savedOrg.id,
        organizationName: savedOrg.name,
      },
      ip,
      userAgent,
    });

    this.logger.log(`Client admin signup successful: ${savedUser.email}, Org: ${savedOrg.name}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        roles: ['client_admin'],
      },
      organization: {
        id: savedOrg.id,
        name: savedOrg.name,
        slug: savedOrg.slug,
        industry: savedOrg.industry,
        companySize: savedOrg.companySize,
      },
      message: 'Account and organization created successfully',
    };
  }

  /**
   * Force Change Password - For users who must change password on first login
   * Returns new tokens with mustChangePassword=false after successful password change
   */
  async forceChangePassword(
    userId: string,
    newPassword: string,
    confirmPassword: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ message: string; accessToken: string; refreshToken: string }> {
    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find the user
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify that user actually needs to change password
    if (!user.mustChangePassword) {
      throw new BadRequestException('Password change is not required for this user');
    }

    // Validate password policy
    const passwordValidation = this.passwordService.validatePasswordPolicy(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    // Hash the new password
    const hashedPassword = await this.passwordService.hashPassword(newPassword);

    // Update password and clear the mustChangePassword flag
    await this.userRepository.update(user.id, {
      passwordHash: hashedPassword,
      mustChangePassword: false,
      passwordChangedByAdminAt: null,
      passwordChangedByAdminId: null,
    });

    // Reload user to get updated mustChangePassword=false for token generation
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    // Invalidate all existing sessions (they have old tokens with mustChangePassword=true)
    await this.sessionRepository.update(
      { userId: user.id },
      { revokedAt: new Date() },
    );

    // Generate new tokens with mustChangePassword=false
    const tokens = await this.jwtService.generateTokenPair(updatedUser!);

    // Create new session with fresh tokens
    const deviceMetadata: DeviceMetadata = {
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
    };
    await this.sessionService.createSession(
      updatedUser!,
      tokens.refreshToken,
      deviceMetadata,
    );

    // Log the password change
    await this.auditService.log({
      actorUserId: user.id,
      actorRole: await this.getUserPrimaryRole(user.id),
      action: 'password_changed_after_admin_reset',
      entityType: 'User',
      entityId: user.id,
      changes: {
        mustChangePassword: false,
        passwordChanged: true,
        newSessionCreated: true,
      },
      ip,
      userAgent,
    });

    this.logger.log(`User ${user.email} changed password after admin reset`);

    return { 
      message: 'Password changed successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Candidate Signup - Quick signup for job applicants
   */
  async candidateSignup(
    signupDto: CandidateSignupDto,
    ip?: string,
    userAgent?: string,
  ): Promise<CandidateSignupResponseDto> {
    const { email, password, firstName, lastName } = signupDto;

    // Check for existing active user (ignore soft-deleted users to allow re-registration)
    const existingUser = await this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordValidation = this.passwordService.validatePasswordPolicy(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    const hashedPassword = await this.passwordService.hashPassword(password);

    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      passwordHash: hashedPassword,
      isActive: true,
      emailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    const candidateRole = this.userRoleRepository.create({
      userId: savedUser.id,
      roleType: 'candidate',
      scope: 'global',
      scopeEntityId: null,
    });

    await this.userRoleRepository.save(candidateRole);

    const tokens = await this.jwtService.generateTokenPair(savedUser);
    
    const deviceMetadata: DeviceMetadata = {
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
    };

    await this.sessionService.createSession(savedUser, tokens.refreshToken, deviceMetadata);

    await this.auditService.log({
      actorUserId: savedUser.id,
      actorRole: 'candidate',
      action: 'candidate_signup',
      entityType: 'User',
      entityId: savedUser.id,
      changes: {
        email: savedUser.email,
      },
      ip,
      userAgent,
    });

    this.logger.log(`Candidate signup successful: ${savedUser.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        roles: ['candidate'],
      },
      message: 'Account created successfully',
    };
  }
}