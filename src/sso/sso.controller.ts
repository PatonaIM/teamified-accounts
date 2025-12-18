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
} from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { SsoService } from './sso.service';
import { MarketingRedirectService } from './marketing-redirect.service';
import { AuthorizeDto } from './dto/authorize.dto';
import { TokenExchangeDto } from './dto/token.dto';
import { RecordActivityDto } from './dto/user-activity.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('v1/sso')
export class SsoController {
  constructor(
    private readonly ssoService: SsoService,
    private readonly marketingRedirectService: MarketingRedirectService,
    private readonly jwtService: JwtService,
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
   */
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per 60 seconds
  async token(@Body() tokenDto: TokenExchangeDto) {
    return await this.ssoService.exchangeToken(tokenDto);
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
    
    // Return user information from JWT payload
    return {
      id: userId,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      roles: req.user.roles || [],
    };
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
    // Clear the httpOnly cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return res.json({ message: 'Session cleared successfully' });
  }

  /**
   * SSO Logout Endpoint (RP-Initiated Logout)
   * GET /api/v1/sso/logout
   * 
   * Centralized logout endpoint for OAuth 2.0 clients.
   * Clears all user sessions (cookies + database) and optionally redirects back to client.
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

    // Clear the httpOnly cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Also clear refresh_token cookie if present
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    console.log('[SSO] Logout complete:', {
      userId,
      redirectUrl: result.redirectUrl,
    });

    // If a valid redirect URL was provided, redirect the user
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
