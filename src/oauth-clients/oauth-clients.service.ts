import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { OAuthClient, RedirectUri, LogoutUri, EnvironmentType } from './entities/oauth-client.entity';
import { CreateOAuthClientDto } from './dto/create-oauth-client.dto';
import { UpdateOAuthClientDto } from './dto/update-oauth-client.dto';
import { getUriStrings, getUrisByEnvironment, validateRedirectUri as validateUri } from './oauth-client.utils';
import * as crypto from 'crypto';

@Injectable()
export class OAuthClientsService {
  private readonly logger = new Logger(OAuthClientsService.name);
  
  private readonly allowedLogoutUriDomains = [
    'teamified.com',
    'teamified.au',
    'replit.app',
    'replit.dev',
    'localhost',
  ];

  constructor(
    @InjectRepository(OAuthClient)
    private readonly oauthClientsRepository: Repository<OAuthClient>,
  ) {}

  private generateClientId(): string {
    return `client_${crypto.randomBytes(16).toString('hex')}`;
  }

  private generateClientSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate a single logout URI for security
   * SECURITY: Ensures logout_uri is HTTPS-only (except localhost) and from approved domains
   * This prevents iframe injection attacks during front-channel logout
   */
  private validateSingleLogoutUri(logoutUri: string): void {
    try {
      const url = new URL(logoutUri);
      
      // Must be HTTPS (except localhost for development)
      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      if (!isLocalhost && url.protocol !== 'https:') {
        throw new BadRequestException('logout_uri must use HTTPS protocol');
      }
      
      // Check if domain is in allowlist (or subdomain thereof)
      const hostname = url.hostname.toLowerCase();
      const isAllowed = this.allowedLogoutUriDomains.some(domain => {
        if (domain === 'localhost') {
          return hostname === 'localhost' || hostname === '127.0.0.1';
        }
        return hostname === domain || hostname.endsWith(`.${domain}`);
      });
      
      if (!isAllowed) {
        throw new BadRequestException(
          `logout_uri domain not in approved list. Allowed: ${this.allowedLogoutUriDomains.join(', ')}`,
        );
      }
      
      // Path must start with / (no relative URLs)
      if (!url.pathname.startsWith('/')) {
        throw new BadRequestException('logout_uri path must start with /');
      }
      
      this.logger.log(`Validated logout_uri: ${logoutUri}`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Invalid logout_uri format: ${error.message}`);
    }
  }

  /**
   * Validate and filter logout_uris array
   * SECURITY: Validates each URI and returns only valid ones
   */
  validateLogoutUris(logoutUris: LogoutUri[] | undefined | null): LogoutUri[] {
    if (!logoutUris || !Array.isArray(logoutUris)) {
      return [];
    }

    const validUris: LogoutUri[] = [];
    for (const uriObj of logoutUris) {
      if (uriObj && typeof uriObj === 'object' && typeof uriObj.uri === 'string' && uriObj.uri.trim() !== '') {
        this.validateSingleLogoutUri(uriObj.uri);
        validUris.push({
          uri: uriObj.uri,
          environment: uriObj.environment || 'development',
        });
      }
    }
    return validUris;
  }

  /**
   * Check if a logout_uri is valid at runtime (for filtering during logout)
   * Returns true if valid, false if not (non-throwing version for filtering)
   */
  isValidLogoutUri(logoutUri: string): boolean {
    try {
      const url = new URL(logoutUri);
      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      
      if (!isLocalhost && url.protocol !== 'https:') {
        return false;
      }
      
      const hostname = url.hostname.toLowerCase();
      return this.allowedLogoutUriDomains.some(domain => {
        if (domain === 'localhost') {
          return hostname === 'localhost' || hostname === '127.0.0.1';
        }
        return hostname === domain || hostname.endsWith(`.${domain}`);
      });
    } catch {
      return false;
    }
  }

  async create(
    createDto: CreateOAuthClientDto,
    createdBy: string,
  ): Promise<OAuthClient> {
    // Validate logout_uris before saving (SECURITY: prevents iframe injection)
    const validatedLogoutUris = this.validateLogoutUris(createDto.logout_uris);
    
    const client = this.oauthClientsRepository.create({
      name: createDto.name,
      description: createDto.description,
      redirect_uris: createDto.redirect_uris,
      default_intent: createDto.default_intent || 'both',
      client_id: this.generateClientId(),
      client_secret: this.generateClientSecret(),
      metadata: {
        app_url: createDto.app_url,
        owner: createDto.owner,
      },
      created_by: createdBy,
      logout_uris: validatedLogoutUris,
    });

    return this.oauthClientsRepository.save(client);
  }

  async findAll(): Promise<OAuthClient[]> {
    return this.oauthClientsRepository.find({
      where: { deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async findActive(): Promise<OAuthClient[]> {
    return this.oauthClientsRepository.find({
      where: { is_active: true, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<OAuthClient> {
    const client = await this.oauthClientsRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });

    if (!client) {
      throw new NotFoundException('OAuth client not found');
    }

    return client;
  }

  async findByClientId(clientId: string): Promise<OAuthClient | null> {
    return this.oauthClientsRepository.findOne({
      where: { client_id: clientId, deleted_at: IsNull() },
    });
  }

  async validateClient(
    clientId: string,
    clientSecret: string,
  ): Promise<OAuthClient | null> {
    const client = await this.findByClientId(clientId);

    if (!client || !client.is_active) {
      return null;
    }

    if (client.client_secret !== clientSecret) {
      return null;
    }

    return client;
  }

  async update(
    id: string,
    updateDto: UpdateOAuthClientDto,
  ): Promise<OAuthClient> {
    const client = await this.findOne(id);

    if (updateDto.name !== undefined) {
      client.name = updateDto.name;
    }
    if (updateDto.description !== undefined) {
      client.description = updateDto.description;
    }
    if (updateDto.redirect_uris !== undefined) {
      console.log('[OAuthClientsService] Received redirect_uris update:', JSON.stringify(updateDto.redirect_uris));
      const validUris = Array.isArray(updateDto.redirect_uris) 
        ? updateDto.redirect_uris.filter(uri => 
            uri && 
            typeof uri === 'object' && 
            !Array.isArray(uri) &&
            typeof uri.uri === 'string' && 
            uri.uri.trim() !== ''
          ).map(uri => ({
            uri: uri.uri,
            environment: uri.environment || 'development',
          }))
        : [];
      console.log('[OAuthClientsService] Validated redirect_uris:', JSON.stringify(validUris));
      
      if (validUris.length === 0 && updateDto.redirect_uris.length > 0) {
        console.warn('[OAuthClientsService] WARNING: All redirect URIs were invalid, keeping existing URIs');
      } else {
        client.redirect_uris = validUris;
      }
    }
    if (updateDto.default_intent !== undefined) {
      client.default_intent = updateDto.default_intent;
    }
    if (updateDto.is_active !== undefined) {
      client.is_active = updateDto.is_active;
    }

    if (updateDto.app_url !== undefined || updateDto.owner !== undefined) {
      client.metadata = {
        ...client.metadata,
        app_url: updateDto.app_url ?? client.metadata?.app_url,
        owner: updateDto.owner ?? client.metadata?.owner,
      };
    }

    if (updateDto.allow_client_credentials !== undefined) {
      client.allow_client_credentials = updateDto.allow_client_credentials;
    }
    if (updateDto.allowed_scopes !== undefined) {
      client.allowed_scopes = updateDto.allowed_scopes;
    }
    console.log('[OAuthClientsService] updateDto.logout_uris:', JSON.stringify(updateDto.logout_uris));
    console.log('[OAuthClientsService] logout_uris !== undefined:', updateDto.logout_uris !== undefined);
    if (updateDto.logout_uris !== undefined) {
      // Validate logout_uris before saving (SECURITY: prevents iframe injection)
      const validatedLogoutUris = this.validateLogoutUris(updateDto.logout_uris);
      console.log('[OAuthClientsService] Validated logout_uris:', JSON.stringify(validatedLogoutUris));
      client.logout_uris = validatedLogoutUris;
    }

    console.log('[OAuthClientsService] Client before save - logout_uris:', JSON.stringify(client.logout_uris));
    const savedClient = await this.oauthClientsRepository.save(client);
    console.log('[OAuthClientsService] Client after save - logout_uris:', JSON.stringify(savedClient.logout_uris));
    return savedClient;
  }

  async regenerateSecret(id: string): Promise<OAuthClient> {
    const client = await this.findOne(id);
    client.client_secret = this.generateClientSecret();
    return this.oauthClientsRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    client.deleted_at = new Date();
    client.is_active = false;
    await this.oauthClientsRepository.save(client);
  }

  async toggleActive(id: string): Promise<OAuthClient> {
    const client = await this.findOne(id);
    client.is_active = !client.is_active;
    return this.oauthClientsRepository.save(client);
  }

  async findByIntentAndEnvironment(
    intent: 'client' | 'candidate',
    environment: EnvironmentType,
  ): Promise<{ client: OAuthClient; redirectUri: string } | null> {
    const clients = await this.oauthClientsRepository.find({
      where: { 
        is_active: true, 
        deleted_at: IsNull(),
      },
      order: { created_at: 'DESC' },
    });

    let fallbackClient: { client: OAuthClient; redirectUri: string } | null = null;

    for (const client of clients) {
      const matchesIntent = client.default_intent === intent || client.default_intent === 'both';
      if (!matchesIntent) {
        continue;
      }

      const uris = getUrisByEnvironment(client, environment);
      if (uris.length === 0) continue;

      const replitUri = uris.find(uri => uri.includes('.replit.app'));
      const selectedUri = replitUri || uris[0];

      if (client.default_intent === intent) {
        return { client, redirectUri: selectedUri };
      }

      if (client.default_intent === 'both' && !fallbackClient) {
        fallbackClient = { client, redirectUri: selectedUri };
      }
    }

    return fallbackClient;
  }

  validateRedirectUri(client: OAuthClient, redirectUri: string): boolean {
    return validateUri(client, redirectUri);
  }

  getClientUriStrings(client: OAuthClient): string[] {
    return getUriStrings(client);
  }
}
