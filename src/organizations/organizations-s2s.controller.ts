import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { OrganizationQueryDto, PaginatedOrganizationResponseDto } from './dto/organization-query.dto';
import { ServiceTokenGuard, RequiredScopes } from '../common/guards/service-token.guard';
import { ErrorResponseDto, AuthErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('organizations-s2s')
@Controller('v1/s2s/organizations')
@UseGuards(ServiceTokenGuard)
@ApiBearerAuth()
export class OrganizationsS2SController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Get()
  @RequiredScopes('read:organizations')
  @ApiOperation({ 
    summary: 'Get all organizations (S2S)',
    description: `
      Retrieve a paginated list of organizations with filtering support.
      
      ## Authorization:
      - Requires S2S token with 'read:organizations' scope
      
      ## Query Parameters:
      - page: Page number (default: 1)
      - limit: Items per page (default: 20)
      - search: Search by organization name or slug
      - industry: Filter by industry
      - companySize: Filter by company size
      - status: Filter by status (active/inactive)
      - subscriptionTier: Filter by subscription tier
      
      ## Response:
      - Paginated list of organizations with member counts
      - Pagination metadata (total, totalPages, page, limit)
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organizations retrieved successfully',
    type: PaginatedOrganizationResponseDto
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
  async findAll(
    @Query() query: OrganizationQueryDto,
  ): Promise<PaginatedOrganizationResponseDto> {
    return this.organizationsService.findAllS2S(query);
  }

  @Get(':id')
  @RequiredScopes('read:organizations')
  @ApiOperation({ 
    summary: 'Get organization by ID (S2S)',
    description: `
      Retrieve detailed information about a specific organization.
      
      ## Authorization:
      - Requires S2S token with 'read:organizations' scope
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Organization unique identifier',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organization retrieved successfully',
    type: OrganizationResponseDto
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
    description: 'Organization not found',
    type: ErrorResponseDto
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.findOneS2S(id);
  }

  @Get('by-slug/:slug')
  @RequiredScopes('read:organizations')
  @ApiOperation({ 
    summary: 'Get organization by slug (S2S)',
    description: `
      Retrieve detailed information about a specific organization using its URL-friendly slug.
      
      ## Authorization:
      - Requires S2S token with 'read:organizations' scope
    `
  })
  @ApiParam({
    name: 'slug',
    description: 'Organization URL-friendly slug',
    type: 'string',
    example: 'acme-corp'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organization retrieved successfully',
    type: OrganizationResponseDto
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
    description: 'Organization not found',
    type: ErrorResponseDto
  })
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.findBySlugS2S(slug);
  }
}
