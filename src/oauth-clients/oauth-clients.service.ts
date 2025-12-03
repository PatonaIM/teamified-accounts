import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { OAuthClient } from './entities/oauth-client.entity';
import { CreateOAuthClientDto } from './dto/create-oauth-client.dto';
import { UpdateOAuthClientDto } from './dto/update-oauth-client.dto';
import * as crypto from 'crypto';

@Injectable()
export class OAuthClientsService {
  constructor(
    @InjectRepository(OAuthClient)
    private readonly oauthClientsRepository: Repository<OAuthClient>,
  ) {}

  /**
   * Generate secure client credentials
   */
  private generateClientId(): string {
    return `client_${crypto.randomBytes(16).toString('hex')}`;
  }

  private generateClientSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create a new OAuth client
   */
  async create(
    createDto: CreateOAuthClientDto,
    createdBy: string,
  ): Promise<OAuthClient> {
    const client = this.oauthClientsRepository.create({
      ...createDto,
      client_id: this.generateClientId(),
      client_secret: this.generateClientSecret(),
      metadata: {
        app_url: createDto.app_url,
        owner: createDto.owner,
        environment: createDto.environment,
      },
      created_by: createdBy,
    });

    return this.oauthClientsRepository.save(client);
  }

  /**
   * Find all OAuth clients (excluding soft-deleted)
   */
  async findAll(): Promise<OAuthClient[]> {
    return this.oauthClientsRepository.find({
      where: { deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Find active OAuth clients only (excluding soft-deleted)
   */
  async findActive(): Promise<OAuthClient[]> {
    return this.oauthClientsRepository.find({
      where: { is_active: true, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Find one OAuth client by ID (excluding soft-deleted)
   */
  async findOne(id: string): Promise<OAuthClient> {
    const client = await this.oauthClientsRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });

    if (!client) {
      throw new NotFoundException('OAuth client not found');
    }

    return client;
  }

  /**
   * Find OAuth client by client_id (excluding soft-deleted)
   */
  async findByClientId(clientId: string): Promise<OAuthClient | null> {
    return this.oauthClientsRepository.findOne({
      where: { client_id: clientId, deleted_at: IsNull() },
    });
  }

  /**
   * Validate client credentials
   */
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

  /**
   * Update an OAuth client
   */
  async update(
    id: string,
    updateDto: UpdateOAuthClientDto,
  ): Promise<OAuthClient> {
    const client = await this.findOne(id);

    Object.assign(client, updateDto);

    if (updateDto.app_url || updateDto.owner || updateDto.environment) {
      client.metadata = {
        ...client.metadata,
        app_url: updateDto.app_url || client.metadata?.app_url,
        owner: updateDto.owner || client.metadata?.owner,
        environment: updateDto.environment || client.metadata?.environment,
      };
    }

    return this.oauthClientsRepository.save(client);
  }

  /**
   * Regenerate client secret
   */
  async regenerateSecret(id: string): Promise<OAuthClient> {
    const client = await this.findOne(id);
    client.client_secret = this.generateClientSecret();
    return this.oauthClientsRepository.save(client);
  }

  /**
   * Soft delete an OAuth client
   */
  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    client.deleted_at = new Date();
    client.is_active = false;
    await this.oauthClientsRepository.save(client);
  }

  /**
   * Activate/deactivate a client
   */
  async toggleActive(id: string): Promise<OAuthClient> {
    const client = await this.findOne(id);
    client.is_active = !client.is_active;
    return this.oauthClientsRepository.save(client);
  }
}
