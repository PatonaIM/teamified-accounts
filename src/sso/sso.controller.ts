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
} from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { SsoService } from './sso.service';
import { AuthorizeDto } from './dto/authorize.dto';
import { TokenExchangeDto } from './dto/token.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('v1/sso')
export class SsoController {
  constructor(
    private readonly ssoService: SsoService,
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
}
