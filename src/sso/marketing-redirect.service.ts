import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthClientsService } from '../oauth-clients/oauth-clients.service';
import { UserService } from '../users/services/user.service';
import { EnvironmentType } from '../oauth-clients/entities/oauth-client.entity';
import { getUrisByEnvironment } from '../oauth-clients/oauth-client.utils';
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
    private readonly oauthClientsService: OAuthClientsService,
    private readonly userService: UserService,
  ) {}

  isMarketingSource(source?: string): source is MarketingSource {
    return source === 'marketing' || source === 'marketing-dev';
  }

  getEnvironmentFromSource(source: MarketingSource): EnvironmentType {
    switch (source) {
      case 'marketing':
        return 'production';
      case 'marketing-dev':
        return 'staging';
      default:
        return 'production';
    }
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
   * Find the first *.replit.app redirect URI for the given environment
   */
  private findReplitAppRedirectUri(
    client: any,
    environment: EnvironmentType,
  ): string | null {
    const uris = getUrisByEnvironment(client, environment);
    if (uris.length === 0) return null;

    // Find the first *.replit.app URI
    const replitUri = uris.find(uri => uri.includes('.replit.app'));
    return replitUri || null;
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
      const environment = this.getEnvironmentFromSource(source);

      this.logger.log(
        `Marketing redirect: user=${userId}, userType=${userType}, intent=${intent}, environment=${environment}`,
      );

      // Get the configured portal client ID from environment variables
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

      // Fetch the OAuth client by client_id
      const client = await this.oauthClientsService.findByClientId(clientId);
      if (!client) {
        this.logger.warn(
          `OAuth client not found for client_id=${clientId}`,
        );
        return {
          shouldRedirect: false,
          error: 'Portal not found',
        };
      }

      if (!client.is_active) {
        this.logger.warn(
          `OAuth client ${client.name} (${clientId}) is not active`,
        );
        return {
          shouldRedirect: false,
          error: 'Portal is not active',
        };
      }

      // Find the first *.replit.app redirect URI for the environment
      const redirectUri = this.findReplitAppRedirectUri(client, environment);
      if (!redirectUri) {
        this.logger.warn(
          `No *.replit.app redirect URI found for ${client.name} in ${environment} environment. Falling back to profile.`,
        );
        return {
          shouldRedirect: false,
          error: `No ${environment} redirect URI configured for portal`,
        };
      }

      const state = randomUUID();
      
      const authUrl = this.buildAuthorizationUrl(
        clientId,
        redirectUri,
        state,
      );

      this.logger.log(
        `Marketing redirect: Redirecting user ${userId} to ${client.name} (${clientId}) via ${redirectUri}`,
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
