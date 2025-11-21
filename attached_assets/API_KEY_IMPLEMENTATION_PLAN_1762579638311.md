# API Key Management Implementation Plan

## Overview
This document outlines the implementation plan for adding API key management to the Teamified Team Member Portal. The feature will include:
- Full-access and read-only API keys
- CRUD operations for API key management
- New Settings page tab for key management
- Comprehensive Swagger documentation updates
- Theme-aware UI with dark mode support

## Phase 1: Swagger Documentation Updates

### 1.1 Audit and Update Existing Documentation
**Goal**: Ensure all existing API endpoints have complete Swagger documentation

**Tasks**:
- Audit all controllers in `src/` modules
- Add missing `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` decorators
- Add request/response examples using `@ApiBody()` and `@ApiResponse()`

**Modules to Review**:
- `src/auth/` - Authentication endpoints
- `src/users/` - User management
- `src/user-roles/` - Role management
- `src/employment-records/` - Employment data
- `src/salary-history/` - Salary records
- `src/clients/` - Client management
- `src/invitations/` - Invitation system
- `src/documents/` - Document management
- `src/profiles/` - Profile management
- `src/audit/` - Audit logs

**Example Pattern**:
```typescript
@ApiTags('users')
@Controller('v1/users')
export class UsersController {

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves detailed information for a specific user'
  })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'eor',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: number) {
    // ...
  }
}
```

---

## Phase 2: Backend - Database Schema

### 2.1 API Key Entity

**File**: `src/api-keys/entities/api-key.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ApiKeyType {
  FULL_ACCESS = 'full-access',
  READ_ONLY = 'read-only'
}

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, unique: true })
  @Index()
  keyHash: string; // bcrypt hash of the key

  @Column({
    type: 'enum',
    enum: ApiKeyType,
    default: ApiKeyType.READ_ONLY
  })
  type: ApiKeyType;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
```

### 2.2 Migration

**Command**: `npm run typeorm:generate-migration -- CreateApiKeys`

**Generated Migration** (example):
```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateApiKeys1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'api_keys',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'keyHash',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['full-access', 'read-only'],
            default: "'read-only'",
          },
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'lastUsedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'IDX_API_KEYS_KEY_HASH',
        columnNames: ['keyHash'],
      }),
    );

    await queryRunner.createForeignKey(
      'api_keys',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('api_keys');
  }
}
```

---

## Phase 3: Backend - API Keys Module

### 3.1 Module Structure

**Directory**: `src/api-keys/`

```
src/api-keys/
├── api-keys.module.ts
├── api-keys.controller.ts
├── api-keys.service.ts
├── entities/
│   └── api-key.entity.ts
├── dto/
│   ├── create-api-key.dto.ts
│   ├── update-api-key.dto.ts
│   └── api-key-response.dto.ts
└── guards/
    └── api-key-auth.guard.ts
```

### 3.2 DTOs

**File**: `src/api-keys/dto/create-api-key.dto.ts`

```typescript
import { IsString, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiKeyType } from '../entities/api-key.entity';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'Human-readable name for the API key',
    example: 'Production API Key',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Type of API key',
    enum: ApiKeyType,
    example: ApiKeyType.READ_ONLY
  })
  @IsEnum(ApiKeyType)
  type: ApiKeyType;
}
```

**File**: `src/api-keys/dto/update-api-key.dto.ts`

```typescript
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApiKeyDto {
  @ApiProperty({
    description: 'Updated name for the API key',
    example: 'Updated Production Key',
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;
}
```

**File**: `src/api-keys/dto/api-key-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { ApiKeyType } from '../entities/api-key.entity';

export class ApiKeyResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Production API Key' })
  name: string;

  @ApiProperty({ enum: ApiKeyType, example: ApiKeyType.READ_ONLY })
  type: ApiKeyType;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-16T14:20:00Z', nullable: true })
  lastUsedAt: Date | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 1 })
  userId: number;
}

export class ApiKeyCreatedResponseDto extends ApiKeyResponseDto {
  @ApiProperty({
    example: 'tmf_1a2b3c4d5e6f7g8h9i0j',
    description: 'Plain text API key (only shown once)'
  })
  key: string;
}
```

### 3.3 Service

**File**: `src/api-keys/api-keys.service.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ApiKey, ApiKeyType } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';

@Injectable()
export class ApiKeysService {
  private readonly MAX_KEYS_PER_USER = 10;
  private readonly KEY_PREFIX = 'tmf_';

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  /**
   * Generate a cryptographically secure API key
   * Format: tmf_<32 random hex characters>
   */
  private generateApiKey(): string {
    const randomBytes = crypto.randomBytes(24);
    return `${this.KEY_PREFIX}${randomBytes.toString('hex')}`;
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
  async create(userId: number, createDto: CreateApiKeyDto): Promise<{ key: string; apiKey: ApiKey }> {
    // Check key limit
    const existingKeys = await this.apiKeyRepository.count({ where: { userId, isActive: true } });
    if (existingKeys >= this.MAX_KEYS_PER_USER) {
      throw new BadRequestException(`Maximum of ${this.MAX_KEYS_PER_USER} active API keys allowed per user`);
    }

    // Generate and hash key
    const plainKey = this.generateApiKey();
    const keyHash = await this.hashKey(plainKey);

    // Create entity
    const apiKey = this.apiKeyRepository.create({
      ...createDto,
      keyHash,
      userId,
    });

    await this.apiKeyRepository.save(apiKey);

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
    const apiKey = await this.apiKeyRepository.findOne({ where: { id, userId } });
    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }
    return apiKey;
  }

  /**
   * Update an API key (only name can be updated)
   */
  async update(id: number, userId: number, updateDto: UpdateApiKeyDto): Promise<ApiKey> {
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
  }

  /**
   * Validate an API key and return the associated user ID
   * Updates lastUsedAt timestamp
   */
  async validateKey(plainKey: string): Promise<{ userId: number; type: ApiKeyType }> {
    if (!plainKey || !plainKey.startsWith(this.KEY_PREFIX)) {
      throw new UnauthorizedException('Invalid API key format');
    }

    // Find all active keys (we need to check hash for each)
    const apiKeys = await this.apiKeyRepository.find({
      where: { isActive: true },
      select: ['id', 'keyHash', 'userId', 'type'],
    });

    // Check each key hash
    for (const apiKey of apiKeys) {
      const isMatch = await bcrypt.compare(plainKey, apiKey.keyHash);
      if (isMatch) {
        // Update last used timestamp (async, don't wait)
        this.apiKeyRepository.update(apiKey.id, { lastUsedAt: new Date() });
        return { userId: apiKey.userId, type: apiKey.type };
      }
    }

    throw new UnauthorizedException('Invalid API key');
  }
}
```

### 3.4 Controller

**File**: `src/api-keys/api-keys.controller.ts`

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKeyResponseDto, ApiKeyCreatedResponseDto } from './dto/api-key-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('api-keys')
@Controller('v1/api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new API key',
    description: 'Generates a new API key for the authenticated user. The plain key is only returned once and cannot be retrieved again.'
  })
  @ApiResponse({
    status: 201,
    description: 'API key created successfully',
    type: ApiKeyCreatedResponseDto,
    schema: {
      example: {
        id: 1,
        name: 'Production API Key',
        type: 'read-only',
        createdAt: '2024-01-15T10:30:00Z',
        lastUsedAt: null,
        isActive: true,
        userId: 5,
        key: 'tmf_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request (e.g., max keys limit reached)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@GetUser('id') userId: number, @Body() createDto: CreateApiKeyDto) {
    const { key, apiKey } = await this.apiKeysService.create(userId, createDto);
    return {
      ...apiKey,
      key, // Plain key included only in creation response
    };
  }

  @Get()
  @ApiOperation({
    summary: 'List all API keys',
    description: 'Retrieves all API keys for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'API keys retrieved successfully',
    type: [ApiKeyResponseDto],
    schema: {
      example: [
        {
          id: 1,
          name: 'Production API Key',
          type: 'read-only',
          createdAt: '2024-01-15T10:30:00Z',
          lastUsedAt: '2024-01-16T14:20:00Z',
          isActive: true,
          userId: 5
        },
        {
          id: 2,
          name: 'Integration Key',
          type: 'full-access',
          createdAt: '2024-01-10T08:15:00Z',
          lastUsedAt: null,
          isActive: true,
          userId: 5
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@GetUser('id') userId: number) {
    return this.apiKeysService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get API key by ID',
    description: 'Retrieves a specific API key by ID for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'API key found',
    type: ApiKeyResponseDto
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: number, @GetUser('id') userId: number) {
    return this.apiKeysService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update API key',
    description: 'Updates the name of an API key'
  })
  @ApiResponse({
    status: 200,
    description: 'API key updated successfully',
    type: ApiKeyResponseDto
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: number,
    @GetUser('id') userId: number,
    @Body() updateDto: UpdateApiKeyDto,
  ) {
    return this.apiKeysService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete API key',
    description: 'Deactivates an API key (soft delete)'
  })
  @ApiResponse({
    status: 200,
    description: 'API key deleted successfully',
    schema: {
      example: { message: 'API key deleted successfully' }
    }
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: number, @GetUser('id') userId: number) {
    await this.apiKeysService.remove(id, userId);
    return { message: 'API key deleted successfully' };
  }
}
```

### 3.5 API Key Auth Guard

**File**: `src/api-keys/guards/api-key-auth.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeysService } from '../api-keys.service';
import { ApiKeyType } from '../entities/api-key.entity';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Try to get API key from Authorization header or X-API-Key header
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    try {
      // Validate the key and get user info
      const { userId, type } = await this.apiKeysService.validateKey(apiKey);

      // Check if read-only key is trying to access non-GET endpoints
      const method = request.method;
      if (type === ApiKeyType.READ_ONLY && method !== 'GET') {
        throw new UnauthorizedException('Read-only API keys can only access GET endpoints');
      }

      // Attach user info to request
      request.user = { id: userId, apiKeyType: type };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired API key');
    }
  }

  private extractApiKey(request: any): string | null {
    // Check Authorization header: "Bearer tmf_..."
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer tmf_')) {
      return authHeader.substring(7);
    }

    // Check X-API-Key header
    const apiKeyHeader = request.headers['x-api-key'];
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    return null;
  }
}
```

### 3.6 Module

**File**: `src/api-keys/api-keys.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { ApiKey } from './entities/api-key.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    AuthModule, // For JWT auth in controller
  ],
  controllers: [ApiKeysController],
  providers: [ApiKeysService],
  exports: [ApiKeysService], // Export for use in other modules
})
export class ApiKeysModule {}
```

### 3.7 Register Module in AppModule

**File**: `src/app.module.ts`

```typescript
// ... other imports
import { ApiKeysModule } from './api-keys/api-keys.module';

@Module({
  imports: [
    // ... other modules
    ApiKeysModule,
  ],
  // ...
})
export class AppModule {}
```

### 3.8 Update Swagger Configuration

**File**: `src/main.ts`

```typescript
// ... existing imports

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ... existing configuration

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Teamified Team Member Portal API')
    .setDescription('API documentation for the Team Member Portal')
    .setVersion('1.0')
    .addBearerAuth() // JWT auth
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key') // API key auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ... rest of bootstrap
}
```

### 3.9 Audit Logging Integration

**File**: `src/api-keys/api-keys.service.ts` (additions)

```typescript
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly auditService: AuditService, // Add this
  ) {}

  async create(userId: number, createDto: CreateApiKeyDto): Promise<{ key: string; apiKey: ApiKey }> {
    // ... existing code

    await this.apiKeyRepository.save(apiKey);

    // Log the creation
    await this.auditService.log({
      userId,
      action: 'api_key_created',
      entityType: 'api_key',
      entityId: apiKey.id.toString(),
      details: { name: apiKey.name, type: apiKey.type },
    });

    return { key: plainKey, apiKey };
  }

  async remove(id: number, userId: number): Promise<void> {
    const apiKey = await this.findOne(id, userId);
    apiKey.isActive = false;
    await this.apiKeyRepository.save(apiKey);

    // Log the deletion
    await this.auditService.log({
      userId,
      action: 'api_key_deleted',
      entityType: 'api_key',
      entityId: apiKey.id.toString(),
      details: { name: apiKey.name },
    });
  }

  async validateKey(plainKey: string): Promise<{ userId: number; type: ApiKeyType }> {
    // ... existing validation code

    for (const apiKey of apiKeys) {
      const isMatch = await bcrypt.compare(plainKey, apiKey.keyHash);
      if (isMatch) {
        // Update last used timestamp
        await this.apiKeyRepository.update(apiKey.id, { lastUsedAt: new Date() });

        // Log usage (optional - may create a lot of logs)
        // await this.auditService.log({
        //   userId: apiKey.userId,
        //   action: 'api_key_used',
        //   entityType: 'api_key',
        //   entityId: apiKey.id.toString(),
        // });

        return { userId: apiKey.userId, type: apiKey.type };
      }
    }

    throw new UnauthorizedException('Invalid API key');
  }
}
```

---

## Phase 4: Frontend Implementation

### 4.1 TypeScript Types

**File**: `frontend/src/types/apiKey.ts`

```typescript
export enum ApiKeyType {
  FULL_ACCESS = 'full-access',
  READ_ONLY = 'read-only',
}

export interface ApiKey {
  id: number;
  name: string;
  type: ApiKeyType;
  createdAt: string;
  lastUsedAt: string | null;
  isActive: boolean;
  userId: number;
}

export interface ApiKeyCreated extends ApiKey {
  key: string; // Only present in creation response
}

export interface CreateApiKeyDto {
  name: string;
  type: ApiKeyType;
}

export interface UpdateApiKeyDto {
  name?: string;
}
```

### 4.2 API Service

**File**: `frontend/src/services/apiKeys.ts`

```typescript
import axios from 'axios';
import { ApiKey, ApiKeyCreated, CreateApiKeyDto, UpdateApiKeyDto } from '../types/apiKey';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiKeysService = {
  /**
   * Create a new API key
   */
  async createApiKey(data: CreateApiKeyDto): Promise<ApiKeyCreated> {
    const response = await axios.post<ApiKeyCreated>(`${API_URL}/v1/api-keys`, data);
    return response.data;
  },

  /**
   * Get all API keys for the current user
   */
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await axios.get<ApiKey[]>(`${API_URL}/v1/api-keys`);
    return response.data;
  },

  /**
   * Get a specific API key by ID
   */
  async getApiKey(id: number): Promise<ApiKey> {
    const response = await axios.get<ApiKey>(`${API_URL}/v1/api-keys/${id}`);
    return response.data;
  },

  /**
   * Update an API key
   */
  async updateApiKey(id: number, data: UpdateApiKeyDto): Promise<ApiKey> {
    const response = await axios.patch<ApiKey>(`${API_URL}/v1/api-keys/${id}`, data);
    return response.data;
  },

  /**
   * Delete an API key
   */
  async deleteApiKey(id: number): Promise<void> {
    await axios.delete(`${API_URL}/v1/api-keys/${id}`);
  },
};
```

### 4.3 Settings Page - Add API Keys Tab

**File**: `frontend/src/pages/Settings.tsx` (modifications)

```typescript
// Add to existing Settings page tabs
import { ApiKeysTab } from '../components/settings/ApiKeysTab';

// In the Settings component:
const [currentTab, setCurrentTab] = useState(0);

const tabs = [
  { label: 'Theme', component: <ThemeTab /> },
  { label: 'SSO Apps', component: <SSOAppsTab /> },
  { label: 'API Keys', component: <ApiKeysTab /> }, // Add this
];
```

### 4.4 API Keys Tab Component

**File**: `frontend/src/components/settings/ApiKeysTab.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { apiKeysService } from '../../services/apiKeys';
import { ApiKey } from '../../types/apiKey';
import { ApiKeyList } from './ApiKeyList';
import { CreateApiKeyModal } from './CreateApiKeyModal';
import { ApiKeyCreatedDialog } from './ApiKeyCreatedDialog';
import { useSnackbar } from '../../hooks/useSnackbar';

export const ApiKeysTab: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const keys = await apiKeysService.getApiKeys();
      setApiKeys(keys);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load API keys');
      showError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = (key: string) => {
    setCreatedKey(key);
    setCreateModalOpen(false);
    loadApiKeys();
  };

  const handleDeleteKey = async (id: number) => {
    try {
      await apiKeysService.deleteApiKey(id);
      showSuccess('API key deleted successfully');
      loadApiKeys();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete API key');
    }
  };

  const handleUpdateKey = async (id: number, name: string) => {
    try {
      await apiKeysService.updateApiKey(id, { name });
      showSuccess('API key updated successfully');
      loadApiKeys();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update API key');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            API Keys
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage API keys for programmatic access to your account
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create API Key
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Security Notice:</strong> API keys provide access to your account. Keep them secure and never share them publicly.
        Read-only keys can only access GET endpoints, while full-access keys can perform all operations.
      </Alert>

      <ApiKeyList
        apiKeys={apiKeys}
        onDelete={handleDeleteKey}
        onUpdate={handleUpdateKey}
      />

      <CreateApiKeyModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateKey}
      />

      <ApiKeyCreatedDialog
        open={!!createdKey}
        apiKey={createdKey || ''}
        onClose={() => setCreatedKey(null)}
      />
    </Box>
  );
};
```

### 4.5 API Key List Component

**File**: `frontend/src/components/settings/ApiKeyList.tsx`

```typescript
import React, { useState } from 'react';
import {
  Box,
  Card,
  IconButton,
  Chip,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { ApiKey, ApiKeyType } from '../../types/apiKey';
import { DeleteApiKeyDialog } from './DeleteApiKeyDialog';
import { EditApiKeyDialog } from './EditApiKeyDialog';
import { formatDistanceToNow } from 'date-fns';

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, name: string) => Promise<void>;
}

export const ApiKeyList: React.FC<ApiKeyListProps> = ({ apiKeys, onDelete, onUpdate }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);

  const handleDeleteClick = (apiKey: ApiKey) => {
    setSelectedKey(apiKey);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (apiKey: ApiKey) => {
    setSelectedKey(apiKey);
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedKey) {
      await onDelete(selectedKey.id);
      setDeleteDialogOpen(false);
      setSelectedKey(null);
    }
  };

  const handleEditConfirm = async (name: string) => {
    if (selectedKey) {
      await onUpdate(selectedKey.id, name);
      setEditDialogOpen(false);
      setSelectedKey(null);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value === ApiKeyType.FULL_ACCESS ? 'Full Access' : 'Read Only'}
          color={params.value === ApiKeyType.FULL_ACCESS ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 180,
      renderCell: (params) => (
        <Tooltip title={new Date(params.value).toLocaleString()}>
          <span>{formatDistanceToNow(new Date(params.value), { addSuffix: true })}</span>
        </Tooltip>
      ),
    },
    {
      field: 'lastUsedAt',
      headerName: 'Last Used',
      width: 180,
      renderCell: (params) => {
        if (!params.value) {
          return <Typography variant="body2" color="text.secondary">Never</Typography>;
        }
        return (
          <Tooltip title={new Date(params.value).toLocaleString()}>
            <span>{formatDistanceToNow(new Date(params.value), { addSuffix: true })}</span>
          </Tooltip>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEditClick(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (apiKeys.length === 0) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No API keys yet. Create your first API key to get started.
        </Typography>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <DataGrid
          rows={apiKeys}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Card>

      {selectedKey && (
        <>
          <DeleteApiKeyDialog
            open={deleteDialogOpen}
            apiKey={selectedKey}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDeleteConfirm}
          />
          <EditApiKeyDialog
            open={editDialogOpen}
            apiKey={selectedKey}
            onClose={() => setEditDialogOpen(false)}
            onConfirm={handleEditConfirm}
          />
        </>
      )}
    </>
  );
};
```

### 4.6 Create API Key Modal

**File**: `frontend/src/components/settings/CreateApiKeyModal.tsx`

```typescript
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlRadio,
  Radio,
  Alert,
  CircularProgress,
} from '@mui/material';
import { apiKeysService } from '../../services/apiKeys';
import { ApiKeyType } from '../../types/apiKey';

interface CreateApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (key: string) => void;
}

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ApiKeyType>(ApiKeyType.READ_ONLY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a name for the API key');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiKeysService.createApiKey({ name: name.trim(), type });
      onSuccess(result.key);

      // Reset form
      setName('');
      setType(ApiKeyType.READ_ONLY);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setType(ApiKeyType.READ_ONLY);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create API Key</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            label="Key Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Production API Key"
            helperText="A descriptive name to identify this key"
            sx={{ mb: 3 }}
            disabled={loading}
          />

          <FormControl component="fieldset" disabled={loading}>
            <FormLabel component="legend">Key Type</FormLabel>
            <RadioGroup
              value={type}
              onChange={(e) => setType(e.target.value as ApiKeyType)}
            >
              <FormControlRadio
                value={ApiKeyType.READ_ONLY}
                control={<Radio />}
                label="Read Only - Can only access GET endpoints"
              />
              <FormControlRadio
                value={ApiKeyType.FULL_ACCESS}
                control={<Radio />}
                label="Full Access - Can access all endpoints"
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !name.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Key'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
```

### 4.7 API Key Created Dialog (One-Time Display)

**File**: `frontend/src/components/settings/ApiKeyCreatedDialog.tsx`

```typescript
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { ContentCopy as CopyIcon, CheckCircle as CheckIcon } from '@mui/icons-material';

interface ApiKeyCreatedDialogProps {
  open: boolean;
  apiKey: string;
  onClose: () => void;
}

export const ApiKeyCreatedDialog: React.FC<ApiKeyCreatedDialogProps> = ({
  open,
  apiKey,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>API Key Created</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Important:</strong> This is the only time you will see this key.
          Please copy it now and store it securely. You will not be able to retrieve it again.
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Your API Key:
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              fullWidth
              value={apiKey}
              InputProps={{
                readOnly: true,
                sx: { fontFamily: 'monospace', fontSize: '0.9rem' },
              }}
            />
            <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
              <IconButton onClick={handleCopy} color={copied ? 'success' : 'default'}>
                {copied ? <CheckIcon /> : <CopyIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Alert severity="info">
          Use this key in your API requests by including it in the <code>X-API-Key</code> header
          or as a Bearer token in the <code>Authorization</code> header.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          I've Saved My Key
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### 4.8 Delete API Key Dialog

**File**: `frontend/src/components/settings/DeleteApiKeyDialog.tsx`

```typescript
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { ApiKey } from '../../types/apiKey';

interface DeleteApiKeyDialogProps {
  open: boolean;
  apiKey: ApiKey;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteApiKeyDialog: React.FC<DeleteApiKeyDialogProps> = ({
  open,
  apiKey,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete API Key</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete the API key <strong>"{apiKey.name}"</strong>?
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          This action cannot be undone. Any applications using this key will immediately lose access.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading}
        >
          Delete Key
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### 4.9 Edit API Key Dialog

**File**: `frontend/src/components/settings/EditApiKeyDialog.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { ApiKey } from '../../types/apiKey';

interface EditApiKeyDialogProps {
  open: boolean;
  apiKey: ApiKey;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
}

export const EditApiKeyDialog: React.FC<EditApiKeyDialogProps> = ({
  open,
  apiKey,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState(apiKey.name);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(apiKey.name);
  }, [apiKey]);

  const handleConfirm = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);
      await onConfirm(name.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit API Key</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Key Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || !name.trim()}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

## Phase 5: Testing

### 5.1 Backend Unit Tests

**File**: `src/api-keys/api-keys.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeysService } from './api-keys.service';
import { ApiKey, ApiKeyType } from './entities/api-key.entity';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('ApiKeysService', () => {
  let service: ApiKeysService;
  let repository: Repository<ApiKey>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
    repository = module.get<Repository<ApiKey>>(getRepositoryToken(ApiKey));
  });

  describe('create', () => {
    it('should create an API key successfully', async () => {
      const userId = 1;
      const createDto = { name: 'Test Key', type: ApiKeyType.READ_ONLY };

      jest.spyOn(repository, 'count').mockResolvedValue(0);
      jest.spyOn(repository, 'create').mockReturnValue({ id: 1 } as ApiKey);
      jest.spyOn(repository, 'save').mockResolvedValue({ id: 1, ...createDto } as ApiKey);

      const result = await service.create(userId, createDto);

      expect(result.key).toMatch(/^tmf_[a-f0-9]{48}$/);
      expect(result.apiKey).toBeDefined();
    });

    it('should throw BadRequestException when max keys reached', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(10);

      await expect(
        service.create(1, { name: 'Test', type: ApiKeyType.READ_ONLY })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateKey', () => {
    it('should validate a correct API key', async () => {
      const plainKey = 'tmf_1234567890abcdef';
      const hashedKey = await bcrypt.hash(plainKey, 10);

      const apiKey = {
        id: 1,
        keyHash: hashedKey,
        userId: 5,
        type: ApiKeyType.READ_ONLY,
      };

      jest.spyOn(repository, 'find').mockResolvedValue([apiKey as ApiKey]);
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);

      const result = await service.validateKey(plainKey);

      expect(result.userId).toBe(5);
      expect(result.type).toBe(ApiKeyType.READ_ONLY);
    });

    it('should throw UnauthorizedException for invalid key', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      await expect(service.validateKey('tmf_invalid')).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

### 5.2 Backend Integration Tests

**File**: `src/api-keys/api-keys.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { ApiKeyType } from './entities/api-key.entity';

describe('ApiKeysController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'Test123!' });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/api-keys', () => {
    it('should create a new API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/api-keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Key', type: ApiKeyType.READ_ONLY })
        .expect(201)
        .expect((res) => {
          expect(res.body.key).toMatch(/^tmf_/);
          expect(res.body.name).toBe('Test Key');
          expect(res.body.type).toBe(ApiKeyType.READ_ONLY);
        });
    });
  });

  describe('GET /api/v1/api-keys', () => {
    it('should list all API keys', () => {
      return request(app.getHttpServer())
        .get('/api/v1/api-keys')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
```

### 5.3 Frontend Component Tests

**File**: `frontend/src/components/settings/ApiKeysTab.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ApiKeysTab } from './ApiKeysTab';
import { apiKeysService } from '../../services/apiKeys';

vi.mock('../../services/apiKeys');

describe('ApiKeysTab', () => {
  it('renders loading state initially', () => {
    render(<ApiKeysTab />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays API keys after loading', async () => {
    const mockKeys = [
      {
        id: 1,
        name: 'Test Key',
        type: 'read-only',
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
        isActive: true,
        userId: 1,
      },
    ];

    vi.mocked(apiKeysService.getApiKeys).mockResolvedValue(mockKeys);

    render(<ApiKeysTab />);

    await waitFor(() => {
      expect(screen.getByText('Test Key')).toBeInTheDocument();
    });
  });

  it('opens create modal when clicking Create button', async () => {
    vi.mocked(apiKeysService.getApiKeys).mockResolvedValue([]);

    render(<ApiKeysTab />);

    await waitFor(() => {
      expect(screen.getByText('Create API Key')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Create API Key'));

    expect(screen.getByText('Key Name')).toBeInTheDocument();
  });
});
```

### 5.4 E2E Tests

**File**: `tests/e2e/api-keys.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('API Keys Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Navigate to settings
    await page.goto('http://localhost:5173/settings');
    await page.click('text=API Keys');
  });

  test('should create a new API key', async ({ page }) => {
    await page.click('text=Create API Key');

    await page.fill('input[label="Key Name"]', 'E2E Test Key');
    await page.click('input[value="read-only"]');
    await page.click('button:has-text("Create Key")');

    // Should show the created key dialog
    await expect(page.locator('text=API Key Created')).toBeVisible();

    // Should have a key displayed
    const keyInput = page.locator('input[readonly]');
    await expect(keyInput).toHaveValue(/^tmf_/);

    // Copy button should work
    await page.click('button[aria-label="Copy to clipboard"]');
    await expect(page.locator('text=Copied!')).toBeVisible();

    // Close dialog
    await page.click('text=I\'ve Saved My Key');

    // Key should appear in the list
    await expect(page.locator('text=E2E Test Key')).toBeVisible();
  });

  test('should delete an API key', async ({ page }) => {
    // Assuming at least one key exists
    await page.click('button[aria-label="Delete"]').first();

    await expect(page.locator('text=Delete API Key')).toBeVisible();
    await page.click('button:has-text("Delete Key")');

    await expect(page.locator('text=API key deleted successfully')).toBeVisible();
  });
});
```

### 5.5 Read-Only Key Restriction Tests

**File**: `tests/e2e/api-key-auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('API Key Authentication', () => {
  let readOnlyKey: string;
  let fullAccessKey: string;

  test.beforeAll(async ({ request }) => {
    // Login and create keys
    const loginResponse = await request.post('http://localhost:3000/api/v1/auth/login', {
      data: { email: 'test@example.com', password: 'Test123!' },
    });
    const { accessToken } = await loginResponse.json();

    // Create read-only key
    const readOnlyResponse = await request.post('http://localhost:3000/api/v1/api-keys', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Read Only Test', type: 'read-only' },
    });
    const readOnlyData = await readOnlyResponse.json();
    readOnlyKey = readOnlyData.key;

    // Create full-access key
    const fullAccessResponse = await request.post('http://localhost:3000/api/v1/api-keys', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Full Access Test', type: 'full-access' },
    });
    const fullAccessData = await fullAccessResponse.json();
    fullAccessKey = fullAccessData.key;
  });

  test('read-only key should allow GET requests', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/v1/users', {
      headers: { 'X-API-Key': readOnlyKey },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('read-only key should block POST requests', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/v1/users', {
      headers: { 'X-API-Key': readOnlyKey },
      data: { email: 'test@test.com' },
    });
    expect(response.status()).toBe(401);
  });

  test('full-access key should allow all methods', async ({ request }) => {
    const getResponse = await request.get('http://localhost:3000/api/v1/users', {
      headers: { 'X-API-Key': fullAccessKey },
    });
    expect(getResponse.ok()).toBeTruthy();

    // POST would need valid data, but testing auth works
    const postResponse = await request.post('http://localhost:3000/api/v1/api-keys', {
      headers: { 'X-API-Key': fullAccessKey },
      data: { name: 'Another Key', type: 'read-only' },
    });
    expect(postResponse.status()).not.toBe(401); // Should not be auth error
  });
});
```

---

## Phase 6: Documentation Updates

### 6.1 Update CLAUDE.md

Add section for API key authentication:

```markdown
### API Authentication

The application supports two authentication methods:

1. **JWT Authentication** (User login)
   - Login via `/api/v1/auth/login`
   - Include token in `Authorization: Bearer <token>` header

2. **API Key Authentication** (Programmatic access)
   - Create keys in Settings → API Keys tab
   - Include key in `X-API-Key: <key>` or `Authorization: Bearer <key>` header
   - **Read-Only Keys**: Limited to GET requests only
   - **Full-Access Keys**: Can access all endpoints

**Example API Key Usage**:
```bash
# Using X-API-Key header
curl -H "X-API-Key: tmf_1234567890abcdef" http://localhost:3000/api/v1/users

# Using Authorization header
curl -H "Authorization: Bearer tmf_1234567890abcdef" http://localhost:3000/api/v1/users
```
```

### 6.2 Create API Key User Guide

**File**: `docs/guides/api-keys.md`

```markdown
# API Key Management Guide

## Overview

API keys provide programmatic access to the Teamified API without requiring user login credentials. They're ideal for:
- Integrations with third-party services
- Automated scripts and workflows
- CI/CD pipelines
- Mobile applications

## Key Types

### Read-Only Keys
- **Access**: GET requests only
- **Use Case**: Data retrieval, reporting, monitoring
- **Security**: Lower risk if compromised

### Full-Access Keys
- **Access**: All HTTP methods (GET, POST, PATCH, DELETE)
- **Use Case**: Complete automation, administrative tasks
- **Security**: Treat as highly sensitive credentials

## Creating an API Key

1. Navigate to **Settings** → **API Keys** tab
2. Click **Create API Key**
3. Enter a descriptive name
4. Select the key type
5. Click **Create Key**
6. **IMPORTANT**: Copy the key immediately - you won't see it again!

## Using API Keys

Include your API key in requests using either method:

**Method 1: X-API-Key Header**
```bash
curl -H "X-API-Key: tmf_your_key_here" \
  https://api.teamified.com/api/v1/users
```

**Method 2: Authorization Header**
```bash
curl -H "Authorization: Bearer tmf_your_key_here" \
  https://api.teamified.com/api/v1/users
```

## Security Best Practices

1. **Never commit keys to version control**
2. **Use environment variables** for key storage
3. **Rotate keys regularly** (every 90 days recommended)
4. **Use read-only keys** when possible
5. **Delete unused keys** immediately
6. **Monitor key usage** via the "Last Used" timestamp

## Limits

- Maximum 10 active keys per user
- Keys have no expiration date
- No rate limiting differences between key types

## Troubleshooting

### "Invalid API key" Error
- Verify the key hasn't been deleted
- Check for typos or extra spaces
- Ensure key includes `tmf_` prefix

### "Unauthorized" for Non-GET Requests
- Verify you're using a **full-access** key
- Read-only keys cannot access POST/PATCH/DELETE endpoints

### Key Not Working After Creation
- Ensure you copied the complete key (starts with `tmf_`)
- Check the key is marked as "Active" in the Settings page
```

---

## Implementation Checklist

### Backend
- [ ] Create API key entity and migration
- [ ] Implement API keys module (service, controller, DTOs)
- [ ] Add API key authentication guard
- [ ] Implement read-only key restrictions (GET only)
- [ ] Add audit logging for key lifecycle
- [ ] Update Swagger configuration with API key security scheme
- [ ] Add comprehensive Swagger docs to all existing endpoints
- [ ] Add request/response examples to Swagger

### Frontend
- [ ] Create TypeScript types for API keys
- [ ] Create API service methods
- [ ] Add API Keys tab to Settings page
- [ ] Implement ApiKeyList component with DataGrid
- [ ] Create CreateApiKeyModal
- [ ] Create ApiKeyCreatedDialog (one-time display)
- [ ] Create DeleteApiKeyDialog
- [ ] Create EditApiKeyDialog
- [ ] Implement copy-to-clipboard functionality
- [ ] Ensure theme support and dark mode compatibility
- [ ] Add loading states and error handling

### Testing
- [ ] Backend unit tests for service methods
- [ ] Backend integration tests for endpoints
- [ ] Frontend component tests (Vitest)
- [ ] E2E tests for CRUD workflows (Playwright)
- [ ] E2E tests for read-only key restrictions
- [ ] Manual testing of authentication flow

### Documentation
- [ ] Update CLAUDE.md with API key authentication info
- [ ] Create API key user guide
- [ ] Update API documentation

---

## Deployment Notes

1. Run migration after backend deployment:
   ```bash
   npm run typeorm:migration:run
   ```

2. No environment variables required (uses existing database)

3. Test endpoints in Swagger UI with API key authentication

4. Verify CORS configuration includes API key headers

---

## Success Criteria

- ✅ Users can create, view, update, and delete API keys
- ✅ API keys work for authentication in API requests
- ✅ Read-only keys are restricted to GET requests
- ✅ Full-access keys can access all endpoints
- ✅ Keys are securely hashed in database
- ✅ Plain key is only shown once upon creation
- ✅ Last used timestamp updates on successful auth
- ✅ All existing endpoints have complete Swagger docs
- ✅ UI matches theme and supports dark mode
- ✅ Comprehensive test coverage
