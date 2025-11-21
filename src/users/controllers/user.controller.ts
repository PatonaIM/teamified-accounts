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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
import * as path from 'path';

@ApiTags('Users')
@Controller('v1/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly objectStorageService: ObjectStorageService,
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

    return {
      user: {
        ...user,
        roles,
      }
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

  @Get(':id([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})')
  @UseGuards(RolesGuard)
  @Roles('admin', 'timesheet_approver')
  @ApiOperation({ summary: 'Get user by ID' })
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
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{ user: UserResponseDto }> {
    const user = await this.userService.findOne(id);
    return { user };
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
  ): Promise<{ message: string; profilePicture: string }> {
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

    // Get file extension
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Get upload URL from object storage
    const { uploadURL, objectKey } = await this.objectStorageService.getProfilePictureUploadURL(
      user.id,
      ext,
    );

    // Upload file to object storage
    const response = await fetch(uploadURL, {
      method: 'PUT',
      body: file.buffer,
      headers: {
        'Content-Type': file.mimetype,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to upload file to storage');
    }

    // Update user profile with new picture path
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.get('user-agent');

    const updatedUser = await this.userService.updateProfileData(
      user.id,
      { profilePicture: objectKey },
      {
        ip,
        userAgent,
      },
    );

    return {
      message: 'Profile picture uploaded successfully',
      profilePicture: objectKey,
    };
  }

  @Get(':id/profile')
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
  async getUserProfile(@Param('id') id: string): Promise<{ profileData: any }> {
    const user = await this.userService.findOne(id);
    return {
      profileData: user.profileData || {},
    };
  }

  @Put(':id/profile')
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
    @Param('id') id: string,
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

  @Patch(':id')
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
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ user: UserResponseDto }> {
    const user = await this.userService.update(id, updateUserDto);
    return { user };
  }

  @Put(':id')
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
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ user: UserResponseDto }> {
    const user = await this.userService.update(id, updateUserDto);
    return { user };
  }

  @Delete(':id')
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
  async remove(@Param('id') id: string): Promise<void> {
    await this.userService.remove(id);
  }

  @Patch(':id/status')
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
    @Param('id') id: string,
    @Body() body: { status: 'active' | 'inactive' | 'archived' },
  ): Promise<{ user: UserResponseDto }> {
    const user = await this.userService.updateStatus(id, body.status);
    return { user };
  }

  @Patch(':id/verify-email')
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
    @Param('id') id: string,
  ): Promise<{ user: UserResponseDto; message: string }> {
    const user = await this.userService.markEmailVerified(id);
    return {
      user,
      message: 'Email marked as verified successfully'
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
}
