import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { OAuthClient, RedirectUri, EnvironmentType } from './entities/oauth-client.entity';
import { CreateOAuthClientDto } from './dto/create-oauth-client.dto';
import { UpdateOAuthClientDto } from './dto/update-oauth-client.dto';
import { getUriStrings, getUrisByEnvironment, validateRedirectUri as validateUri } from './oauth-client.utils';
import * as crypto from 'crypto';

@Injectable()
export class OAuthClientsService {
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

  async create(
    createDto: CreateOAuthClientDto,
    createdBy: string,
  ): Promise<OAuthClient> {
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
      client.redirect_uris = updateDto.redirect_uris;
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

    return this.oauthClientsRepository.save(client);
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
