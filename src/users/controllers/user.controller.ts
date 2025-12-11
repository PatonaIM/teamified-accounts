import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserListResponseDto } from '../dto/user-list-response.dto';
import { BulkStatusUpdateDto } from '../dto/bulk-status-update.dto';
import { BulkRoleAssignmentDto } from '../dto/bulk-role-assignment.dto';
import { BulkOperationResponseDto } from '../dto/bulk-operation-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { ObjectStorageService } from '../../blob-storage/object-storage.service';
import { AzureBlobStorageService } from '../../blob-storage/azure-blob-storage.service';
import { EmailService } from '../../email/services/email.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { UUID_PARAM_PATTERN } from '../../common/constants/routing';
import * as path from 'path';

@ApiTags('Users')
@Controller('v1/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly azureBlobStorageService: AzureBlobStorageService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<{ user: UserResponseDto }> {
    const user = await this.userService.create(createUserDto);
    return { user };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'timesheet_approver')
  @ApiOperation({ summary: 'Get paginated list of users' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: UserListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'archived'], description: 'Filter by status' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  async findAll(@Query() queryDto: UserQueryDto): Promise<UserListResponseDto> {
    return await this.userService.findAll(queryDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCurrentUser(@Request() req: any): Promise<{ user: UserResponseDto }> {
    console.log('getCurrentUser: JWT payload:', req.user);
    console.log('getCurrentUser: Looking up user with ID:', req.user.sub);
    const user = await this.userService.findOne(req.user.sub);
    console.log('getCurrentUser: Found user:', { id: user.id, email: user.email, roles: user.userRoles?.map(r => r.roleType) });

    // Manually add roles property to response (extracted from userRoles)
    const roles = user.userRoles?.map(r => r.roleType).filter(Boolean) || [];

    // Transform organizationMembers into organizations array for frontend
    // Only include active memberships (not invited/pending status)
    // Role types are stored in userRoles with scopeEntityId = organizationId
    const organizations = user.organizationMembers
      ?.filter(om => om.status === 'active')
      .map(om => {
        // Find the role for this organization from userRoles
        const orgRole = user.userRoles?.find(ur => 
          ur.scope === 'organization' && ur.scopeEntityId === om.organizationId
        );
        return {
          organizationId: om.organization?.id,
          organizationName: om.organization?.name,
          organizationSlug: om.organization?.slug,
          organizationLogoUrl: om.organization?.logoUrl || null,
          roleType: orgRole?.roleType || 'member',
          joinedAt: om.createdAt?.toISOString(),
        };
      }).filter(org => org.organizationId) || [];

    console.log('getCurrentUser: Transformed organizations:', organizations);

    return {
      user: {
        ...user,
        roles,
        organizations,
      }
    };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user settings (e.g., theme preference)' })
  @ApiResponse({
    status: 200,
    description: 'User settings updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateCurrentUser(
    @CurrentUser() currentUser: User,
    @Body() updateData: Partial<UpdateUserDto>,
    @Request() req: any,
  ): Promise<{ message: string; user: UserResponseDto }> {
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.get('user-agent');

    const updatedUser = await this.userService.update(currentUser.id, updateData);

    // Manually add roles property to response
    const roles = updatedUser.userRoles?.map(r => r.roleType).filter(Boolean) || [];

    return {
      message: 'User settings updated successfully',
      user: {
        ...updatedUser,
        roles,
      },
    };
  }

  @Get('debug/:id')
  @ApiOperation({ summary: 'Debug user lookup' })
  async debugUser(@Param('id') id: string): Promise<{ user: any }> {
    console.log('debugUser: Looking up user with ID:', id);
    const user = await this.userService.findOne(id);
    console.log('debugUser: Found user:', { id: user.id, email: user.email, roles: user.userRoles?.map(r => r.roleType) });
    return { user };
  }

  @Get(`:id(${UUID_PARAM_PATTERN})`)
  @UseGuards(RolesGuard)
  @Roles('admin', 'timesheet_approver', 'internal_hr', 'internal_account_manager', 'internal_staff', 'client_admin', 'client_hr')
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: `
      Retrieve detailed user information by ID.
      
      ## Authorization:
      - super_admin, admin, internal_*: Can view any user
      - client_admin, client_hr: Can only view users within their organization(s)
    `
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Client users can only view users within their organization',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ user: UserResponseDto }> {
    const currentUserRoles = currentUser.userRoles?.map(r => r.roleType) || [];
    
    const internalRoles = [
      'super_admin',
      'admin',
      'internal_hr',
      'internal_account_manager',
      'internal_recruiter',
      'internal_finance',
      'internal_marketing',
      'internal_staff',
      'timesheet_approver',
    ];
    
    const hasInternalRole = currentUserRoles.some(r => 
      internalRoles.includes(r.toLowerCase())
    );
    
    if (!hasInternalRole) {
      const isClientUser = currentUserRoles.some(r => 
        r.toLowerCase().startsWith('client_')
      );
      
      if (isClientUser) {
        const canAccess = await this.organizationsService.canUserAccessUser(
          currentUser.id,
          id
        );
        
        if (!canAccess) {
          throw new ForbiddenException('You can only view users within your organization');
        }
      }
    }
    
    const user = await this.userService.findOne(id);
    const userDto = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    return { user: userDto };
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get current user profile data' })
  @ApiResponse({
    status: 200,
    description: 'Profile data retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMyProfile(
    @CurrentUser() user: User,
  ): Promise<{ profileData: any }> {
    const fullUser = await this.userService.findOne(user.id);
    
    return {
      profileData: fullUser.profileData || {},
    };
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update current user profile data' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateMyProfile(
    @CurrentUser() user: User,
    @Body() profileData: { profileData: any },
    @Request() req: any,
  ): Promise<{ message: string; profileData: any }> {
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.get('user-agent');

    const updatedUser = await this.userService.updateProfileData(
      user.id,
      profileData.profileData,
      {
        ip,
        userAgent,
      },
    );

    return {
      message: 'Profile updated successfully',
      profileData: updatedUser.profileData,
    };
  }

  @Put('me/email')
  @ApiOperation({ summary: 'Update current user primary email address' })
  @ApiResponse({
    status: 200,
    description: 'Email updated successfully, verification email sent',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email format or same as current email',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already in use by another account',
  })
  async updateMyEmail(
    @CurrentUser() user: User,
    @Body() emailData: { email: string; secondaryEmail?: string | null },
    @Request() req: any,
  ): Promise<{ message: string; emailVerificationRequired: boolean }> {
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.get('user-agent');

    if (!emailData.email || !emailData.email.trim()) {
      throw new BadRequestException('Email address is required');
    }

    const { user: updatedUser, verificationToken } = await this.userService.updatePrimaryEmail(
      user.id,
      emailData.email.trim(),
      emailData.secondaryEmail?.trim() || null,
      {
        ip,
        userAgent,
      },
    );

    try {
      await this.emailService.sendEmailVerificationReminder(
        updatedUser.email,
        updatedUser.firstName,
        verificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    return {
      message: 'Email updated successfully. Please check your inbox to verify your new email address.',
      emailVerificationRequired: true,
    };
  }

  @Post('me/profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Profile picture file',
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPG, PNG, GIF, WebP) - Max size: 5MB',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Profile picture uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadProfilePicture(
    @CurrentUser() user: User,
    @UploadedFile() file: any,
    @Request() req: any,
  ): Promise<{ message: string; profilePictureUrl: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed');
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Upload to Azure Blob Storage
    const result = await this.azureBlobStorageService.uploadUserProfilePicture(
      user.id,
      file.buffer,
      file.originalname,
    );

    // Update user profile picture URL in database
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.get('user-agent');

    await this.userService.updateProfilePictureUrl(
      user.id,
      result.url,
      {
        actorUserId: user.id,
        ip,
        userAgent,
      },
    );

    return {
      message: 'Profile picture uploaded successfully',
      profilePictureUrl: result.url,
    };
  }

  @Get('me/activity')
  @ApiOperation({ 
    summary: 'Get current user activity',
    description: 'Retrieves login history, connected apps, and recent actions for the authenticated user.'
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Time range filter for activity data',
    enum: ['1h', '3h', '6h', '12h', '24h', '3d', '7d', '30d'],
  })
  @ApiResponse({
    status: 200,
    description: 'User activity retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMyActivity(
    @CurrentUser() user: User,
    @Query('timeRange') timeRange?: string,
  ) {
    return await this.userService.getUserActivity(user.id, timeRange);
  }

  @Get(`:id(${UUID_PARAM_PATTERN})/profile`)
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Get user profile data by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Profile data retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserProfile(@Param('id', ParseUUIDPipe) id: string): Promise<{ profileData: any }> {
    const user = await this.userService.findOne(id);
    return {
      profileData: user.profileData || {},
    };
  }

  @Put(`:id(${UUID_PARAM_PATTERN})/profile`)
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Update user profile data by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() profileData: any,
    @Request() req: any,
  ): Promise<{ message: string; profileData: any }> {
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.get('user-agent');

    const updatedUser = await this.userService.updateProfileData(
      id,
      profileData,
      {
        ip,
        userAgent,
      },
    );

    return {
      message: 'Profile updated successfully',
      profileData: updatedUser.profileData,
    };
  }

  @Patch(`:id(${UUID_PARAM_PATTERN})`)
  @UseGuards(RolesGuard)
  @Roles('admin', 'timesheet_approver')
  @ApiOperation({ summary: 'Update user (partial update)' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ user: UserResponseDto }> {
    const user = await this.userService.update(id, updateUserDto);
    return { user };
  }

  @Put(`:id(${UUID_PARAM_PATTERN})`)
  @UseGuards(RolesGuard)
  @Roles('admin', 'timesheet_approver')
  @ApiOperation({ summary: 'Update user (full update)' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async fullUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ user: UserResponseDto }> {
    const user = await this.userService.update(id, updateUserDto);
    return { user };
  }

  @Delete(`:id(${UUID_PARAM_PATTERN})`)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.userService.remove(id);
  }

  @Patch(`:id(${UUID_PARAM_PATTERN})/status`)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status value',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: 'active' | 'inactive' | 'archived' },
  ): Promise<{ user: UserResponseDto }> {
    const user = await this.userService.updateStatus(id, body.status);
    return { user };
  }

  @Patch(`:id(${UUID_PARAM_PATTERN})/verify-email`)
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Mark user email as verified (Admin/HR only)' })
  @ApiResponse({
    status: 200,
    description: 'Email marked as verified successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async verifyUserEmail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ user: UserResponseDto; message: string }> {
    const user = await this.userService.markEmailVerified(id);
    return {
      user,
      message: 'Email marked as verified successfully'
    };
  }

  @Post(`:id(${UUID_PARAM_PATTERN})/resend-verification`)
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Resend verification email to user (Admin/HR only)' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async resendVerificationEmail(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const user = await this.userService.findOne(id);
    
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = await this.userService.generateEmailVerificationToken(id);
    
    const baseUrl = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'http://localhost:5000';
    
    try {
      await this.emailService.sendEmailVerificationReminder(
        user.email,
        user.firstName,
        verificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }

    return {
      message: 'Verification email sent successfully'
    };
  }

  @Post('bulk/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Bulk update user status' })
  @ApiResponse({
    status: 200,
    description: 'Bulk status update completed',
    type: BulkOperationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async bulkUpdateStatus(
    @Body() bulkStatusUpdateDto: BulkStatusUpdateDto,
  ): Promise<BulkOperationResponseDto> {
    return await this.userService.bulkUpdateStatus(bulkStatusUpdateDto);
  }

  @Post('bulk/assign-role')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Bulk assign roles to users' })
  @ApiResponse({
    status: 200,
    description: 'Bulk role assignment completed',
    type: BulkOperationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async bulkAssignRole(
    @Body() bulkRoleAssignmentDto: BulkRoleAssignmentDto,
  ): Promise<BulkOperationResponseDto> {
    return await this.userService.bulkAssignRole(bulkRoleAssignmentDto);
  }

  @Get(`:id(${UUID_PARAM_PATTERN})/activity`)
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  @ApiOperation({ 
    summary: 'Get user activity',
    description: 'Retrieves login history, connected apps, and recent actions for a user. Useful for user analytics and security monitoring.'
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Time range filter for activity data',
    enum: ['1h', '3h', '6h', '12h', '24h', '3d', '7d', '30d'],
  })
  @ApiResponse({
    status: 200,
    description: 'User activity retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        loginHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
              ip: { type: 'string' },
              userAgent: { type: 'string' },
              deviceType: { type: 'string', enum: ['Desktop', 'Mobile', 'Tablet'] },
            },
          },
        },
        lastAppsUsed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              appName: { type: 'string' },
              clientId: { type: 'string' },
              lastUsed: { type: 'string', format: 'date-time' },
            },
          },
        },
        recentActions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              action: { type: 'string' },
              entityType: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserActivity(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('timeRange') timeRange?: string,
  ) {
    return await this.userService.getUserActivity(id, timeRange);
  }
}
