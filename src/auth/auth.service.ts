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
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
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
import { UserEmail } from '../user-emails/entities/user-email.entity';
import { HubSpotService } from './services/hubspot.service';
import { AtsProvisioningService } from './services/ats-provisioning.service';

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
    @InjectRepository(UserEmail)
    private userEmailRepository: Repository<UserEmail>,
    private passwordService: PasswordService,
    private jwtService: JwtTokenService,
    private sessionService: SessionService,
    private emailService: EmailService,
    private auditService: AuditService,
    private hubspotService: HubSpotService,
    private atsProvisioningService: AtsProvisioningService,
  ) {}

  private async getUserPrimaryRole(userId: string): Promise<string> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId },
      order: { createdAt: 'ASC' }, // Get the first role assigned
    });
    return userRole?.roleType || 'User';
  }

  /**
   * Find a user by any of their linked emails (personal or work).
   * This enables the "Candidate + Employee" model where users can log in
   * with any of their verified emails.
   * 
   * Search order:
   * 1. Check the primary users.email field
   * 2. Check the user_emails table for linked emails
   */
  async findUserByAnyEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();

    // First, check the primary email in users table
    let user = await this.userRepository.findOne({
      where: { email: normalizedEmail, isActive: true, deletedAt: IsNull() },
      relations: ['userRoles'],
    });

    if (user) {
      return user;
    }

    // If not found, check the user_emails table for linked emails
    const userEmail = await this.userEmailRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (userEmail) {
      // Found a linked email, now get the user
      user = await this.userRepository.findOne({
        where: { id: userEmail.userId, isActive: true, deletedAt: IsNull() },
        relations: ['userRoles'],
      });
      return user;
    }

    return null;
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
    // Map invitation role to user type for email personalization
    const userType: 'client_admin' | 'candidate' = 
      invitation.role?.toLowerCase().includes('client') || 
      invitation.role?.toLowerCase().includes('admin') 
        ? 'client_admin' 
        : 'candidate';
    
    try {
      await this.sendEmailVerification(savedUser, baseUrl, userType);
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

  private async sendEmailVerification(
    user: User, 
    baseUrl: string, 
    userType: 'client_admin' | 'candidate' = 'candidate',
    companyName?: string
  ): Promise<void> {
    const verificationLink = this.generateEmailVerificationLink(user.emailVerificationToken, baseUrl);
    
    const htmlTemplate = this.generateEmailVerificationHtmlTemplate(user, verificationLink, userType, companyName);
    const textTemplate = this.generateEmailVerificationTextTemplate(user, verificationLink, userType, companyName);

    const emailSent = await this.emailService.sendEmail({
      to: user.email,
      subject: 'Verify your email — Teamified',
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

  private generateEmailVerificationGreeting(
    user: User, 
    userType: 'client_admin' | 'candidate',
    companyName?: string
  ): string {
    if (userType === 'client_admin' && companyName) {
      return `Welcome to Teamified, ${companyName}!`;
    }
    if (user.firstName) {
      return `Welcome to Teamified, ${user.firstName}!`;
    }
    return 'Welcome to Teamified!';
  }

  private generateEmailVerificationHtmlTemplate(
    user: User, 
    verificationLink: string,
    userType: 'client_admin' | 'candidate' = 'candidate',
    companyName?: string
  ): string {
    const greeting = this.generateEmailVerificationGreeting(user, userType, companyName);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email — Teamified</title>
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
        .link-box { background-color: #e8eaf6; padding: 15px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 13px; margin: 15px 0; border-left: 4px solid #9333EA; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Verify your email</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.95;">Complete your account setup</p>
        </div>
        <div class="content">
            <h2 style="margin-top: 0; color: #9333EA;">${greeting}</h2>
            
            <p style="font-size: 16px;">To complete your setup, please verify your email address by clicking the button below.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" class="cta-button" style="color: white !important; text-decoration: none;">Verify email address</a>
            </div>
            
            <p style="margin-top: 25px;"><strong>If the button doesn't work,</strong> copy and paste this link into your browser:</p>
            <div class="link-box">
                ${verificationLink}
            </div>
            
            <p style="color: #666; margin-top: 25px;">Once your email is verified, you'll have full access to all Teamified features.</p>
        </div>
        <div class="footer">
            <p style="margin: 5px 0;">This is an automated message from Teamified.</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateEmailVerificationTextTemplate(
    user: User, 
    verificationLink: string,
    userType: 'client_admin' | 'candidate' = 'candidate',
    companyName?: string
  ): string {
    const greeting = this.generateEmailVerificationGreeting(user, userType, companyName);
    
    return `
Verify your email — Teamified

${greeting}

To complete your setup, please verify your email address by visiting:

${verificationLink}

If the link doesn't work, copy and paste it into your browser.

Once your email is verified, you'll have full access to all Teamified features.

This is an automated message from Teamified.
© ${new Date().getFullYear()} Teamified. All rights reserved.
`;
  }

  async validateEmailForLogin(email: string, ip?: string): Promise<{ valid: boolean; message?: string }> {
    // Add random timing jitter (200-400ms) to prevent timing attacks
    const jitter = Math.floor(Math.random() * 200) + 200;
    await new Promise(resolve => setTimeout(resolve, jitter));

    // Check if user exists using any linked email (personal or work)
    const user = await this.findUserByAnyEmail(email);

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

    // Find user by any linked email (personal or work emails)
    // This supports the "Candidate + Employee" model where users can log in
    // with their personal email, work email, or any other linked email
    const user = await this.findUserByAnyEmail(email);

    if (!user) {
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

    // Check if email is verified
    if (!user.emailVerified) {
      const userRole = await this.getUserPrimaryRole(user.id);
      await this.auditService.log({
        actorUserId: user.id,
        actorRole: userRole,
        action: 'login_failure',
        entityType: 'User',
        entityId: user.id,
        changes: {
          email,
          reason: 'email_not_verified',
        },
        ip,
        userAgent,
      });
      throw new UnauthorizedException('Please verify your email address before logging in. Check your inbox for the verification link.');
    }

    // Determine email type and organization for login redirect BEFORE saving
    const normalizedEmail = email.toLowerCase().trim();
    let loginEmailType: 'personal' | 'work' | null = null;
    let loginEmailOrganizationSlug: string | null = null;

    // Check if the login email is in the user_emails table with organization association
    const userEmailRecord = await this.userEmailRepository.findOne({
      where: { email: normalizedEmail, userId: user.id },
      relations: ['organization'],
    });

    if (userEmailRecord) {
      // Explicit user_emails record found - use its type
      if (userEmailRecord.emailType === 'work' && userEmailRecord.organization) {
        loginEmailType = 'work';
        loginEmailOrganizationSlug = userEmailRecord.organization.slug;
      } else if (userEmailRecord.emailType === 'personal') {
        loginEmailType = 'personal';
      }
      // If no explicit type, leave as null for fallback
    } else {
      // No user_emails record - check if login email matches primary email (users.email)
      // We can only reliably infer type for known domains like @teamified.com
      // For all other emails, we leave as null to let fallback logic handle it
      if (normalizedEmail === user.email.toLowerCase().trim()) {
        console.log('[Login] Email matches primary user email, checking for known domain');
        
        // Get the email domain
        const emailDomain = normalizedEmail.split('@')[1];
        
        // Only @teamified.com emails are reliably associated with teamified-internal
        if (emailDomain === 'teamified.com') {
          // Check if user is member of teamified-internal
          const orgMemberships = await this.organizationMemberRepository.find({
            where: { userId: user.id },
            relations: ['organization'],
          });
          const teamifiedOrg = orgMemberships.find(m => m.organization?.slug === 'teamified-internal');
          if (teamifiedOrg) {
            loginEmailType = 'work';
            loginEmailOrganizationSlug = 'teamified-internal';
            console.log('[Login] Inferred work email for teamified-internal org (@teamified.com domain)');
          }
        }
        // For all other domains, leave as null - the fallback in determinePreferredPortal
        // will handle super_admin users appropriately
        if (!loginEmailType) {
          console.log('[Login] Unknown domain, leaving email type as null for fallback handling');
        }
      }
    }

    // Update last login timestamp and persist login email context
    user.lastLoginAt = new Date();
    user.lastLoginEmailType = loginEmailType;
    user.lastLoginEmailOrgSlug = loginEmailOrganizationSlug;
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

    // Determine preferred portal for routing
    const { preferredPortal, preferredPortalOrgSlug } = await this.determinePreferredPortal(
      user.id,
      roles,
      loginEmailType,
      loginEmailOrganizationSlug,
    );

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
        preferredPortal,
        preferredPortalOrgSlug,
      },
      loginEmailType,
      loginEmailOrganizationSlug,
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

    // Determine preferred portal based on stored login email context
    const { preferredPortal, preferredPortalOrgSlug } = await this.determinePreferredPortal(
      userId,
      roles,
      user.lastLoginEmailType,
      user.lastLoginEmailOrgSlug,
    );

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
      preferredPortal,
      preferredPortalOrgSlug,
    };
  }

  /**
   * Determines the preferred portal for a user based on their last login email context.
   * Uses stored lastLoginEmailType and lastLoginEmailOrgSlug from the user record.
   * - Super admins with Teamified Internal work email → accounts
   * - Personal email users → jobseeker
   * - Work email users (any organization) → ats
   */
  private async determinePreferredPortal(
    userId: string, 
    roles: string[],
    lastLoginEmailType: 'personal' | 'work' | null,
    lastLoginEmailOrgSlug: string | null,
  ): Promise<{ preferredPortal: 'accounts' | 'ats' | 'jobseeker'; preferredPortalOrgSlug: string | null }> {
    const isSuperAdmin = roles.includes('super_admin');
    console.log('determinePreferredPortal:', { userId, roles, isSuperAdmin, lastLoginEmailType, lastLoginEmailOrgSlug });
    
    // Use stored login email context if available (set during login based on which email was used)
    if (lastLoginEmailType === 'work' && lastLoginEmailOrgSlug) {
      // Work email with organization
      if (isSuperAdmin && lastLoginEmailOrgSlug === 'teamified-internal') {
        // Super admin logged in with Teamified Internal work email stays in accounts
        console.log('determinePreferredPortal: Work email + super_admin + teamified-internal, returning accounts');
        return { preferredPortal: 'accounts', preferredPortalOrgSlug: null };
      }
      // Other work email users go to ATS
      console.log('determinePreferredPortal: Work email, returning ats');
      return { preferredPortal: 'ats', preferredPortalOrgSlug: lastLoginEmailOrgSlug };
    }

    if (lastLoginEmailType === 'personal') {
      // Personal email users go to jobseeker
      console.log('determinePreferredPortal: Personal email, returning jobseeker');
      return { preferredPortal: 'jobseeker', preferredPortalOrgSlug: null };
    }

    // Fallback: if no stored context, check primary email (for legacy sessions or seed data)
    const primaryEmail = await this.userEmailRepository.findOne({
      where: { userId, isPrimary: true },
      relations: ['organization'],
    });
    console.log('determinePreferredPortal fallback - primaryEmail:', primaryEmail ? { email: primaryEmail.email, emailType: primaryEmail.emailType, hasOrg: !!primaryEmail.organization } : null);

    if (!primaryEmail) {
      // No primary email and no stored context - default to accounts for super_admin, jobseeker for others
      if (isSuperAdmin) {
        console.log('determinePreferredPortal: No context, super_admin detected, returning accounts');
        return { preferredPortal: 'accounts', preferredPortalOrgSlug: null };
      }
      console.log('determinePreferredPortal: No primary email, returning jobseeker');
      return { preferredPortal: 'jobseeker', preferredPortalOrgSlug: null };
    }

    if (primaryEmail.emailType === 'work' && primaryEmail.organization) {
      if (isSuperAdmin && primaryEmail.organization.slug === 'teamified-internal') {
        console.log('determinePreferredPortal: Work email + super_admin + teamified-internal, returning accounts');
        return { preferredPortal: 'accounts', preferredPortalOrgSlug: null };
      }
      console.log('determinePreferredPortal: Work email, returning ats');
      return { preferredPortal: 'ats', preferredPortalOrgSlug: primaryEmail.organization.slug };
    }

    console.log('determinePreferredPortal: Personal email, returning jobseeker');
    return { preferredPortal: 'jobseeker', preferredPortalOrgSlug: null };
  }

  async getProfileData(userId: string): Promise<{ profileData: any; passwordUpdatedAt: Date | null }> {
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
        },
        passwordUpdatedAt: user.passwordUpdatedAt || null,
      };
    }

    return { 
      profileData: user.profileData,
      passwordUpdatedAt: user.passwordUpdatedAt || null,
    };
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

      // Generate reset token (24 hours expiry)
      const resetToken = uuidv4();
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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

  private generateOtp(): string {
    const otp = crypto.randomInt(0, 1000000);
    return otp.toString().padStart(6, '0');
  }

  async sendPasswordResetOtp(
    email: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string; emailMasked?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const user = await this.userRepository.findOne({
        where: { email: normalizedEmail, isActive: true, deletedAt: IsNull() },
      });

      if (!user) {
        this.logger.warn(`Password reset OTP requested for non-existent email: ${normalizedEmail}`);
        await this.auditService.log({
          actorUserId: null,
          actorRole: 'anonymous',
          action: 'password_reset_otp_failed',
          entityType: 'User',
          entityId: null,
          changes: {
            email: normalizedEmail,
            reason: 'User not found',
          },
          ip,
          userAgent,
        });
        return { success: false, message: 'Email not registered' };
      }

      if (user.passwordResetOtpLockedUntil && user.passwordResetOtpLockedUntil > new Date()) {
        const remainingMinutes = Math.ceil((user.passwordResetOtpLockedUntil.getTime() - Date.now()) / 60000);
        this.logger.warn(`Password reset OTP rate limited for: ${normalizedEmail}`);
        return {
          success: false,
          message: `Too many attempts. Please try again in ${remainingMinutes} minutes.`,
        };
      }

      const otp = this.generateOtp();
      const otpHash = await bcrypt.hash(otp, 10);
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await this.userRepository.update(user.id, {
        passwordResetOtpHash: otpHash,
        passwordResetOtpExpiry: otpExpiry,
        passwordResetOtpAttempts: 0,
        passwordResetOtpLockedUntil: null,
      });

      try {
        await this.emailService.sendPasswordResetOtpEmail(user, otp);
        this.logger.log(`Password reset OTP sent to ${normalizedEmail}`);
      } catch (error) {
        this.logger.error(`Failed to send password reset OTP email to ${normalizedEmail}: ${error.message}`);
        return { success: false, message: 'Failed to send verification code. Please try again.' };
      }

      await this.auditService.log({
        actorUserId: user.id,
        actorRole: await this.getUserPrimaryRole(user.id),
        action: 'password_reset_otp_sent',
        entityType: 'User',
        entityId: user.id,
        changes: {
          otpGenerated: true,
          expiresAt: otpExpiry.toISOString(),
        },
        ip,
        userAgent,
      });

      const [localPart, domain] = normalizedEmail.split('@');
      const maskedLocal = localPart.length > 2 
        ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
        : localPart[0] + '*';
      const emailMasked = `${maskedLocal}@${domain}`;

      return {
        success: true,
        message: 'Verification code sent to your email',
        emailMasked,
      };
    } catch (error) {
      this.logger.error(`Error in sendPasswordResetOtp: ${error.message}`);
      return { success: false, message: 'Something went wrong. Please try again.' };
    }
  }

  async verifyPasswordResetOtp(
    email: string,
    otp: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string; resetToken?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const user = await this.userRepository.findOne({
        where: { email: normalizedEmail, isActive: true, deletedAt: IsNull() },
      });

      if (!user) {
        return { success: false, message: 'Invalid request' };
      }

      if (user.passwordResetOtpLockedUntil && user.passwordResetOtpLockedUntil > new Date()) {
        const remainingMinutes = Math.ceil((user.passwordResetOtpLockedUntil.getTime() - Date.now()) / 60000);
        return {
          success: false,
          message: `Too many attempts. Please try again in ${remainingMinutes} minutes.`,
        };
      }

      if (!user.passwordResetOtpHash || !user.passwordResetOtpExpiry) {
        return { success: false, message: 'No verification code requested. Please request a new code.' };
      }

      if (user.passwordResetOtpExpiry < new Date()) {
        await this.userRepository.update(user.id, {
          passwordResetOtpHash: null,
          passwordResetOtpExpiry: null,
          passwordResetOtpAttempts: 0,
        });
        return { success: false, message: 'Verification code has expired. Please request a new code.' };
      }

      const isValidOtp = await bcrypt.compare(otp, user.passwordResetOtpHash);

      if (!isValidOtp) {
        const newAttempts = (user.passwordResetOtpAttempts || 0) + 1;
        const updates: Partial<User> = { passwordResetOtpAttempts: newAttempts };

        if (newAttempts >= 5) {
          updates.passwordResetOtpLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
          updates.passwordResetOtpHash = null;
          updates.passwordResetOtpExpiry = null;
          updates.passwordResetOtpAttempts = 0;
          
          await this.userRepository.update(user.id, updates);
          
          await this.auditService.log({
            actorUserId: user.id,
            actorRole: await this.getUserPrimaryRole(user.id),
            action: 'password_reset_otp_locked',
            entityType: 'User',
            entityId: user.id,
            changes: {
              reason: 'Too many failed attempts',
              lockedUntil: updates.passwordResetOtpLockedUntil.toISOString(),
            },
            ip,
            userAgent,
          });
          
          return { success: false, message: 'Too many failed attempts. Please try again in 15 minutes.' };
        }

        await this.userRepository.update(user.id, updates);
        
        await this.auditService.log({
          actorUserId: user.id,
          actorRole: await this.getUserPrimaryRole(user.id),
          action: 'password_reset_otp_failed',
          entityType: 'User',
          entityId: user.id,
          changes: {
            reason: 'Invalid OTP code',
            attemptNumber: newAttempts,
            remainingAttempts: 5 - newAttempts,
          },
          ip,
          userAgent,
        });
        
        return { success: false, message: 'Incorrect code. Please try again.' };
      }

      const resetToken = uuidv4();
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

      await this.userRepository.update(user.id, {
        passwordResetToken: resetToken,
        passwordResetTokenExpiry: resetTokenExpiry,
        passwordResetOtpHash: null,
        passwordResetOtpExpiry: null,
        passwordResetOtpAttempts: 0,
        passwordResetOtpLockedUntil: null,
      });

      await this.auditService.log({
        actorUserId: user.id,
        actorRole: await this.getUserPrimaryRole(user.id),
        action: 'password_reset_otp_verified',
        entityType: 'User',
        entityId: user.id,
        changes: {
          resetTokenGenerated: true,
          expiresAt: resetTokenExpiry.toISOString(),
        },
        ip,
        userAgent,
      });

      return {
        success: true,
        message: 'Verification successful',
        resetToken,
      };
    } catch (error) {
      this.logger.error(`Error in verifyPasswordResetOtp: ${error.message}`);
      return { success: false, message: 'Something went wrong. Please try again.' };
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
      passwordUpdatedAt: new Date(),
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

  async validateResetToken(token: string): Promise<{
    valid: boolean;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
      profilePictureUrl: string | null;
    };
    expiresAt?: Date;
  }> {
    if (!token) {
      return { valid: false };
    }

    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetTokenExpiry: MoreThan(new Date()),
        isActive: true,
      },
      select: ['id', 'firstName', 'lastName', 'email', 'profilePictureUrl', 'passwordResetTokenExpiry'],
    });

    if (!user) {
      return { valid: false };
    }

    return {
      valid: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
      },
      expiresAt: user.passwordResetTokenExpiry,
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
      passwordUpdatedAt: new Date(),
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
   * Change password for authenticated user.
   * Requires the current password for verification - no email required.
   * This is different from resetPassword which uses a token.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ message: string; success: boolean }> {
    // Validate new password confirmation
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Validate new password policy
    const passwordValidation = this.passwordService.validatePasswordPolicy(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'New password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    // Find the user
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordService.verifyPassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      const userRole = await this.getUserPrimaryRole(user.id);
      await this.auditService.log({
        actorUserId: user.id,
        actorRole: userRole,
        action: 'password_change_failed',
        entityType: 'User',
        entityId: user.id,
        changes: {
          reason: 'incorrect_current_password',
        },
        ip,
        userAgent,
      });
      throw new BadRequestException('Current password is incorrect');
    }

    // Check that new password is different from current
    const isSamePassword = await this.passwordService.verifyPassword(
      newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new BadRequestException('New password must be different from your current password');
    }

    // Hash the new password
    const hashedPassword = await this.passwordService.hashPassword(newPassword);

    // Update user password, clear mustChangePassword flag, and track update time
    await this.userRepository.update(user.id, {
      passwordHash: hashedPassword,
      mustChangePassword: false,
      passwordUpdatedAt: new Date(),
    });

    // Log the password change
    const userRole = await this.getUserPrimaryRole(user.id);
    await this.auditService.log({
      actorUserId: user.id,
      actorRole: userRole,
      action: 'password_changed',
      entityType: 'User',
      entityId: user.id,
      changes: {
        passwordChanged: true,
        changedAt: new Date().toISOString(),
      },
      ip,
      userAgent,
    });

    this.logger.log(`Password successfully changed for user: ${user.email}`);

    return { 
      message: 'Your password has been changed successfully',
      success: true,
    };
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
    const { 
      password, firstName, lastName, companyName, slug: providedSlug, 
      industry, companySize, country, mobileNumber, phoneNumber, 
      website, businessDescription, rolesNeeded, howCanWeHelp 
    } = signupDto;
    // Normalize email to lowercase for consistent storage and lookup
    const email = signupDto.email.toLowerCase().trim();

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
      emailVerificationToken: uuidv4(),
      emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
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

    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5000';
    try {
      await this.sendEmailVerification(savedUser, baseUrl, 'client_admin', companyName);
    } catch (error) {
      this.logger.warn(`Failed to send email verification to ${savedUser.email}: ${error.message}`);
    }

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

    // Create HubSpot contact asynchronously (non-blocking)
    let hubspotContactCreated = false;
    let hubspotContactId: string | undefined;
    try {
      const hubspotResult = await this.hubspotService.createOrUpdateContact({
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        company: companyName,
        mobileNumber: mobileNumber,
        phoneNumber: phoneNumber,
        website: website,
        businessDescription: businessDescription,
        rolesNeeded: rolesNeeded,
        howCanWeHelp: howCanWeHelp,
        companySize: companySize,
        country: country,
      });

      hubspotContactCreated = hubspotResult.success;
      hubspotContactId = hubspotResult.contactId;

      if (hubspotResult.success) {
        this.logger.log(`HubSpot contact created/updated: ${hubspotResult.contactId}`);
      } else {
        this.logger.warn(`HubSpot contact creation failed: ${hubspotResult.error}`);
      }
    } catch (hubspotError) {
      this.logger.error(`HubSpot exception: ${hubspotError instanceof Error ? hubspotError.message : String(hubspotError)}`);
    }

    let atsProvisioningSuccess = false;
    let atsRedirectUrl: string | undefined;
    try {
      const atsResult = await this.atsProvisioningService.provisionAtsAccess({
        userId: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        organizationId: savedOrg.id,
        organizationSlug: savedOrg.slug,
        organizationName: savedOrg.name,
      });

      atsProvisioningSuccess = atsResult.success;
      atsRedirectUrl = atsResult.redirectUrl;

      if (atsResult.success) {
        this.logger.log(`ATS provisioning successful for ${savedUser.email}, redirect: ${atsResult.redirectUrl}`);
      } else {
        this.logger.warn(`ATS provisioning failed for ${savedUser.email}: ${atsResult.error}`);
      }
    } catch (atsError) {
      this.logger.error(`ATS provisioning exception: ${atsError instanceof Error ? atsError.message : String(atsError)}`);
    }

    return {
      message: 'Account created successfully. Please check your email to verify your account.',
      emailVerificationRequired: true,
      email: savedUser.email,
      organizationSlug: savedOrg.slug,
      hubspotContactCreated,
      hubspotContactId,
      atsProvisioningSuccess,
      atsRedirectUrl,
      userId: savedUser.id,
      organizationId: savedOrg.id,
    };
  }

  async retryAtsProvisioning(
    userId: string,
    organizationId: string,
    organizationSlug: string,
  ): Promise<{ success: boolean; atsRedirectUrl?: string; error?: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      return { success: false, error: 'Organization not found' };
    }

    try {
      const atsResult = await this.atsProvisioningService.provisionAtsAccess({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: organization.id,
        organizationSlug: organizationSlug,
        organizationName: organization.name,
      });

      if (atsResult.success) {
        this.logger.log(`ATS retry provisioning successful for ${user.email}`);
        return {
          success: true,
          atsRedirectUrl: atsResult.redirectUrl,
        };
      } else {
        this.logger.warn(`ATS retry provisioning failed for ${user.email}: ${atsResult.error}`);
        return {
          success: false,
          error: atsResult.error,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`ATS retry provisioning exception for ${user.email}: ${errorMessage}`);
      return {
        success: false,
        error: 'Failed to provision ATS access',
      };
    }
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
      passwordUpdatedAt: new Date(),
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
    const { password, firstName, lastName } = signupDto;
    // Normalize email to lowercase for consistent storage and lookup
    const email = signupDto.email.toLowerCase().trim();

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
      emailVerificationToken: uuidv4(),
      emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const savedUser = await this.userRepository.save(user);

    const candidateRole = this.userRoleRepository.create({
      userId: savedUser.id,
      roleType: 'candidate',
      scope: 'global',
      scopeEntityId: null,
    });

    await this.userRoleRepository.save(candidateRole);

    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5000';
    try {
      await this.sendEmailVerification(savedUser, baseUrl, 'candidate');
    } catch (error) {
      this.logger.warn(`Failed to send email verification to ${savedUser.email}: ${error.message}`);
    }

    await this.auditService.log({
      actorUserId: savedUser.id,
      actorRole: 'candidate',
      action: 'candidate_signup',
      entityType: 'User',
      entityId: savedUser.id,
      changes: {
        email: savedUser.email,
        emailVerificationRequired: true,
      },
      ip,
      userAgent,
    });

    this.logger.log(`Candidate signup successful: ${savedUser.email} (email verification required)`);

    return {
      message: 'Account created successfully. Please check your email to verify your account.',
      emailVerificationRequired: true,
      email: savedUser.email,
    };
  }
}