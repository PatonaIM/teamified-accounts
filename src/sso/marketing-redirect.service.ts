import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OAuthClientsService } from '../oauth-clients/oauth-clients.service';
import { UserService } from '../users/services/user.service';
import { EnvironmentType } from '../oauth-clients/entities/oauth-client.entity';
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

      const result = await this.oauthClientsService.findByIntentAndEnvironment(
        intent,
        environment,
      );

      if (!result) {
        this.logger.warn(
          `No matching OAuth client found for intent=${intent}, environment=${environment}. Falling back to profile.`,
        );
        return {
          shouldRedirect: false,
          error: 'No matching portal found',
        };
      }

      const state = randomUUID();
      
      const authUrl = this.buildAuthorizationUrl(
        result.client.client_id,
        result.redirectUri,
        state,
      );

      this.logger.log(
        `Marketing redirect: Redirecting user ${userId} to ${result.client.name} (${result.client.client_id})`,
      );

      return {
        shouldRedirect: true,
        redirectUrl: authUrl,
        clientId: result.client.client_id,
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
