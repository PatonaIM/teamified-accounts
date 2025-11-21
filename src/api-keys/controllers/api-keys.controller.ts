import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiKeysService } from '../services/api-keys.service';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import { UpdateApiKeyDto } from '../dto/update-api-key.dto';
import {
  ApiKeyResponseDto,
  ApiKeyCreatedResponseDto,
} from '../dto/api-key-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('api-keys')
@Controller('v1/api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new API key',
    description:
      'Generates a new API key for the authenticated user. The plain key is only returned once and cannot be retrieved again.',
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
        key: 'tmf_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (e.g., max keys limit reached)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser() user: any,
    @Body() createDto: CreateApiKeyDto,
  ) {
    const userId = parseInt(user.id || user.sub);
    const { key, apiKey } = await this.apiKeysService.create(userId, createDto);
    return {
      ...apiKey,
      key, // Plain key included only in creation response
    };
  }

  @Get()
  @ApiOperation({
    summary: 'List all API keys',
    description: 'Retrieves all API keys for the authenticated user',
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
          userId: 5,
        },
        {
          id: 2,
          name: 'Integration Key',
          type: 'full-access',
          createdAt: '2024-01-10T08:15:00Z',
          lastUsedAt: null,
          isActive: true,
          userId: 5,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@CurrentUser() user: any) {
    const userId = parseInt(user.id || user.sub);
    return this.apiKeysService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get API key by ID',
    description:
      'Retrieves a specific API key by ID for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'API key found',
    type: ApiKeyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const userId = parseInt(user.id || user.sub);
    return this.apiKeysService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update API key',
    description: 'Updates the name of an API key',
  })
  @ApiResponse({
    status: 200,
    description: 'API key updated successfully',
    type: ApiKeyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() updateDto: UpdateApiKeyDto,
  ) {
    const userId = parseInt(user.id || user.sub);
    return this.apiKeysService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete API key',
    description: 'Deactivates an API key (soft delete)',
  })
  @ApiResponse({
    status: 200,
    description: 'API key deleted successfully',
    schema: {
      example: { message: 'API key deleted successfully' },
    },
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const userId = parseInt(user.id || user.sub);
    await this.apiKeysService.remove(id, userId);
    return { message: 'API key deleted successfully' };
  }
}
