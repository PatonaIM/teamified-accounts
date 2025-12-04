import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiSecurity, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { OrganizationMemberResponseDto } from './dto/organization-member-response.dto';
import { ConvertCandidateDto, ConvertCandidateResponseDto } from './dto/convert-candidate.dto';
import { OrganizationQueryDto, PaginatedOrganizationResponseDto } from './dto/organization-query.dto';
import { GlobalSearchResponseDto } from './dto/search-global.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUserGuard } from '../common/guards/current-user.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ErrorResponseDto, AuthErrorResponseDto, BusinessErrorResponseDto } from '../common/dto/error-response.dto';
import { AzureBlobStorageService } from '../blob-storage/azure-blob-storage.service';

@ApiTags('organizations')
@Controller('v1/organizations')
@UseGuards(JwtAuthGuard, CurrentUserGuard, RolesGuard)
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly azureBlobStorageService: AzureBlobStorageService,
  ) {}

  @Post()
  @Roles('super_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new organization',
    description: `
      Create a new organization (super_admin only).
      
      ## Process:
      1. Validate organization data and slug uniqueness
      2. Create organization record
      3. Organization is created empty (no members initially)
      4. Members can be added via the add member endpoint
      
      ## Authorization:
      - Only super_admin users can create organizations
      - super_admin creates the org but does NOT become a member
      
      ## Result:
      - Organization created with free tier and active status
      - No members initially (add members separately)
    `
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Organization created successfully',
    type: OrganizationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data',
    type: BusinessErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions (requires super_admin)',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - Organization with this slug already exists',
    type: BusinessErrorResponseDto
  })
  async create(
    @Body() createDto: CreateOrganizationDto,
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.create(createDto, user, req.ip, req.headers['user-agent']);
  }

  @Get('me')
  @Roles('client_admin', 'client_hr', 'client_recruiter', 'client_hiring_manager')
  @ApiOperation({ 
    summary: 'Get my organization',
    description: `
      Retrieve the organization that the current user belongs to.
      
      ## Authorization:
      - client_admin, client_hr, client_recruiter, client_hiring_manager: Access their own organization
      
      ## Response:
      - Organization details for the user's organization
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organization retrieved successfully',
    type: OrganizationResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Not Found - User does not belong to any organization',
    type: BusinessErrorResponseDto
  })
  async getMyOrganization(
    @CurrentUser() user: User,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.getMyOrganization(user);
  }

  @Get('my-organizations')
  @Roles('client_admin', 'client_hr', 'client_finance', 'client_recruiter', 'client_employee')
  @ApiOperation({ 
    summary: 'Get all my organizations',
    description: `
      Retrieve all organizations that the current user belongs to.
      
      ## Authorization:
      - All client roles can access their own organizations
      
      ## Response:
      - List of organization details for all user's organizations
      - Empty array if user has no organizations
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organizations retrieved successfully',
    type: [OrganizationResponseDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  async getMyOrganizations(
    @CurrentUser() user: User,
  ): Promise<OrganizationResponseDto[]> {
    return this.organizationsService.getMyOrganizations(user);
  }

  @Get(':id/orphan-count')
  @Roles('client_admin')
  @ApiOperation({ 
    summary: 'Get orphan member count for organization deletion',
    description: `
      Get the count of members who will become orphaned if this organization is deleted.
      
      ## Authorization:
      - client_admin: Can check orphan count for their own organization
      
      ## Response:
      - Total member count
      - Count of members who will become orphans (only belong to this organization)
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    example: 'uuid-here',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Orphan count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalMembers: { type: 'number', example: 10 },
        willBecomeOrphans: { type: 'number', example: 8 }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions',
    type: AuthErrorResponseDto
  })
  async getOrphanCount(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<{ totalMembers: number; willBecomeOrphans: number }> {
    this.organizationsService['validateOrgAccess'](id, user);
    return this.organizationsService.getOrphanMemberCount(id);
  }

  @Get('check-slug/:slug')
  @ApiOperation({ 
    summary: 'Check if organization slug is available',
    description: `
      Check if a given slug is available for use.
      
      ## Use Case:
      - Real-time validation during organization creation
      - Client admin signup flow slug validation
      
      ## Response:
      - Returns { available: true } if slug is available
      - Returns { available: false } if slug is already taken
    `
  })
  @ApiParam({
    name: 'slug',
    description: 'The slug to check for availability',
    example: 'acme-corp',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Slug availability check result',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean', example: true },
        slug: { type: 'string', example: 'acme-corp' }
      }
    }
  })
  async checkSlugAvailability(
    @Param('slug') slug: string,
  ): Promise<{ available: boolean; slug: string }> {
    return this.organizationsService.checkSlugAvailability(slug);
  }

  @Get()
  @Roles('super_admin', 'internal_hr', 'internal_account_manager')
  @ApiOperation({ 
    summary: 'Get all organizations',
    description: `
      Retrieve a paginated list of organizations with filtering support.
      
      ## Authorization:
      - super_admin: Full access to all organizations
      - internal_hr: Can view all organizations for HR operations
      - internal_account_manager: Can view all organizations for account management
      
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
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions',
    type: AuthErrorResponseDto
  })
  async findAll(
    @CurrentUser() user: User,
    @Query() query: OrganizationQueryDto,
  ): Promise<PaginatedOrganizationResponseDto> {
    return this.organizationsService.findAll(user, query);
  }

  @Get('search/global')
  @Roles('super_admin', 'internal_hr', 'internal_account_manager')
  @ApiOperation({ 
    summary: 'Global search across organizations and users',
    description: `
      Search across organizations and users with a single query.
      
      ## Authorization:
      - super_admin: Search all organizations and users
      - internal_hr: Search all organizations and users
      - internal_account_manager: Search all organizations and users
      
      ## Query Parameters:
      - q: Search query string
      
      ## Response:
      - Returns matching organizations (up to 10)
      - Returns matching users (up to 20) with their organization context
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully',
    type: GlobalSearchResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions',
    type: AuthErrorResponseDto
  })
  async globalSearch(
    @CurrentUser() user: User,
    @Query('q') query: string,
  ): Promise<GlobalSearchResponseDto> {
    if (!query || query.trim().length === 0) {
      return {
        organizations: [],
        users: [],
        totalOrganizations: 0,
        totalUsers: 0,
      };
    }
    return this.organizationsService.globalSearch(query, user);
  }

  @Get('by-slug/:slug')
  @Roles('super_admin', 'internal_hr', 'internal_account_manager', 'client_admin', 'client_hr', 'client_finance', 'client_recruiter', 'client_employee')
  @ApiOperation({ 
    summary: 'Get organization by slug',
    description: `
      Retrieve detailed information about a specific organization using its URL-friendly slug.
      
      ## Authorization:
      - super_admin: Access any organization
      - internal_*: Access any organization
      - client_*: Access only organizations they are a member of
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
    status: 403, 
    description: 'Forbidden - Not a member of this organization',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Organization not found',
    type: BusinessErrorResponseDto
  })
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.findBySlugWithAccess(slug, user);
  }

  @Get(':id')
  @Roles('super_admin', 'internal_hr', 'internal_account_manager', 'client_admin')
  @ApiOperation({ 
    summary: 'Get organization by ID',
    description: `
      Retrieve detailed information about a specific organization.
      
      ## Authorization:
      - super_admin: Access any organization
      - internal_*: Access any organization
      - client_admin: Access only their own organization (organization scope validated)
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
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions or not a member of this organization',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Organization not found',
    type: BusinessErrorResponseDto
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.findOne(id, user);
  }

  @Put(':id')
  @Roles('super_admin', 'client_admin')
  @ApiOperation({ 
    summary: 'Update organization',
    description: `
      Update organization details (name, slug, industry, etc.).
      
      ## Authorization:
      - super_admin: Can update any organization
      - client_admin: Can update only their own organization (organization scope validated)
      
      ## Validation:
      - Slug must be unique across all organizations
      - All fields are optional (partial update)
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Organization unique identifier',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organization updated successfully',
    type: OrganizationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data',
    type: BusinessErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions or not a member of this organization',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Organization not found',
    type: BusinessErrorResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - Slug already taken by another organization',
    type: BusinessErrorResponseDto
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrganizationDto,
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.update(id, updateDto, user, req.ip, req.headers['user-agent']);
  }

  @Post(':id/logo/upload-url')
  @Roles('super_admin', 'client_admin')
  @ApiOperation({ summary: 'Get presigned URL for organization logo upload' })
  @ApiParam({
    name: 'id',
    description: 'Organization unique identifier',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Upload URL generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file extension',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getLogoUploadUrl(
    @Param('id') organizationId: string,
    @Body() body: { extension: string },
    @CurrentUser() user: User,
  ): Promise<{ uploadURL: string; objectKey: string }> {
    return this.organizationsService.getLogoUploadUrl(organizationId, body.extension, user);
  }

  @Post(':id/logo')
  @Roles('super_admin', 'client_admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload organization logo directly to Azure Blob Storage' })
  @ApiParam({
    name: 'id',
    description: 'Organization unique identifier',
    type: 'string',
    format: 'uuid'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file (JPG, PNG, GIF, WebP, SVG) - Max size: 5MB',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Logo uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadLogo(
    @Param('id') organizationId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<{ message: string; logoUrl: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, GIF, WebP, and SVG are allowed');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    const result = await this.azureBlobStorageService.uploadOrganizationLogo(
      organizationId,
      file.buffer,
      file.originalname,
    );

    await this.organizationsService.updateLogoUrl(
      organizationId,
      result.url,
      user,
      req.ip,
      req.headers['user-agent'],
    );

    return {
      message: 'Logo uploaded successfully',
      logoUrl: result.url,
    };
  }

  @Delete(':id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete organization',
    description: `
      Delete an organization and all associated data.
      
      ## Authorization:
      - Only super_admin users can delete organizations
      
      ## Cascade:
      - All organization members are removed
      - All member user roles are deleted
      - All organization invitations are deleted
      
      ## Warning:
      - This operation cannot be undone
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Organization unique identifier',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Organization deleted successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions (requires super_admin)',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Organization not found',
    type: BusinessErrorResponseDto
  })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<void> {
    return this.organizationsService.delete(id, user, req.ip, req.headers['user-agent']);
  }

  @Get(':id/members')
  @Roles('super_admin', 'internal_hr', 'internal_account_manager', 'client_admin', 'client_hr')
  @ApiOperation({ 
    summary: 'Get organization members',
    description: `
      Retrieve all members of an organization with their roles and status.
      
      ## Authorization:
      - super_admin: Access any organization's members
      - internal_*: Access any organization's members
      - client_admin/client_hr: Access only their own organization's members (organization scope validated)
      
      ## Response:
      - List of members with user details and roles
      - Includes join date and inviter information
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Organization unique identifier',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Members retrieved successfully',
    type: [OrganizationMemberResponseDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions or not a member of this organization',
    type: AuthErrorResponseDto
  })
  async getMembers(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<OrganizationMemberResponseDto[]> {
    return this.organizationsService.getMembers(id, user);
  }

  @Post(':id/members')
  @Roles('super_admin', 'client_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Add member to organization',
    description: `
      Add a user as a member of an organization with a specific role.
      
      ## Authorization:
      - super_admin: Can add members to any organization
      - client_admin: Can add members only to their own organization (organization scope validated)
      
      ## Process:
      1. Validate user exists and organization exists
      2. Check user is not already a member
      3. Create organization_member record
      4. Create user_role record with organization scope
      
      ## Role Restrictions:
      - Only client_* roles allowed (client_admin, client_hr, client_finance, client_recruiter, client_employee)
      - Internal roles (super_admin, internal_*) cannot be assigned through this endpoint
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Organization unique identifier',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Member added successfully',
    type: OrganizationMemberResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data or role type',
    type: BusinessErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions or not a member of this organization',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Organization or user not found',
    type: BusinessErrorResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User is already a member of this organization',
    type: BusinessErrorResponseDto
  })
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<OrganizationMemberResponseDto> {
    return this.organizationsService.addMember(id, addMemberDto, user, req.ip, req.headers['user-agent']);
  }

  @Put(':id/members/:userId/role')
  @Roles('super_admin', 'client_admin')
  @ApiOperation({ 
    summary: 'Update member role',
    description: `
      Update the role of an existing organization member.
      
      ## Authorization:
      - super_admin: Can update roles in any organization
      - client_admin: Can update roles only in their own organization (organization scope validated)
      
      ## Role Restrictions:
      - Only client_* roles allowed
      - Cannot assign internal roles through this endpoint
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Organization unique identifier',
    type: 'string',
    format: 'uuid'
  })
  @ApiParam({
    name: 'userId',
    description: 'User unique identifier',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Member role updated successfully',
    type: OrganizationMemberResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid role type',
    type: BusinessErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions or not a member of this organization',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Member not found in organization',
    type: BusinessErrorResponseDto
  })
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateMemberRoleDto,
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<OrganizationMemberResponseDto> {
    return this.organizationsService.updateMemberRole(id, userId, updateRoleDto, user, req.ip, req.headers['user-agent']);
  }

  @Delete(':id/members/:userId')
  @Roles('super_admin', 'client_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remove member from organization',
    description: `
      Remove a user from an organization.
      
      ## Authorization:
      - super_admin: Can remove members from any organization
      - client_admin: Can remove members only from their own organization (organization scope validated)
      
      ## Process:
      1. Remove organization_member record
      2. Remove associated user_role with organization scope
      
      ## Note:
      - User's other roles and memberships remain unchanged
      - User can be re-added to the organization later
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Organization unique identifier',
    type: 'string',
    format: 'uuid'
  })
  @ApiParam({
    name: 'userId',
    description: 'User unique identifier',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Member removed successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions or not a member of this organization',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Member not found in organization',
    type: BusinessErrorResponseDto
  })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<void> {
    return this.organizationsService.removeMember(id, userId, user, req.ip, req.headers['user-agent']);
  }

  @Post(':id/convert-candidate')
  @Roles('super_admin', 'internal_hr', 'internal_recruiter', 'client_admin', 'client_hr', 'client_recruiter')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Convert candidate to employee',
    description: `
      Convert a candidate user to an employee of this organization.
      Used by ATS to onboard hired candidates.
      
      ## Authorization:
      - super_admin, internal_hr, internal_recruiter: Can convert for any organization
      - client_admin, client_hr, client_recruiter: Can convert for their own organization only (organization scope validated)
      
      ## Process:
      1. Validates organization exists
      2. Validates candidate exists and has 'candidate' role
      3. Validates hiredBy user exists and is an active member of the organization
      4. Checks candidate is not already a member (prevents duplicates)
      5. Creates organization membership
      6. Assigns client_employee role with organization scope
      7. Sends welcome email to the candidate
      8. Creates comprehensive audit logs
      
      ## Result:
      - Candidate becomes an employee of the organization
      - Access upgraded from candidate to client_employee
      - Welcome email sent with onboarding information
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
    status: 201, 
    description: 'Candidate successfully converted to employee',
    type: ConvertCandidateResponseDto,
    schema: {
      example: {
        success: true,
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'candidate@example.com',
          firstName: 'John',
          lastName: 'Doe'
        },
        organizationMembership: {
          organizationId: '123e4567-e89b-12d3-a456-426614174000',
          role: 'client_employee',
          status: 'active'
        },
        message: 'Candidate candidate@example.com successfully converted to employee of Acme Corporation'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid input data or user does not have candidate role or hiredBy user is not a member',
    type: BusinessErrorResponseDto,
    schema: {
      examples: {
        notCandidate: {
          value: {
            statusCode: 400,
            message: 'User candidate@example.com does not have a candidate role',
            error: 'Bad Request'
          }
        },
        hiredByNotMember: {
          value: {
            statusCode: 400,
            message: 'User 123e4567-e89b-12d3-a456-426614174000 is not an active member of organization abc123',
            error: 'Bad Request'
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions or not a member of this organization',
    type: AuthErrorResponseDto,
    schema: {
      example: {
        statusCode: 403,
        message: 'You are not a member of this organization',
        error: 'Forbidden'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Not Found - Organization, candidate, or hiredBy user not found',
    type: BusinessErrorResponseDto,
    schema: {
      examples: {
        organizationNotFound: {
          value: {
            statusCode: 404,
            message: 'Organization with ID 123e4567-e89b-12d3-a456-426614174000 not found',
            error: 'Not Found'
          }
        },
        candidateNotFound: {
          value: {
            statusCode: 404,
            message: 'Candidate with email candidate@example.com not found',
            error: 'Not Found'
          }
        },
        hiredByNotFound: {
          value: {
            statusCode: 404,
            message: 'User with ID 123e4567-e89b-12d3-a456-426614174000 not found',
            error: 'Not Found'
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - Candidate is already a member of this organization',
    type: BusinessErrorResponseDto,
    schema: {
      example: {
        statusCode: 409,
        message: 'Candidate is already a member of this organization',
        error: 'Conflict'
      }
    }
  })
  async convertCandidateToEmployee(
    @Param('id') id: string,
    @Body() dto: ConvertCandidateDto,
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<ConvertCandidateResponseDto> {
    return this.organizationsService.convertCandidateToEmployee(
      id, 
      dto, 
      user,
      req.ip, 
      req.headers['user-agent']
    );
  }
}
