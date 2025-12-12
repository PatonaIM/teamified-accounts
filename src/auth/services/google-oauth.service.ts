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
import { JwtTokenService } from './jwt.service';
import { SessionService, DeviceMetadata } from './session.service';
import { AuditService } from '../../audit/audit.service';

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
    private readonly jwtTokenService: JwtTokenService,
    private readonly sessionService: SessionService,
    private readonly auditService: AuditService,
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

    const user = await this.findOrCreateByGoogle(
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

    const userRole = user.userRoles?.[0]?.roleType || 'candidate';
    await this.auditService.log({
      actorUserId: user.id,
      actorRole: userRole,
      action: 'google_oauth_login',
      entityType: 'User',
      entityId: user.id,
      changes: {
        googleUserId: googleUser.id,
        email: user.email,
        loginTime: new Date().toISOString(),
        isNewUser: !user.lastLoginAt,
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
      returnUrl,
    };
  }

  private async findOrCreateByGoogle(
    googleUserId: string,
    email: string,
    firstName: string,
    lastName: string,
    profilePicture?: string,
  ): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: { googleUserId },
      relations: ['userRoles'],
    });

    if (user) {
      if (profilePicture && !user.profilePictureUrl) {
        user.profilePictureUrl = profilePicture;
        await this.usersRepository.save(user);
      }
      return user;
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
      return user;
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

      const candidateRole = this.userRolesRepository.create({
        userId: savedUser.id,
        roleType: 'candidate',
        scope: 'individual',
        scopeEntityId: savedUser.id,
      });
      await this.userRolesRepository.save(candidateRole);

      this.logger.log(`Created new user ${email} via Google OAuth`);

      return await this.usersRepository.findOne({
        where: { id: savedUser.id },
        relations: ['userRoles'],
      });
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
          return existingUser;
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
}
