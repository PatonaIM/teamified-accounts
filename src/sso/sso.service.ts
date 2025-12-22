import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthCodeStorageService } from '../auth/services/auth-code-storage.service';
import { OAuthClientsService } from '../oauth-clients/oauth-clients.service';
import { JwtTokenService } from '../auth/services/jwt.service';
import { SessionService } from '../auth/services/session.service';
import { UserService } from '../users/services/user.service';
import { UserRolesService } from '../user-roles/services/user-roles.service';
import { AuthorizeDto } from './dto/authorize.dto';
import { TokenExchangeDto, TokenResponseDto, ClientCredentialsTokenResponseDto } from './dto/token.dto';
import { RecordActivityDto } from './dto/user-activity.dto';
import { createHash, randomUUID } from 'crypto';
import { IntentType } from '../oauth-clients/entities/oauth-client.entity';
import { UserOAuthLogin } from './entities/user-oauth-login.entity';
import { UserAppActivity } from './entities/user-app-activity.entity';
import { getUriStrings } from '../oauth-clients/oauth-client.utils';

@Injectable()
export class SsoService {
  private readonly logger = new Logger(SsoService.name);

  constructor(
    @InjectRepository(UserOAuthLogin)
    private readonly userOAuthLoginRepository: Repository<UserOAuthLogin>,
    @InjectRepository(UserAppActivity)
    private readonly userAppActivityRepository: Repository<UserAppActivity>,
    private readonly authCodeStorage: AuthCodeStorageService,
    private readonly oauthClientsService: OAuthClientsService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly userRolesService: UserRolesService,
  ) {}

  /**
   * Launch SSO: Simplified SSO initiation with automatic redirect URI selection
   */
  async launchSso(userId: string, clientId: string): Promise<string> {
    // Validate OAuth client
    const client = await this.oauthClientsService.findByClientId(clientId);
    if (!client) {
      throw new NotFoundException('OAuth client not found');
    }

    if (!client.is_active) {
      throw new BadRequestException('OAuth client is not active');
    }

    // Get first redirect URI
    const uriStrings = getUriStrings(client);

    if (uriStrings.length === 0) {
      throw new BadRequestException('No redirect URI configured for this client');
    }

    const redirectUri = uriStrings[0];

    // Generate state for CSRF protection
    const state = randomUUID();

    // Use the standard authorize flow
    return this.authorize(userId, {
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
    });
  }

  /**
   * Authorize: Create auth code and redirect to SSO app
   */
  async authorize(userId: string, authorizeDto: AuthorizeDto): Promise<string> {
    const { client_id, redirect_uri, state, code_challenge, code_challenge_method, intent } = authorizeDto;

    // Validate OAuth client
    const client = await this.oauthClientsService.findByClientId(client_id);
    if (!client) {
      throw new NotFoundException('OAuth client not found');
    }

    if (!client.is_active) {
      throw new BadRequestException('OAuth client is not active');
    }

    // Validate redirect URI
    if (!this.oauthClientsService.validateRedirectUri(client, redirect_uri)) {
      throw new BadRequestException('Invalid redirect_uri');
    }

    // Validate PKCE if present
    if (code_challenge) {
      if (!code_challenge_method || !['S256', 'plain'].includes(code_challenge_method)) {
        throw new BadRequestException('Invalid code_challenge_method');
      }
    }

    // Resolve effective intent and validate user access
    const effectiveIntent = this.resolveEffectiveIntent(client.default_intent, intent);
    const errorRedirect = await this.validateUserIntent(userId, effectiveIntent, client_id, redirect_uri, state);
    
    if (errorRedirect) {
      this.logger.log(
        `User ${userId} access denied for intent ${effectiveIntent}, redirecting with OAuth error`,
      );
      return errorRedirect;
    }

    // Create authorization code
    const authCode = await this.authCodeStorage.createAuthCode({
      userId,
      clientId: client_id,
      redirectUri: redirect_uri,
      state,
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
    });

    // Build redirect URL with auth code
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('code', authCode);
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }

    this.logger.log(
      `SSO authorization granted for user ${userId} to client ${client_id} with intent ${effectiveIntent}`,
    );

    return redirectUrl.toString();
  }

  /**
   * Token Exchange: Exchange auth code or client credentials for JWT
   */
  async exchangeToken(tokenDto: TokenExchangeDto): Promise<TokenResponseDto | ClientCredentialsTokenResponseDto> {
    const { grant_type, client_id } = tokenDto;

    // Route to appropriate handler based on grant type
    if (grant_type === 'client_credentials') {
      return this.handleClientCredentialsGrant(tokenDto);
    }

    return this.handleAuthorizationCodeGrant(tokenDto);
  }

  /**
   * Handle Authorization Code Grant (user-interactive OAuth flow)
   */
  private async handleAuthorizationCodeGrant(tokenDto: TokenExchangeDto): Promise<TokenResponseDto> {
    const { code, client_id, client_secret, redirect_uri, code_verifier } = tokenDto;

    if (!code) {
      throw new BadRequestException('Authorization code is required for authorization_code grant');
    }

    if (!redirect_uri) {
      throw new BadRequestException('redirect_uri is required for authorization_code grant');
    }

    // Validate OAuth client
    const client = await this.oauthClientsService.findByClientId(client_id);
    if (!client) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    if (!client.is_active) {
      throw new UnauthorizedException('Client is not active');
    }

    // Verify client secret (if provided)
    if (client_secret) {
      // Compare directly - secrets are stored as plaintext hex strings
      if (client.client_secret !== client_secret) {
        throw new UnauthorizedException('Invalid client credentials');
      }
    }

    // Validate and consume auth code
    const authCodeData = await this.authCodeStorage.validateAndConsumeCode(code);
    if (!authCodeData) {
      throw new UnauthorizedException('Invalid or expired authorization code');
    }

    // Verify client_id matches
    if (authCodeData.clientId !== client_id) {
      throw new UnauthorizedException('Client ID mismatch');
    }

    // Verify redirect_uri matches
    if (authCodeData.redirectUri !== redirect_uri) {
      throw new UnauthorizedException('Redirect URI mismatch');
    }

    // Validate PKCE if code challenge was provided
    if (authCodeData.codeChallenge) {
      if (!code_verifier) {
        throw new BadRequestException('code_verifier required for PKCE flow');
      }

      const isValid = this.verifyPKCE(
        code_verifier,
        authCodeData.codeChallenge,
        authCodeData.codeChallengeMethod,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid code_verifier');
      }
    }

    // Get user data
    const user = await this.userService.findOne(authCodeData.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate JWT tokens with client name from OAuth client
    const accessToken = await this.jwtTokenService.generateAccessToken(user, client.name);
    const tokenFamily = randomUUID();
    const refreshToken = this.jwtTokenService.generateRefreshToken(user, tokenFamily);

    // Create session for refresh token support (required for token refresh to work)
    // Pass the tokenFamily to ensure session and refresh token are aligned
    await this.sessionService.createSession(user, refreshToken, {
      ip: 'sso-client',
      userAgent: `OAuth Client: ${client.name}`,
    }, tokenFamily);

    // Get user roles
    const userRoles = await this.userRolesService.getUserRoles(user.id);

    // Record OAuth login for connected applications tracking
    await this.recordOAuthLogin(user.id, client.id);

    this.logger.log(
      `Token exchanged for user ${user.id} (${user.email}) via client ${client_id}`,
    );

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 259200, // 72 hours in seconds
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: userRoles.length > 0 ? userRoles : ['client_employee'],
      },
    };
  }

  /**
   * Handle Client Credentials Grant (service-to-service authentication)
   * This flow is for machine-to-machine API access without a user context
   */
  private async handleClientCredentialsGrant(tokenDto: TokenExchangeDto): Promise<ClientCredentialsTokenResponseDto> {
    const { client_id, client_secret, scope } = tokenDto;

    if (!client_secret) {
      throw new BadRequestException('client_secret is required for client_credentials grant');
    }

    // Validate OAuth client
    const client = await this.oauthClientsService.findByClientId(client_id);
    if (!client) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    if (!client.is_active) {
      throw new UnauthorizedException('Client is not active');
    }

    // Check if client credentials grant is enabled for this client
    if (!client.allow_client_credentials) {
      throw new ForbiddenException('Client credentials grant is not enabled for this client');
    }

    // Verify client secret (required for client credentials grant)
    // Compare directly - secrets are stored as plaintext hex strings
    if (client.client_secret !== client_secret) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    // Validate and filter requested scopes against allowed scopes
    const allowedScopes = client.allowed_scopes || [];
    const requestedScopes = scope || allowedScopes;
    
    // If scopes were requested, validate they are all allowed
    const grantedScopes = requestedScopes.filter(s => allowedScopes.includes(s));
    
    if (requestedScopes.length > 0 && grantedScopes.length === 0) {
      throw new ForbiddenException('None of the requested scopes are allowed for this client');
    }

    // Generate service access token (no user context)
    const accessToken = this.jwtTokenService.generateServiceToken({
      clientId: client.client_id,
      clientName: client.name,
      scopes: grantedScopes,
    });

    this.logger.log(
      `Client credentials token issued for client ${client_id} with scopes: ${grantedScopes.join(', ')}`,
    );

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour for service tokens
      scope: grantedScopes,
      client: {
        id: client.client_id,
        name: client.name,
      },
    };
  }

  /**
   * Record OAuth login for tracking connected applications
   */
  private async recordOAuthLogin(userId: string, oauthClientId: string): Promise<void> {
    try {
      const now = new Date();
      
      // Check if login record already exists
      let loginRecord = await this.userOAuthLoginRepository.findOne({
        where: {
          user_id: userId,
          oauth_client_id: oauthClientId,
        },
      });

      if (loginRecord) {
        // Update existing record
        loginRecord.login_count += 1;
        loginRecord.last_login_at = now;
        await this.userOAuthLoginRepository.save(loginRecord);
        this.logger.debug(`Updated OAuth login record for user ${userId} on client ${oauthClientId}`);
      } else {
        // Create new record
        loginRecord = this.userOAuthLoginRepository.create({
          user_id: userId,
          oauth_client_id: oauthClientId,
          login_count: 1,
          first_login_at: now,
          last_login_at: now,
        });
        await this.userOAuthLoginRepository.save(loginRecord);
        this.logger.debug(`Created OAuth login record for user ${userId} on client ${oauthClientId}`);
      }
    } catch (error) {
      // Log but don't fail the token exchange if tracking fails
      this.logger.warn(`Failed to record OAuth login: ${error.message}`);
    }
  }

  /**
   * Verify PKCE code challenge
   */
  private verifyPKCE(
    verifier: string,
    challenge: string,
    method: string,
  ): boolean {
    if (method === 'plain') {
      return verifier === challenge;
    }

    if (method === 'S256') {
      const hash = createHash('sha256').update(verifier).digest('base64url');
      return hash === challenge;
    }

    return false;
  }

  /**
   * Resolve effective intent by applying intersection logic
   * The default_intent from OAuth client is authoritative
   * Runtime intent can only narrow, never widen access
   */
  private resolveEffectiveIntent(
    defaultIntent: IntentType,
    runtimeIntent?: IntentType,
  ): IntentType {
    if (!runtimeIntent) {
      return defaultIntent;
    }

    if (defaultIntent === 'both') {
      return runtimeIntent;
    }

    if (runtimeIntent !== defaultIntent && runtimeIntent !== 'both') {
      this.logger.warn(
        `Attempted intent escalation: default=${defaultIntent}, runtime=${runtimeIntent}. Using default.`,
      );
    }

    return defaultIntent;
  }

  /**
   * Check if user is an internal user (super_admin or internal_* roles)
   * Internal users bypass all intent restrictions
   */
  private isInternalUser(user: { userRoles?: Array<{ roleType: string }> }): boolean {
    if (!user.userRoles || user.userRoles.length === 0) {
      return false;
    }

    return user.userRoles.some(role => 
      role.roleType === 'super_admin' || 
      role.roleType.startsWith('internal_')
    );
  }

  /**
   * Validate user type against effective intent
   * Returns error redirect URL if access should be denied, null otherwise
   * Internal users (super_admin, internal_*) bypass all intent restrictions
   */
  private async validateUserIntent(
    userId: string,
    effectiveIntent: IntentType,
    clientId: string,
    redirectUri: string,
    state?: string,
  ): Promise<string | null> {
    if (effectiveIntent === 'both') {
      return null;
    }

    const user = await this.userService.findOne(userId);
    
    // Internal users bypass all intent restrictions
    if (this.isInternalUser(user)) {
      this.logger.log(
        `Internal user ${userId} (${user.email}) bypassing intent restriction for client ${clientId}`,
      );
      return null;
    }

    const userType = this.userService.classifyUserType(user);

    this.logger.log(
      `Intent validation: user=${userId} (${user.email}), userType=${userType}, effectiveIntent=${effectiveIntent}, clientId=${clientId}`,
    );

    if (userType === effectiveIntent) {
      return null;
    }

    if (effectiveIntent === 'client' && userType === 'candidate') {
      this.logger.warn(
        `Candidate user ${userId} (${user.email}) attempted to access client-only app ${clientId}. Returning access_denied error.`,
      );
      
      const errorUrl = new URL(redirectUri);
      errorUrl.searchParams.set('error', 'access_denied');
      errorUrl.searchParams.set('error_description', 'This application is for client organizations only. Please create or join a client organization to access this portal.');
      if (state) {
        errorUrl.searchParams.set('state', state);
      }
      
      return errorUrl.toString();
    }

    if (effectiveIntent === 'candidate' && userType === 'client') {
      this.logger.warn(
        `Client user ${userId} (${user.email}) attempted to access candidate-only app ${clientId}. Returning access_denied error.`,
      );
      
      const errorUrl = new URL(redirectUri);
      errorUrl.searchParams.set('error', 'access_denied');
      errorUrl.searchParams.set('error_description', 'This application is for candidates only. Please use a candidate account to access this portal.');
      if (state) {
        errorUrl.searchParams.set('state', state);
      }
      
      return errorUrl.toString();
    }

    return null;
  }

  /**
   * Record user activity from an OAuth client application
   * Called by OAuth clients to track user actions within their app
   */
  async recordUserActivity(
    userId: string,
    oauthClientId: string,
    activityDto: RecordActivityDto,
  ): Promise<{ id: string; createdAt: string }> {
    // Verify OAuth client exists
    const client = await this.oauthClientsService.findOne(oauthClientId);
    if (!client) {
      throw new NotFoundException('OAuth client not found');
    }

    // Verify user exists
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create activity record
    const activity = this.userAppActivityRepository.create({
      user_id: userId,
      oauth_client_id: oauthClientId,
      action: activityDto.action,
      feature: activityDto.feature,
      description: activityDto.description,
      metadata: activityDto.metadata,
    });

    const savedActivity = await this.userAppActivityRepository.save(activity);

    this.logger.debug(
      `Recorded activity for user ${userId} in app ${client.name}: ${activityDto.action}`,
    );

    return {
      id: savedActivity.id,
      createdAt: savedActivity.created_at.toISOString(),
    };
  }

  /**
   * Get OAuth client by client_id (for activity recording endpoint)
   */
  async getOAuthClientByClientId(clientId: string) {
    return this.oauthClientsService.findByClientId(clientId);
  }

  /**
   * Validate client credentials using the OAuth clients service
   * This provides consistent credential validation across the application
   */
  async validateClientCredentials(clientId: string, clientSecret: string) {
    return this.oauthClientsService.validateClient(clientId, clientSecret);
  }

  /**
   * SSO Logout: Revoke user sessions and optionally redirect back to client
   * 
   * This endpoint handles RP-initiated logout for OAuth 2.0 clients.
   * It revokes all user sessions, clears cookies, and redirects to the post_logout_redirect_uri.
   */
  async logout(
    userId: string | null,
    postLogoutRedirectUri?: string,
    clientId?: string,
    state?: string,
    idTokenHint?: string,
  ): Promise<{ redirectUrl: string | null; message: string }> {
    // Try to extract userId from id_token_hint if not already provided
    // SECURITY: Only trust id_token_hint when we can verify it
    let effectiveUserId = userId;
    
    if (!effectiveUserId && idTokenHint) {
      // SECURITY: Only trust id_token_hint if we can verify its signature
      // This prevents attackers from forging tokens to logout arbitrary users
      try {
        const payload = this.jwtTokenService.validateAccessToken(idTokenHint);
        if (payload && payload.sub) {
          effectiveUserId = payload.sub;
          this.logger.log(`SSO logout: Identified user ${effectiveUserId} from verified id_token_hint`);
        }
      } catch {
        // Token verification failed - do NOT trust the token
        // Even with a valid client_id, we cannot safely use an unverified token
        // as attackers could forge tokens to logout arbitrary users
        this.logger.warn(`SSO logout: id_token_hint signature verification failed - ignoring hint`);
      }
    }
    
    // If we have a userId, revoke all their sessions
    if (effectiveUserId) {
      await this.sessionService.revokeAllUserSessions(effectiveUserId);
      this.logger.log(`SSO logout: Revoked all sessions for user ${effectiveUserId}`);
    }

    // Validate redirect URI if provided
    // SECURITY: Only allow redirects to registered OAuth client URIs or exact allowlist matches
    let validatedRedirectUri: string | null = null;
    
    if (postLogoutRedirectUri) {
      if (clientId) {
        // If client_id is provided, validate the redirect URI against registered URIs
        const client = await this.oauthClientsService.findByClientId(clientId);
        if (client && client.is_active) {
          const uriStrings = getUriStrings(client);
          
          // Check if the post_logout_redirect_uri matches any registered redirect URI
          // Allow both exact match and origin match for flexibility
          const postLogoutOrigin = new URL(postLogoutRedirectUri).origin;
          const isValidRedirect = uriStrings.some(uri => {
            try {
              return uri === postLogoutRedirectUri || new URL(uri).origin === postLogoutOrigin;
            } catch {
              return false;
            }
          });
          
          if (isValidRedirect) {
            validatedRedirectUri = postLogoutRedirectUri;
          } else {
            this.logger.warn(
              `SSO logout: post_logout_redirect_uri ${postLogoutRedirectUri} not in allowed list for client ${clientId}`,
            );
          }
        }
      } else {
        // SECURITY: Without client_id, only allow redirects to exact known safe origins
        // Using strict equality to prevent subdomain/prefix attacks (e.g. accounts.teamified.com.evil.com)
        try {
          const redirectOrigin = new URL(postLogoutRedirectUri).origin;
          
          // Strict allowlist - exact origin equality only
          const allowedOrigins = new Set([
            'https://accounts.teamified.com',
            'https://teamified.com',
            'http://localhost:5000',
            'http://localhost:3000',
          ]);
          
          if (allowedOrigins.has(redirectOrigin)) {
            validatedRedirectUri = postLogoutRedirectUri;
          } else {
            this.logger.warn(
              `SSO logout: post_logout_redirect_uri ${postLogoutRedirectUri} rejected - client_id required for external redirects`,
            );
          }
        } catch {
          this.logger.warn(`SSO logout: Invalid post_logout_redirect_uri URL format`);
        }
      }
    }

    // Append state to redirect URL if provided
    if (validatedRedirectUri && state) {
      const url = new URL(validatedRedirectUri);
      url.searchParams.set('state', state);
      validatedRedirectUri = url.toString();
    }

    return {
      redirectUrl: validatedRedirectUri,
      message: userId ? 'Logged out successfully' : 'Session cleared',
    };
  }
}
