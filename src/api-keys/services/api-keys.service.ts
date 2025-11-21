import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ApiKey, ApiKeyType } from '../entities/api-key.entity';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import { UpdateApiKeyDto } from '../dto/update-api-key.dto';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class ApiKeysService {
  private readonly MAX_KEYS_PER_USER = 10;
  private readonly KEY_PREFIX = 'tmf_';
  private readonly PREFIX_INDEX_LENGTH = 10;

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Generate a cryptographically secure API key
   * Format: tmf_<48 random hex characters>
   */
  private generateApiKey(): string {
    const randomBytes = crypto.randomBytes(24); // 24 bytes = 48 hex chars
    return `${this.KEY_PREFIX}${randomBytes.toString('hex')}`;
  }

  /**
   * Extract prefix from key for indexing (first 10 chars)
   */
  private extractPrefix(key: string): string {
    return key.substring(0, this.PREFIX_INDEX_LENGTH);
  }

  /**
   * Hash the API key using bcrypt
   */
  private async hashKey(key: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(key, salt);
  }

  /**
   * Create a new API key for a user
   * Returns the plain key (only shown once) along with the key metadata
   */
  async create(
    userId: number,
    createDto: CreateApiKeyDto,
  ): Promise<{ key: string; apiKey: ApiKey }> {
    // Check key limit
    const existingKeys = await this.apiKeyRepository.count({
      where: { userId, isActive: true },
    });

    if (existingKeys >= this.MAX_KEYS_PER_USER) {
      throw new BadRequestException(
        `Maximum of ${this.MAX_KEYS_PER_USER} active API keys allowed per user`,
      );
    }

    // Generate and hash key
    const plainKey = this.generateApiKey();
    const keyPrefix = this.extractPrefix(plainKey);
    const keyHash = await this.hashKey(plainKey);

    // Create entity
    const apiKey = this.apiKeyRepository.create({
      ...createDto,
      keyHash,
      keyPrefix,
      userId,
    });

    await this.apiKeyRepository.save(apiKey);

    // Log the creation in audit trail
    await this.auditService.log({
      actorUserId: userId.toString(),
      actorRole: 'user',
      action: 'api_key_created',
      entityType: 'ApiKey',
      entityId: apiKey.id.toString(),
      changes: {
        name: apiKey.name,
        type: apiKey.type,
      },
    });

    return { key: plainKey, apiKey };
  }

  /**
   * Get all API keys for a user
   */
  async findAllByUser(userId: number): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a specific API key by ID
   */
  async findOne(id: number, userId: number): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, userId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey;
  }

  /**
   * Update an API key (only name can be updated)
   */
  async update(
    id: number,
    userId: number,
    updateDto: UpdateApiKeyDto,
  ): Promise<ApiKey> {
    const apiKey = await this.findOne(id, userId);
    Object.assign(apiKey, updateDto);
    return this.apiKeyRepository.save(apiKey);
  }

  /**
   * Delete (deactivate) an API key
   */
  async remove(id: number, userId: number): Promise<void> {
    const apiKey = await this.findOne(id, userId);
    apiKey.isActive = false;
    await this.apiKeyRepository.save(apiKey);

    // Log the deletion in audit trail
    await this.auditService.log({
      actorUserId: userId.toString(),
      actorRole: 'user',
      action: 'api_key_deleted',
      entityType: 'ApiKey',
      entityId: apiKey.id.toString(),
      changes: {
        name: apiKey.name,
      },
    });
  }

  /**
   * Validate an API key and return the associated user ID
   * Uses prefix index for fast lookup, then verifies hash
   * Updates lastUsedAt timestamp
   */
  async validateKey(
    plainKey: string,
  ): Promise<{ userId: number; type: ApiKeyType }> {
    if (!plainKey || !plainKey.startsWith(this.KEY_PREFIX)) {
      throw new UnauthorizedException('Invalid API key format');
    }

    // Extract prefix for indexed lookup
    const keyPrefix = this.extractPrefix(plainKey);

    // Find keys matching the prefix (indexed query - fast!)
    const apiKeys = await this.apiKeyRepository.find({
      where: { keyPrefix, isActive: true },
      select: ['id', 'keyHash', 'userId', 'type'],
    });

    // Check each matching key's hash
    for (const apiKey of apiKeys) {
      const isMatch = await bcrypt.compare(plainKey, apiKey.keyHash);
      if (isMatch) {
        // Update last used timestamp (async, don't wait)
        this.apiKeyRepository.update(apiKey.id, { lastUsedAt: new Date() });
        
        // Log API key usage (async, don't wait to avoid slowing down requests)
        this.auditService.log({
          actorUserId: apiKey.userId.toString(),
          actorRole: 'api_key',
          action: 'api_key_used',
          entityType: 'ApiKey',
          entityId: apiKey.id.toString(),
          changes: { type: apiKey.type },
        }).catch(err => {
          // Silent fail on audit logging to not break API requests
          console.error('Failed to log API key usage:', err);
        });
        
        return { userId: apiKey.userId, type: apiKey.type };
      }
    }

    throw new UnauthorizedException('Invalid API key');
  }
}
