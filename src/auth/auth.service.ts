import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { Invitation, InvitationStatus } from '../invitations/entities/invitation.entity';
import { AcceptInvitationDto, AcceptInvitationResponseDto } from './dto/accept-invitation.dto';
import { LoginDto, LoginResponseDto, RefreshTokenResponseDto, LogoutResponseDto, UserProfileDto } from './dto/login.dto';
import { PasswordService } from './services/password.service';
import { JwtTokenService } from './services/jwt.service';
import { SessionService, DeviceMetadata } from './services/session.service';
import { EmailService } from '../email/services/email.service';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { EmploymentRecordService } from '../employment-records/services/employment-record.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private passwordService: PasswordService,
    private jwtService: JwtTokenService,
    private sessionService: SessionService,
    private emailService: EmailService,
    private auditService: AuditService,
    private employmentRecordService: EmploymentRecordService,
  ) {}

  private async getUserPrimaryRole(userId: string): Promise<string> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId },
      order: { createdAt: 'ASC' }, // Get the first role assigned
    });
    return userRole?.roleType || 'User';
  }

  async acceptInvitation(
    acceptInvitationDto: AcceptInvitationDto,
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
        expiresAt: MoreThan(new Date()),
        deletedAt: null,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid or expired invitation token');
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
      await this.sendEmailVerification(savedUser);
    } catch (error) {
      this.logger.warn(`Failed to send email verification to ${savedUser.email}: ${error.message}`);
      // Don't fail the process if email sending fails
    }

    // Create audit logs
    await Promise.all([
      this.auditService.log({
        actorUserId: savedUser.id,
        actorRole: invitation.role,
        action: 'invitation_accepted',
        entityType: 'Invitation',
        entityId: invitation.id,
        changes: {
          invitationId: invitation.id,
          email: invitation.email,
          acceptedAt: invitation.acceptedAt.toISOString(),
        },
        ip,
        userAgent,
      }),
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

  private async sendEmailVerification(user: User): Promise<void> {
    const verificationLink = this.generateEmailVerificationLink(user.emailVerificationToken);
    
    const htmlTemplate = this.generateEmailVerificationHtmlTemplate(user, verificationLink);
    const textTemplate = this.generateEmailVerificationTextTemplate(user, verificationLink);

    const emailSent = await this.emailService.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Teamified EOR Portal',
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

  private generateEmailVerificationLink(token: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'https://portal.teamified.com';
    return `${baseUrl}/verify-email?token=${token}`;
  }

  private generateEmailVerificationHtmlTemplate(user: User, verificationLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Teamified EOR Portal</title>
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
            
            <p>Once your email is verified, you'll be able to access all features of the EOR Portal.</p>
        </div>
        <div class="footer">
            <p>This is an automated message from Teamified EOR Portal.</p>
            <p>© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateEmailVerificationTextTemplate(user: User, verificationLink: string): string {
    return `
Email Verification - Teamified EOR Portal

Welcome ${user.firstName} ${user.lastName}!

Your account has been successfully created. To complete your setup, please verify your email address by visiting:

${verificationLink}

Once your email is verified, you'll be able to access all features of the EOR Portal.

This is an automated message from Teamified EOR Portal.
© ${new Date().getFullYear()} Teamified. All rights reserved.
`;
  }

  async login(
    loginDto: LoginDto,
    ip?: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
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

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      roles,
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

  async getEmploymentRecords(userId: string): Promise<any[]> {
    try {
      const employmentRecords = await this.employmentRecordService.findByUserId(userId);
      return employmentRecords;
    } catch (error) {
      this.logger.error(`Failed to get employment records for user ${userId}: ${error.message}`);
      return [];
    }
  }
}