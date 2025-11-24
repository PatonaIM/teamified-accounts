import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { AuthCodeStorageService } from '../auth/services/auth-code-storage.service';
import { OAuthClientsService } from '../oauth-clients/oauth-clients.service';
import { JwtTokenService } from '../auth/services/jwt.service';
import { UserService } from '../users/services/user.service';
import { UserRolesService } from '../user-roles/services/user-roles.service';
import { AuthorizeDto } from './dto/authorize.dto';
import { TokenExchangeDto, TokenResponseDto } from './dto/token.dto';
import { createHash, randomUUID } from 'crypto';
import { IntentType } from '../oauth-clients/entities/oauth-client.entity';

@Injectable()
export class SsoService {
  private readonly logger = new Logger(SsoService.name);

  constructor(
    private readonly authCodeStorage: AuthCodeStorageService,
    private readonly oauthClientsService: OAuthClientsService,
    private readonly jwtTokenService: JwtTokenService,
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
    const redirectUris = Array.isArray(client.redirect_uris)
      ? client.redirect_uris
      : [client.redirect_uris];

    if (redirectUris.length === 0) {
      throw new BadRequestException('No redirect URI configured for this client');
    }

    const redirectUri = redirectUris[0];

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
    const redirectUris = Array.isArray(client.redirect_uris)
      ? client.redirect_uris
      : [client.redirect_uris];

    if (!redirectUris.includes(redirect_uri)) {
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
   * Token Exchange: Exchange auth code for JWT
   */
  async exchangeToken(tokenDto: TokenExchangeDto): Promise<TokenResponseDto> {
    const { grant_type, code, client_id, client_secret, redirect_uri, code_verifier } = tokenDto;

    // Validate grant type
    if (grant_type !== 'authorization_code') {
      throw new BadRequestException('Unsupported grant_type');
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
      // Hash the provided secret to compare with stored hash
      const hashedSecret = createHash('sha256').update(client_secret).digest('hex');
      if (client.client_secret !== hashedSecret) {
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

    // Get user roles
    const userRoles = await this.userRolesService.getUserRoles(user.id);

    this.logger.log(
      `Token exchanged for user ${user.id} (${user.email}) via client ${client_id}`,
    );

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour
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
   * Validate user type against effective intent
   * Returns error redirect URL if access should be denied, null otherwise
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
}
