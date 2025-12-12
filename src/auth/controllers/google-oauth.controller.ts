import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GoogleOAuthService } from '../services/google-oauth.service';

@ApiTags('Google OAuth')
@Controller('v1/auth/google')
export class GoogleOAuthController {
  constructor(private readonly googleOAuthService: GoogleOAuthService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check if Google OAuth is configured' })
  @ApiResponse({ status: 200, description: 'Returns Google OAuth configuration status' })
  getStatus() {
    return {
      configured: this.googleOAuthService.isGoogleOAuthConfigured(),
    };
  }

  @Get()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Initiate Google OAuth login flow' })
  @ApiQuery({ name: 'returnUrl', required: false, description: 'URL to redirect to after login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth consent screen' })
  @ApiResponse({ status: 400, description: 'Google OAuth not configured' })
  initiateGoogleOAuth(
    @Query('returnUrl') returnUrl: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const state = this.googleOAuthService.generateStateToken();
    
    res.cookie('google_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
    });

    const authUrl = this.googleOAuthService.generateAuthorizationUrl(state, returnUrl);
    res.redirect(authUrl);
  }

  @Get('callback')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Handle Google OAuth callback - redirects with temporary code' })
  @ApiQuery({ name: 'code', required: true, description: 'Authorization code from Google' })
  @ApiQuery({ name: 'state', required: true, description: 'State parameter for CSRF protection' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with temporary exchange code' })
  @ApiResponse({ status: 400, description: 'Invalid state or missing code' })
  @ApiResponse({ status: 401, description: 'OAuth authentication failed' })
  async handleGoogleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (error) {
      const errorUrl = `/login?error=${encodeURIComponent(error)}`;
      return res.redirect(errorUrl);
    }

    if (!code) {
      return res.redirect('/login?error=missing_code');
    }

    const storedState = req.cookies?.google_oauth_state;
    const receivedState = state?.split('|')[0];

    if (!storedState || storedState !== receivedState) {
      return res.redirect('/login?error=invalid_state');
    }

    res.clearCookie('google_oauth_state', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    try {
      const result = await this.googleOAuthService.handleGoogleCallback(
        code,
        state,
        req.ip,
        req.get('user-agent'),
      );

      const tempCode = await this.googleOAuthService.storeTemporaryAuthResult(result);

      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      const frontendUrl = process.env.FRONTEND_URL || 
        (process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
          : 'http://localhost:5000');

      const callbackUrl = new URL(`${frontendUrl}/auth/google/callback`);
      callbackUrl.searchParams.set('code', tempCode);
      
      if (result.returnUrl) {
        callbackUrl.searchParams.set('returnUrl', result.returnUrl);
      }

      res.redirect(callbackUrl.toString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  @Post('exchange')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange temporary code for tokens and user info' })
  @ApiBody({ schema: { type: 'object', properties: { code: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Returns tokens and user info' })
  @ApiResponse({ status: 401, description: 'Invalid or expired code' })
  async exchangeCode(@Body('code') code: string) {
    const result = await this.googleOAuthService.exchangeTemporaryCode(code);
    return result;
  }
}
