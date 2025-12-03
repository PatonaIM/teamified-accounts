import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { JwtTokenService } from './jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../../user-roles/entities/user-role.entity';
import { OAuthClientsService } from '../../oauth-clients/oauth-clients.service';
import { AuditService } from '../../audit/audit.service';
import * as crypto from 'crypto';

@Injectable()
export class SupabaseAuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtTokenService: JwtTokenService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRolesRepository: Repository<UserRole>,
    @Inject(forwardRef(() => OAuthClientsService))
    private readonly oauthClientsService: OAuthClientsService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Exchange Supabase token for Portal JWT
   * This is the main SSO endpoint
   */
  async exchangeToken(
    supabaseAccessToken: string,
    clientId?: string,
    clientSecret?: string,
  ) {
    // 1. Validate OAuth client if credentials provided
    let oauthClient = null;
    if (clientId && clientSecret) {
      oauthClient = await this.oauthClientsService.validateClient(
        clientId,
        clientSecret,
      );

      if (!oauthClient) {
        throw new UnauthorizedException({
          message: 'Invalid OAuth client credentials',
          error: 'INVALID_CLIENT',
        });
      }
    }
    // Note: Client validation is optional for backward compatibility
    // TODO: Make client validation required once all apps are registered

    // 2. Verify Supabase token
    const supabasePayload = await this.supabaseService.verifyToken(
      supabaseAccessToken,
    );

    // 3. Security: Check email verification
    // OAuth providers (Google, GitHub, etc.) automatically verify emails
    const isOAuthUser = supabasePayload.app_metadata?.provider && 
                        supabasePayload.app_metadata.provider !== 'email';
    const isEmailVerified = supabasePayload.email_confirmed_at || 
                           supabasePayload.email_verified === true ||
                           isOAuthUser;
    
    if (!isEmailVerified) {
      throw new UnauthorizedException({
        message: 'Email address not verified',
        error: 'EMAIL_NOT_VERIFIED',
        details: {
          reason: 'You must verify your email address before accessing the Portal.',
          action: 'Please check your inbox for a verification email from Supabase.',
          resendInstructions:
            'If you did not receive the email, you can request a new one by logging in again at the Supabase sign-in page.',
          checkSpam: 'Remember to check your spam/junk folder.',
        },
      });
    }

    // 4. Find or create Portal user
    const user = await this.findOrCreateBySupabase(
      supabasePayload.sub,
      supabasePayload.email,
      supabasePayload.user_metadata?.name,
    );

    // 5. Generate Portal JWT with user's roles and client info
    const tokenFamily = crypto.randomUUID();
    const accessToken = await this.jwtTokenService.generateAccessToken(user, oauthClient?.name);
    const refreshToken = this.jwtTokenService.generateRefreshToken(user, tokenFamily);

    // 6. Log successful token exchange with app info
    await this.auditService.log({
      actorUserId: user.id,
      actorRole: user.userRoles?.[0]?.role || 'candidate',
      action: 'SSO_TOKEN_EXCHANGE',
      entityType: 'USER',
      entityId: user.id,
      changes: {
        oauthClientId: oauthClient?.id,
        oauthClientName: oauthClient?.name || 'Unknown App',
        appEnvironment: oauthClient?.metadata?.environment,
        supabaseUserId: supabasePayload.sub,
        email: user.email,
        hasClientCredentials: !!(clientId && clientSecret),
      },
    });

    // 7. Return Portal tokens + user info with client details
    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
      appName: oauthClient?.name, // Include app name in response
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        clientName: oauthClient?.name, // Client name from OAuth registration
        roles: user.userRoles?.map(ur => ur.role) || [], // Include roles
      },
    };
  }

  /**
   * Find existing user by Supabase ID or create new user
   */
  private async findOrCreateBySupabase(
    supabaseUserId: string,
    email: string,
    name?: string,
  ): Promise<User> {
    // Try to find by Supabase ID first
    let user = await this.usersRepository.findOne({
      where: { supabaseUserId },
      relations: ['userRoles'],
    });

    if (user) {
      return user;
    }

    // Try to find by email (existing Portal user, ignore soft-deleted users)
    user = await this.usersRepository.findOne({
      where: { email, deletedAt: IsNull() },
      relations: ['userRoles'],
    });

    if (user) {
      // Link existing Portal user to Supabase
      user.supabaseUserId = supabaseUserId;
      await this.usersRepository.save(user);
      return user;
    }

    // Create new user (first-time Supabase login)
    const [firstName, ...lastNameParts] = (name || email.split('@')[0]).split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const newUser = this.usersRepository.create({
      email,
      supabaseUserId,
      firstName,
      lastName,
      emailVerified: true, // Verified by Supabase
      isActive: true,
      status: 'active',
      passwordHash: '', // No password for Supabase users
    });

    try {
      const savedUser = await this.usersRepository.save(newUser);
      
      // Assign default "candidate" role to new OAuth users
      const candidateRole = this.userRolesRepository.create({
        userId: savedUser.id,
        roleType: 'candidate',
        scope: 'individual',
        scopeEntityId: savedUser.id,
      });
      await this.userRolesRepository.save(candidateRole);
      
      // Reload user with roles
      return await this.usersRepository.findOne({
        where: { id: savedUser.id },
        relations: ['userRoles'],
      });
    } catch (error) {
      // Handle race condition: another request may have created this user
      // between our check and save operation
      if (error.code === '23505') { // PostgreSQL unique violation error code
        // User was created by concurrent request, fetch and return it (ignore soft-deleted)
        const existingUser = await this.usersRepository.findOne({
          where: { email, deletedAt: IsNull() },
          relations: ['userRoles'],
        });
        
        if (existingUser) {
          // Link to Supabase if not already linked
          if (!existingUser.supabaseUserId) {
            existingUser.supabaseUserId = supabaseUserId;
            await this.usersRepository.save(existingUser);
          }
          return existingUser;
        }
      }
      
      // Re-throw if it's a different error
      throw error;
    }
  }

  /**
   * Link existing Portal account to Supabase account
   */
  async linkAccount(portalUserId: string, supabaseAccessToken: string) {
    // 1. Verify Supabase token
    const supabasePayload = await this.supabaseService.verifyToken(
      supabaseAccessToken,
    );

    // 2. Find Portal user
    const user = await this.usersRepository.findOne({
      where: { id: portalUserId },
    });

    if (!user) {
      throw new NotFoundException('Portal user not found');
    }

    // 3. Check if email matches
    if (user.email !== supabasePayload.email) {
      throw new ConflictException('Email mismatch between Portal and Supabase');
    }

    // 4. Check if already linked
    if (user.supabaseUserId) {
      throw new ConflictException('User already linked to Supabase account');
    }

    // 5. Link accounts
    user.supabaseUserId = supabasePayload.sub;
    await this.usersRepository.save(user);

    return { success: true, message: 'Accounts linked successfully' };
  }
}
