import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserListResponseDto } from '../dto/user-list-response.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { ServiceTokenGuard, RequiredScopes } from '../../common/guards/service-token.guard';
import { ErrorResponseDto, AuthErrorResponseDto } from '../../common/dto/error-response.dto';

@ApiTags('users-s2s')
@Controller('v1/s2s/users')
@UseGuards(ServiceTokenGuard)
@ApiBearerAuth()
export class UserS2SController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get()
  @RequiredScopes('read:users')
  @ApiOperation({ 
    summary: 'Get paginated list of users (S2S)',
    description: `
      Retrieve a paginated list of users with filtering support.
      
      ## Authorization:
      - Requires S2S token with 'read:users' scope
      
      ## Query Parameters:
      - page: Page number (default: 1)
      - limit: Items per page (default: 20)
      - search: Search by name or email
      - status: Filter by status (active/inactive/archived)
      - role: Filter by role
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully',
    type: UserListResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing S2S token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient scopes',
    type: AuthErrorResponseDto
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'archived'], description: 'Filter by status' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role' })
  async findAll(@Query() queryDto: UserQueryDto): Promise<any> {
    return await this.userService.findAllS2S(queryDto);
  }

  @Get(':id')
  @RequiredScopes('read:users')
  @ApiOperation({ 
    summary: 'Get user by ID (S2S)',
    description: `
      Retrieve detailed information about a specific user.
      
      ## Authorization:
      - Requires S2S token with 'read:users' scope
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User retrieved successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing S2S token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient scopes',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    type: ErrorResponseDto
  })
  async findOne(@Param('id') id: string): Promise<{ user: any }> {
    const user = await this.userService.findOneS2S(id);
    return { user };
  }
}
