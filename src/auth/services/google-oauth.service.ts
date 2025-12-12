import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { UserRole } from '../../user-roles/entities/user-role.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { OrganizationMember } from '../../organizations/entities/organization-member.entity';
import { JwtTokenService } from './jwt.service';
import { SessionService, DeviceMetadata } from './session.service';
import { AuditService } from '../../audit/audit.service';
import { EmailService } from '../../email/services/email.service';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
}

interface TempAuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    emailVerified: boolean;
    roles: string[];
    themePreference: string;
    mustChangePassword: boolean;
  };
  isNewUser: boolean;
  returnUrl?: string;
  createdAt: number;
}

@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly isConfigured: boolean;
  private readonly tempAuthResults = new Map<string, TempAuthResult>();
  private readonly TEMP_CODE_TTL = 60 * 1000;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRolesRepository: Repository<UserRole>,
    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private readonly organizationMembersRepository: Repository<OrganizationMember>,
    private readonly jwtTokenService: JwtTokenService,
    private readonly sessionService: SessionService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
  ) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET') || '';
    
    const baseUrl = this.configService.get<string>('BASE_URL') ||
      this.configService.get<string>('FRONTEND_URL') ||
      (this.configService.get<string>('REPLIT_DEV_DOMAIN')
        ? `https://${this.configService.get<string>('REPLIT_DEV_DOMAIN')}`
        : 'http://localhost:5000');
    
    this.redirectUri = `${baseUrl}/api/v1/auth/google/callback`;
    
    this.isConfigured = !!(this.clientId && this.clientSecret);
    
    if (!this.isConfigured) {
      this.logger.warn('Google OAuth is not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.');
    } else {
      this.logger.log('Google OAuth configured successfully');
    }
  }

  isGoogleOAuthConfigured(): boolean {
    return this.isConfigured;
  }

  generateAuthorizationUrl(state: string, returnUrl?: string): string {
    if (!this.isConfigured) {
      throw new BadRequestException('Google OAuth is not configured');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: returnUrl ? `${state}|${returnUrl}` : state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    if (!this.isConfigured) {
      throw new BadRequestException('Google OAuth is not configured');
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      this.logger.error('Failed to exchange code for tokens', errorData);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to get user info from Google');
    }

    return response.json();
  }

  async handleGoogleCallback(
    code: string,
    state: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
      emailVerified: boolean;
      roles: string[];
      themePreference: string;
      mustChangePassword: boolean;
    };
    isNewUser: boolean;
    returnUrl?: string;
  }> {
    let returnUrl: string | undefined;
    let actualState = state;

    if (state && state.includes('|')) {
      const parts = state.split('|');
      actualState = parts[0];
      returnUrl = parts.slice(1).join('|');
    }

    const tokens = await this.exchangeCodeForTokens(code);
    const googleUser = await this.getUserInfo(tokens.access_token);

    if (!googleUser.verified_email) {
      throw new UnauthorizedException('Google email is not verified');
    }

    const { user, isNewUser } = await this.findOrCreateByGoogle(
      googleUser.id,
      googleUser.email,
      googleUser.given_name,
      googleUser.family_name,
      googleUser.picture,
    );

    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    const portalTokens = await this.jwtTokenService.generateTokenPair(user);

    const deviceMetadata: DeviceMetadata = {
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
    };

    await this.sessionService.createSession(user, portalTokens.refreshToken, deviceMetadata);

    const userRole = user.userRoles?.[0]?.roleType || 'none';
    await this.auditService.log({
      actorUserId: user.id,
      actorRole: userRole,
      action: isNewUser ? 'google_oauth_signup' : 'google_oauth_login',
      entityType: 'User',
      entityId: user.id,
      changes: {
        googleUserId: googleUser.id,
        email: user.email,
        loginTime: new Date().toISOString(),
        isNewUser,
      },
      ip,
      userAgent,
    });

    const roles = user.userRoles?.map((ur) => ur.roleType) || [];
    const themePreference = user.profileData?.themePreference?.themeMode || 'light';

    return {
      accessToken: portalTokens.accessToken,
      refreshToken: portalTokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        roles,
        themePreference,
        mustChangePassword: user.mustChangePassword || false,
      },
      isNewUser,
      returnUrl,
    };
  }

  private async findOrCreateByGoogle(
    googleUserId: string,
    email: string,
    firstName: string,
    lastName: string,
    profilePicture?: string,
  ): Promise<{ user: User; isNewUser: boolean }> {
    let user = await this.usersRepository.findOne({
      where: { googleUserId },
      relations: ['userRoles'],
    });

    if (user) {
      if (profilePicture && !user.profilePictureUrl) {
        user.profilePictureUrl = profilePicture;
        await this.usersRepository.save(user);
      }
      // Check if user has roles - if not, they need to complete signup
      const hasRoles = user.userRoles && user.userRoles.length > 0;
      return { user, isNewUser: !hasRoles };
    }

    user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase(), deletedAt: IsNull() },
      relations: ['userRoles'],
    });

    if (user) {
      user.googleUserId = googleUserId;
      user.emailVerified = true;
      if (profilePicture && !user.profilePictureUrl) {
        user.profilePictureUrl = profilePicture;
      }
      await this.usersRepository.save(user);
      
      this.logger.log(`Linked existing user ${email} to Google account`);
      // Check if user has roles - if not, they need to complete signup
      const hasRoles = user.userRoles && user.userRoles.length > 0;
      return { user, isNewUser: !hasRoles };
    }

    const newUser = this.usersRepository.create({
      email: email.toLowerCase(),
      googleUserId,
      firstName: firstName || email.split('@')[0],
      lastName: lastName || '',
      emailVerified: true,
      isActive: true,
      status: 'active',
      passwordHash: null,
      profilePictureUrl: profilePicture,
    });

    try {
      const savedUser = await this.usersRepository.save(newUser);

      this.logger.log(`Created new user ${email} via Google OAuth - pending role selection`);

      const refreshedUser = await this.usersRepository.findOne({
        where: { id: savedUser.id },
        relations: ['userRoles'],
      });
      return { user: refreshedUser, isNewUser: true };
    } catch (error) {
      if (error.code === '23505') {
        const existingUser = await this.usersRepository.findOne({
          where: { email: email.toLowerCase(), deletedAt: IsNull() },
          relations: ['userRoles'],
        });

        if (existingUser) {
          if (!existingUser.googleUserId) {
            existingUser.googleUserId = googleUserId;
            existingUser.emailVerified = true;
            await this.usersRepository.save(existingUser);
          }
          // Check if user has roles - if not, they need to complete signup
          const hasRoles = existingUser.userRoles && existingUser.userRoles.length > 0;
          return { user: existingUser, isNewUser: !hasRoles };
        }
      }

      throw error;
    }
  }

  generateStateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async storeTemporaryAuthResult(result: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
      emailVerified: boolean;
      roles: string[];
      themePreference: string;
      mustChangePassword: boolean;
    };
    isNewUser: boolean;
    returnUrl?: string;
  }): Promise<string> {
    this.cleanupExpiredCodes();
    
    const tempCode = crypto.randomBytes(32).toString('hex');
    this.tempAuthResults.set(tempCode, {
      ...result,
      createdAt: Date.now(),
    });
    
    return tempCode;
  }

  async exchangeTemporaryCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
      emailVerified: boolean;
      roles: string[];
      themePreference: string;
      mustChangePassword: boolean;
    };
    isNewUser: boolean;
    returnUrl?: string;
  }> {
    this.cleanupExpiredCodes();
    
    const result = this.tempAuthResults.get(code);
    
    if (!result) {
      throw new UnauthorizedException('Invalid or expired authentication code');
    }
    
    if (Date.now() - result.createdAt > this.TEMP_CODE_TTL) {
      this.tempAuthResults.delete(code);
      throw new UnauthorizedException('Authentication code has expired');
    }
    
    this.tempAuthResults.delete(code);
    
    const { createdAt, ...authResult } = result;
    return authResult;
  }

  private cleanupExpiredCodes(): void {
    const now = Date.now();
    for (const [code, result] of this.tempAuthResults.entries()) {
      if (now - result.createdAt > this.TEMP_CODE_TTL) {
        this.tempAuthResults.delete(code);
      }
    }
  }

  async assignRoleToNewUser(
    userId: string,
    roleType: string,
    organizationName?: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string; role: string; organizationId?: string }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['userRoles'],
    });

    if (!user) {
      throw new UnauthorizedException('Your session has expired or your account no longer exists. Please sign in again.');
    }

    if (user.userRoles && user.userRoles.length > 0) {
      throw new BadRequestException('User already has a role assigned');
    }

    if (roleType !== 'candidate' && roleType !== 'client_admin') {
      throw new BadRequestException('Invalid role type. Must be "candidate" or "client_admin"');
    }

    let organizationId: string | undefined;

    if (roleType === 'client_admin') {
      if (!organizationName || !organizationName.trim()) {
        throw new BadRequestException('Organization name is required for employer signup');
      }

      const slug = this.generateSlug(organizationName);

      const existingOrg = await this.organizationsRepository.findOne({
        where: { slug },
      });

      if (existingOrg) {
        throw new BadRequestException('An organization with a similar name already exists. Please choose a different name.');
      }

      const organization = this.organizationsRepository.create({
        name: organizationName.trim(),
        slug,
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
      });

      const savedOrg = await this.organizationsRepository.save(organization);
      organizationId = savedOrg.id;

      // Create the client_admin role
      const clientAdminRole = this.userRolesRepository.create({
        userId: user.id,
        roleType: 'client_admin',
        scope: 'organization',
        scopeEntityId: savedOrg.id,
      });
      await this.userRolesRepository.save(clientAdminRole);

      // Create organization membership record so user shows up in org members list
      const orgMember = this.organizationMembersRepository.create({
        organizationId: savedOrg.id,
        userId: user.id,
        status: 'active',
        joinedAt: new Date(),
      });
      await this.organizationMembersRepository.save(orgMember);

      this.logger.log(`Created organization "${organizationName}" and assigned client_admin role to user ${user.email}`);
    } else {
      const candidateRole = this.userRolesRepository.create({
        userId: user.id,
        roleType: 'candidate',
        scope: 'individual',
        scopeEntityId: user.id,
      });
      await this.userRolesRepository.save(candidateRole);

      this.logger.log(`Assigned candidate role to user ${user.email}`);
    }

    await this.auditService.log({
      actorUserId: user.id,
      actorRole: roleType,
      action: 'google_signup_role_assigned',
      entityType: 'User',
      entityId: user.id,
      changes: {
        roleType,
        organizationId,
        organizationName: organizationName?.trim(),
      },
      ip,
      userAgent,
    });

    await this.sendWelcomeEmail(user, roleType);

    return {
      success: true,
      message: roleType === 'candidate' 
        ? 'Welcome! Your candidate account is ready.'
        : `Welcome! Your organization "${organizationName}" has been created.`,
      role: roleType,
      organizationId,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  private async sendWelcomeEmail(user: User, roleType: string): Promise<void> {
    try {
      const subject = 'Welcome to Teamified!';
      
      let htmlContent: string;
      let textContent: string;

      if (roleType === 'candidate') {
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #667eea;">Welcome to Teamified, ${user.firstName}!</h1>
            <p>Your candidate account is ready. Start exploring job opportunities today!</p>
            <div style="margin: 30px 0;">
              <a href="https://jobseeker.teamified.com.au" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 14px 28px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Browse Jobs
              </a>
            </div>
            <p style="color: #666;">With Teamified, you can:</p>
            <ul style="color: #666;">
              <li>Browse and apply for exciting job opportunities</li>
              <li>Track your application status</li>
              <li>Build your professional profile</li>
            </ul>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              If you didn't create this account, please contact our support team.
            </p>
          </div>
        `;
        textContent = `Welcome to Teamified, ${user.firstName}!\n\nYour candidate account is ready. Start exploring job opportunities today!\n\nBrowse Jobs: https://jobseeker.teamified.com.au\n\nWith Teamified, you can:\n- Browse and apply for exciting job opportunities\n- Track your application status\n- Build your professional profile`;
      } else {
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #667eea;">Welcome to Teamified, ${user.firstName}!</h1>
            <p>Your employer account is ready. Start building your team today!</p>
            <div style="margin: 30px 0;">
              <a href="https://ats.teamified.com.au" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 14px 28px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;
                        margin-right: 10px;">
                Post Your First Job
              </a>
              <a href="https://hris.teamified.com.au" 
                 style="background: white; 
                        color: #667eea; 
                        padding: 14px 28px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        border: 2px solid #667eea;
                        display: inline-block;">
                Set Up Your Organization
              </a>
            </div>
            <p style="color: #666;">With Teamified, you can:</p>
            <ul style="color: #666;">
              <li>Post job openings and attract top talent</li>
              <li>Manage your hiring pipeline</li>
              <li>Onboard and manage your team members</li>
            </ul>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              If you didn't create this account, please contact our support team.
            </p>
          </div>
        `;
        textContent = `Welcome to Teamified, ${user.firstName}!\n\nYour employer account is ready. Start building your team today!\n\nPost Your First Job: https://ats.teamified.com.au\nSet Up Your Organization: https://hris.teamified.com.au\n\nWith Teamified, you can:\n- Post job openings and attract top talent\n- Manage your hiring pipeline\n- Onboard and manage your team members`;
      }

      await this.emailService.sendEmail({
        to: user.email,
        subject,
        html: htmlContent,
        text: textContent,
      });

      this.logger.log(`Welcome email sent to ${user.email} (${roleType})`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${user.email}:`, error);
    }
  }
}
