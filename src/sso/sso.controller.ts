import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  HttpCode,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Throttle } from '@nestjs/throttler';
import { SsoService } from './sso.service';
import { MarketingRedirectService } from './marketing-redirect.service';
import { AuthorizeDto } from './dto/authorize.dto';
import { TokenExchangeDto } from './dto/token.dto';
import { RecordActivityDto } from './dto/user-activity.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../auth/entities/user.entity';
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions, getClearCookieOptions } from '../common/utils/cookie.utils';

@Controller('v1/sso')
export class SsoController {
  constructor(
    private readonly ssoService: SsoService,
    private readonly marketingRedirectService: MarketingRedirectService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * SSO Launch Endpoint
   * GET /api/v1/sso/launch/:clientId
   * 
   * Simplified SSO initiation - automatically determines redirect URI
   * Returns redirect URL as JSON for client-side navigation
   */
  @Get('launch/:clientId')
  @UseGuards(JwtAuthGuard)
  async launch(
    @Param('clientId') clientId: string,
    @Req() req: any,
  ) {
    const userId = req.user.sub;

    // Get redirect URL with auto-determined redirect URI
    const redirectUrl = await this.ssoService.launchSso(userId, clientId);

    // Return redirect URL as JSON so frontend can navigate
    return { redirectUrl };
  }

  /**
   * Marketing Redirect Endpoint
   * GET /api/v1/sso/marketing-redirect?source=marketing|marketing-dev
   * 
   * Called after signup from marketing site to redirect users to the appropriate portal
   * based on their user type (client/candidate) and the source environment.
   * 
   * - source=marketing -> redirect to production portal
   * - source=marketing-dev -> redirect to staging portal
   * 
   * Returns JSON with redirect information for frontend to handle.
   */
  @Get('marketing-redirect')
  @UseGuards(JwtAuthGuard)
  async marketingRedirect(
    @Query('source') source: string,
    @Req() req: any,
  ) {
    const userId = req.user.sub;

    if (!this.marketingRedirectService.isMarketingSource(source)) {
      return {
        shouldRedirect: false,
        fallbackUrl: '/account/profile',
        error: 'Invalid source parameter',
      };
    }

    const result = await this.marketingRedirectService.getRedirectForUser(userId, source);

    if (!result.shouldRedirect) {
      return {
        shouldRedirect: false,
        fallbackUrl: '/account/profile',
        error: result.error,
      };
    }

    return {
      shouldRedirect: true,
      redirectUrl: result.redirectUrl,
      clientId: result.clientId,
    };
  }

  /**
   * SSO Authorization Endpoint (Public - Standard OAuth 2.0)
   * GET /api/v1/sso/authorize?client_id=...&redirect_uri=...&state=...
   * 
   * This is the standard OAuth 2.0 authorization endpoint.
   * Handles both authenticated and unauthenticated users:
   * - If user is logged in: generates auth code and redirects to app
   * - If user is NOT logged in: redirects to Portal login, then back to authorize
   */
  @Get('authorize')
  async authorizePublic(
    @Query() authorizeDto: AuthorizeDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    // Manually check for JWT in cookies OR Authorization header (since we don't use JwtAuthGuard on this public endpoint)
    let user = req.user; // Will be undefined without guard
    let token: string | undefined;
    
    // Try to extract JWT from Authorization header first (primary method)
    if (!user) {
      const authHeader = req.headers?.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (req.cookies?.access_token) {
        // Fallback: Check for JWT in cookie
        token = req.cookies.access_token;
      }
      
      if (token) {
        try {
          user = this.jwtService.verify(token);
          console.log('[SSO] Verified user from JWT:', user.sub);
        } catch (error) {
          console.log('[SSO] Invalid or expired JWT:', error.message);
        }
      }
    }

    console.log('[SSO] Authorization request:', {
      clientId: authorizeDto.client_id,
      redirectUri: authorizeDto.redirect_uri,
      isAuthenticated: !!user,
      userId: user?.sub,
      hasAuthHeader: !!req.headers?.authorization,
      hasCookie: !!req.cookies?.access_token,
    });

    if (!user || !user.sub) {
      // If prompt=none, return error instead of redirecting to login (silent SSO check)
      if (authorizeDto.prompt === 'none') {
        // Validate client and redirect_uri before returning error (prevent open redirect)
        const client = await this.ssoService.validateClientAndRedirectUri(
          authorizeDto.client_id,
          authorizeDto.redirect_uri,
        );
        if (!client) {
          console.log('[SSO] prompt=none: Invalid client_id or redirect_uri');
          throw new BadRequestException('Invalid client_id or redirect_uri');
        }

        const errorUrl = new URL(authorizeDto.redirect_uri);
        errorUrl.searchParams.set('error', 'login_required');
        errorUrl.searchParams.set('error_description', 'User is not authenticated');
        if (authorizeDto.state) {
          errorUrl.searchParams.set('state', authorizeDto.state);
        }
        console.log('[SSO] prompt=none but user not authenticated, returning login_required error');
        return res.redirect(HttpStatus.FOUND, errorUrl.toString());
      }

      // User not authenticated - redirect to login with return URL
      const returnUrl = encodeURIComponent(
        `/api/v1/sso/authorize?${new URLSearchParams(authorizeDto as any).toString()}`
      );
      console.log('[SSO] User not authenticated, redirecting to login with returnUrl:', returnUrl);
      return res.redirect(HttpStatus.FOUND, `/login?returnUrl=${returnUrl}`);
    }

    // User is authenticated - generate auth code and redirect
    const userId = user.sub;
    console.log('[SSO] User authenticated, generating auth code for user:', userId);
    const redirectUrl = await this.ssoService.authorize(userId, authorizeDto);
    console.log('[SSO] Redirecting to app with auth code:', redirectUrl);

    return res.redirect(HttpStatus.FOUND, redirectUrl);
  }

  /**
   * SSO Authorization Endpoint (Authenticated - Internal Use)
   * GET /api/v1/sso/authorize-authenticated?client_id=...&redirect_uri=...&state=...
   * 
   * Requires authentication. Used internally when user is already logged in.
   */
  @Get('authorize-authenticated')
  @UseGuards(JwtAuthGuard)
  async authorizeAuthenticated(
    @Query() authorizeDto: AuthorizeDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user.sub;
    const redirectUrl = await this.ssoService.authorize(userId, authorizeDto);
    return res.redirect(HttpStatus.FOUND, redirectUrl);
  }

  /**
   * Token Exchange Endpoint
   * POST /api/v1/sso/token
   * 
   * SSO app exchanges auth code for JWT access token
   * Body: { grant_type, code, client_id, client_secret, redirect_uri }
   * 
   * Also sets httpOnly cookies on the shared domain for cross-app SSO
   */
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per 60 seconds
  async token(
    @Body() tokenDto: TokenExchangeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokenResponse = await this.ssoService.exchangeToken(tokenDto);
    
    // Set httpOnly cookies on shared domain for cross-app SSO
    // This allows other Teamified apps to detect the session
    res.cookie('access_token', tokenResponse.access_token, getAccessTokenCookieOptions(tokenResponse.expires_in * 1000));
    // Only set refresh_token cookie for authorization code grant (not client credentials)
    if ('refresh_token' in tokenResponse && tokenResponse.refresh_token) {
      res.cookie('refresh_token', tokenResponse.refresh_token, getRefreshTokenCookieOptions());
    }
    
    return tokenResponse;
  }

  /**
   * User Info Endpoint
   * GET /api/v1/sso/me
   * 
   * Returns authenticated user information using the access token
   * Used by SSO client apps to fetch user details after authentication
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Req() req: any) {
    const userId = req.user.sub;
    
    // Return user information from JWT payload including profile fields
    return {
      id: userId,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      fullName: req.user.fullName || null,
      initials: req.user.initials || null,
      profilePicture: req.user.profilePicture || null,
      phoneNumber: req.user.phoneNumber || null,
      emailVerified: req.user.emailVerified ?? false,
      isActive: req.user.isActive ?? true,
      roles: req.user.roles || [],
    };
  }

  /**
   * Session Check Endpoint
   * GET /api/v1/sso/session
   * 
   * Checks if a valid SSO session exists via the shared cookie.
   * Client apps can call this endpoint to detect if the user is already
   * logged in via another Teamified app, enabling true cross-app SSO.
   * 
   * Returns:
   * - 200 with user info if valid session exists
   * - 401 if no valid session
   */
  @Get('session')
  async checkSession(@Req() req: any) {
    let token: string | undefined;
    
    // Check Authorization header first
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.access_token) {
      // Fallback: Check for JWT in shared cookie
      token = req.cookies.access_token;
    }
    
    if (!token) {
      throw new UnauthorizedException('No session found');
    }
    
    try {
      const payload = this.jwtService.verify(token);
      
      // Check user exists and global logout timestamp
      // If user is deleted or token was issued before global logout, reject it
      // This enables true SSO logout across all clients
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'globalLogoutAt'],
      });
      
      // Reject tokens for deleted/non-existent users
      if (!user) {
        throw new UnauthorizedException('User account not found. Please log in again.');
      }
      
      // Reject tokens issued before global logout
      if (user.globalLogoutAt) {
        const tokenIssuedAt = new Date(payload.iat * 1000);
        if (tokenIssuedAt < user.globalLogoutAt) {
          throw new UnauthorizedException('Session has been terminated. Please log in again.');
        }
      }
      
      return {
        authenticated: true,
        user: {
          id: payload.sub,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          fullName: payload.fullName || null,
          initials: payload.initials || null,
          profilePicture: payload.profilePicture || null,
          phoneNumber: payload.phoneNumber || null,
          emailVerified: payload.emailVerified ?? false,
          isActive: payload.isActive ?? true,
          roles: payload.roles || [],
        },
        expiresAt: new Date(payload.exp * 1000).toISOString(),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired session');
    }
  }

  /**
   * Clear SSO Session
   * POST /api/v1/sso/clear-session
   * 
   * Clears the SSO authentication cookie for testing purposes
   * Used by the SSO test application to reset authentication state
   */
  @Post('clear-session')
  @HttpCode(HttpStatus.OK)
  async clearSession(@Res() res: Response) {
    // Clear the httpOnly cookies using shared domain settings
    res.clearCookie('access_token', getClearCookieOptions());
    res.clearCookie('refresh_token', getClearCookieOptions());
    
    return res.json({ message: 'Session cleared successfully' });
  }

  /**
   * SSO Logout Endpoint (RP-Initiated Logout)
   * GET /api/v1/sso/logout
   * 
   * Centralized logout endpoint for OAuth 2.0 clients.
   * Clears all user sessions (cookies + database) and optionally redirects back to client.
   * 
   * Front-channel logout: Renders an HTML page with hidden iframes that call each
   * registered client's logout_uri to propagate the logout across all connected apps.
   * 
   * Query Parameters:
   * - post_logout_redirect_uri: (optional) URL to redirect after logout
   * - id_token_hint: (optional) The ID token for user identification
   * - client_id: (optional) OAuth client ID for redirect URI validation
   * - state: (optional) State parameter to pass back to client
   * 
   * Usage by client apps:
   * 1. Clear local tokens (localStorage/sessionStorage)
   * 2. Redirect user to: /api/v1/sso/logout?post_logout_redirect_uri=https://myapp.com/logged-out
   * 3. User lands back on client app, fully logged out everywhere
   */
  @Get('logout')
  async logout(
    @Query() logoutDto: LogoutDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    console.log('[SSO] Logout request received:', {
      hasIdTokenHint: !!logoutDto.id_token_hint,
      idTokenHintLength: logoutDto.id_token_hint?.length,
      postLogoutRedirectUri: logoutDto.post_logout_redirect_uri,
      clientId: logoutDto.client_id,
      hasCookie: !!req.cookies?.access_token,
      hasAuthHeader: !!req.headers?.authorization,
    });
    
    // Try to identify user from cookie or Authorization header
    let userId: string | null = null;
    let token: string | undefined;
    
    // Check Authorization header first
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.access_token) {
      // Fallback: Check for JWT in cookie
      token = req.cookies.access_token;
    }
    
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        userId = payload.sub;
        console.log('[SSO] Logout: Identified user from JWT:', userId);
      } catch (error) {
        console.log('[SSO] Logout: Could not verify JWT:', error.message);
      }
    } else {
      console.log('[SSO] Logout: No token found from cookie or header');
    }

    // Perform logout (revoke sessions in database)
    // Pass id_token_hint so service can identify user when cookies are not present
    const result = await this.ssoService.logout(
      userId,
      logoutDto.post_logout_redirect_uri,
      logoutDto.client_id,
      logoutDto.state,
      logoutDto.id_token_hint,
    );

    // Clear the httpOnly cookies using shared domain settings for cross-app SSO logout
    res.clearCookie('access_token', getClearCookieOptions());
    res.clearCookie('refresh_token', getClearCookieOptions());

    console.log('[SSO] Logout complete:', {
      userId,
      redirectUrl: result.redirectUrl,
      frontChannelLogoutCount: result.frontChannelLogoutUris.length,
    });

    // If there are clients with logout URIs, render the front-channel logout page
    // This page loads hidden iframes for each client to propagate the logout
    if (result.frontChannelLogoutUris.length > 0) {
      const finalRedirectUrl = result.redirectUrl || '/login?logged_out=true';
      const logoutHtml = this.generateFrontChannelLogoutPage(
        result.frontChannelLogoutUris,
        finalRedirectUrl,
      );
      
      // SECURITY: Build CSP frame-src allowlist from validated logout URIs
      const frameOrigins = result.frontChannelLogoutUris
        .map(client => {
          try {
            return new URL(client.logoutUri).origin;
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .join(' ');
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      // CSP: Only allow iframes from validated logout URI origins
      res.setHeader(
        'Content-Security-Policy', 
        `default-src 'self'; frame-src ${frameOrigins}; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'`,
      );
      return res.send(logoutHtml);
    }

    // If no front-channel logout needed and a valid redirect URL was provided, redirect the user
    if (result.redirectUrl) {
      return res.redirect(HttpStatus.FOUND, result.redirectUrl);
    }

    // Otherwise, return JSON response
    return res.json({
      success: true,
      message: result.message,
    });
  }

  /**
   * Generate the front-channel logout HTML page
   * This page renders hidden iframes to each client's logout_uri and redirects after all load
   */
  private generateFrontChannelLogoutPage(
    logoutUris: Array<{ clientId: string; name: string; logoutUri: string }>,
    finalRedirectUrl: string,
  ): string {
    const iframeHtml = logoutUris
      .map((client, index) => 
        `<iframe 
          id="logout-frame-${index}" 
          src="${this.escapeHtml(client.logoutUri)}" 
          style="display:none; width:0; height:0; border:0;" 
          sandbox="allow-scripts allow-same-origin"
          referrerpolicy="no-referrer"
          onload="frameLoaded(${index})"
          onerror="frameLoaded(${index})"
        ></iframe>`
      )
      .join('\n      ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signing out...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h2 { margin-bottom: 0.5rem; }
    p { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Signing out...</h2>
    <p>Please wait while we sign you out of all applications.</p>
  </div>
  
  <!-- Hidden iframes for front-channel logout -->
  <div style="display:none;">
    ${iframeHtml}
  </div>
  
  <script>
    var totalFrames = ${logoutUris.length};
    var loadedFrames = 0;
    var timeoutMs = 3000; // 3 second timeout
    var redirectUrl = "${this.escapeHtml(finalRedirectUrl)}";
    
    function frameLoaded(index) {
      loadedFrames++;
      console.log('[SSO Logout] Frame ' + index + ' loaded (' + loadedFrames + '/' + totalFrames + ')');
      
      if (loadedFrames >= totalFrames) {
        console.log('[SSO Logout] All frames loaded, redirecting...');
        redirect();
      }
    }
    
    function redirect() {
      window.location.href = redirectUrl;
    }
    
    // Fallback: redirect after timeout even if some iframes fail
    setTimeout(function() {
      console.log('[SSO Logout] Timeout reached, redirecting...');
      redirect();
    }, timeoutMs);
  </script>
</body>
</html>`;
  }

  /**
   * Escape HTML to prevent XSS in generated logout page
   */
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Record User Activity
   * POST /api/v1/sso/user-activity
   * 
   * OAuth clients use this endpoint to record user activity within their application.
   * This allows tracking which features users access in connected apps.
   * 
   * Authentication: Bearer token (JWT from SSO login) OR client_id + client_secret
   * Body: { action, feature?, description?, metadata? }
   */
  @Post('user-activity')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests per minute
  async recordUserActivity(
    @Body() activityDto: RecordActivityDto,
    @Headers('authorization') authHeader: string,
    @Headers('x-client-id') clientIdHeader: string,
    @Headers('x-client-secret') clientSecretHeader: string,
  ) {
    let userId: string;
    let oauthClientId: string;

    // Method 1: Bearer token (JWT from SSO login) + client_id header
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = this.jwtService.verify(token);
        userId = payload.sub;
        
        // Require client_id header when using Bearer token
        if (!clientIdHeader) {
          throw new UnauthorizedException('x-client-id header required with Bearer token');
        }
        
        // Verify client exists and is active
        const client = await this.ssoService.getOAuthClientByClientId(clientIdHeader);
        if (!client || !client.is_active) {
          throw new UnauthorizedException('Invalid or inactive client_id');
        }
        oauthClientId = client.id;
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
    // Method 2: client_id + client_secret headers (for backend-to-backend calls)
    else if (clientIdHeader && clientSecretHeader) {
      // Use the existing validateClient method for proper credential validation
      const client = await this.ssoService.validateClientCredentials(clientIdHeader, clientSecretHeader);
      if (!client) {
        throw new UnauthorizedException('Invalid client credentials');
      }
      
      // For backend calls, userId must be in the body metadata
      if (!activityDto.metadata?.userId) {
        throw new UnauthorizedException('userId required in metadata for backend calls');
      }
      userId = activityDto.metadata.userId;
      oauthClientId = client.id;
    }
    else {
      throw new UnauthorizedException('Authentication required');
    }

    return this.ssoService.recordUserActivity(userId, oauthClientId, activityDto);
  }
}
