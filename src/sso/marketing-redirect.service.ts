import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/services/user.service';
import { randomUUID } from 'crypto';

export type MarketingSource = 'marketing' | 'marketing-dev';

export interface MarketingRedirectResult {
  shouldRedirect: boolean;
  redirectUrl?: string;
  clientId?: string;
  error?: string;
}

@Injectable()
export class MarketingRedirectService {
  private readonly logger = new Logger(MarketingRedirectService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  isMarketingSource(source?: string): source is MarketingSource {
    return source === 'marketing' || source === 'marketing-dev';
  }

  /**
   * Get the configured portal client ID for the given intent
   * Uses environment variables: JOBSEEKER_PORTAL_CLIENT_ID, ATS_PORTAL_CLIENT_ID
   */
  private getPortalClientId(intent: 'client' | 'candidate'): string | null {
    if (intent === 'candidate') {
      return this.configService.get<string>('JOBSEEKER_PORTAL_CLIENT_ID') || null;
    } else {
      return this.configService.get<string>('ATS_PORTAL_CLIENT_ID') || null;
    }
  }

  /**
   * Get the configured signup redirect URL for the given intent
   * Uses environment variables: JOBSEEKER_PORTAL_REDIRECT_URL, ATS_PORTAL_REDIRECT_URL
   */
  private getSignupRedirectUrl(intent: 'client' | 'candidate'): string | null {
    if (intent === 'candidate') {
      return this.configService.get<string>('JOBSEEKER_PORTAL_REDIRECT_URL') || null;
    } else {
      return this.configService.get<string>('ATS_PORTAL_REDIRECT_URL') || null;
    }
  }

  async getRedirectForUser(
    userId: string,
    source: MarketingSource,
  ): Promise<MarketingRedirectResult> {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        return {
          shouldRedirect: false,
          error: 'User not found',
        };
      }

      const userType = this.userService.classifyUserType(user);
      const intent = userType === 'client' ? 'client' : 'candidate';

      this.logger.log(
        `Marketing redirect: user=${userId}, userType=${userType}, intent=${intent}, source=${source}`,
      );

      const clientId = this.getPortalClientId(intent);
      if (!clientId) {
        this.logger.warn(
          `No portal client ID configured for intent=${intent}. Missing ${intent === 'candidate' ? 'JOBSEEKER_PORTAL_CLIENT_ID' : 'ATS_PORTAL_CLIENT_ID'} secret.`,
        );
        return {
          shouldRedirect: false,
          error: 'Portal client ID not configured',
        };
      }

      const redirectUri = this.getSignupRedirectUrl(intent);
      if (!redirectUri) {
        this.logger.warn(
          `No signup redirect URL configured for intent=${intent}. Missing ${intent === 'candidate' ? 'JOBSEEKER_PORTAL_REDIRECT_URL' : 'ATS_PORTAL_REDIRECT_URL'} environment variable.`,
        );
        return {
          shouldRedirect: false,
          error: 'Signup redirect URL not configured',
        };
      }

      const state = randomUUID();
      
      const authUrl = this.buildAuthorizationUrl(
        clientId,
        redirectUri,
        state,
      );

      this.logger.log(
        `Marketing redirect: Redirecting user ${userId} to portal (${clientId}) via ${redirectUri}`,
      );

      return {
        shouldRedirect: true,
        redirectUrl: authUrl,
        clientId: clientId,
      };
    } catch (error) {
      this.logger.error(`Marketing redirect error: ${error.message}`, error.stack);
      return {
        shouldRedirect: false,
        error: error.message,
      };
    }
  }

  private buildAuthorizationUrl(
    clientId: string,
    redirectUri: string,
    state: string,
  ): string {
    const baseUrl = process.env.SSO_BASE_URL || '';
    const authEndpoint = `${baseUrl}/api/v1/sso/authorize-authenticated`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });

    return `${authEndpoint}?${params.toString()}`;
  }
}
