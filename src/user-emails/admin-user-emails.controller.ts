import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtOrServiceGuard } from '../common/guards/jwt-or-service.guard';
import { RolesOrServiceGuard } from '../common/guards/roles-or-service.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequiredScopes } from '../common/guards/service-token.guard';
import { UserEmailsService } from './user-emails.service';
import { AdminAddUserEmailDto } from './dto/admin-add-user-email.dto';
import { AdminUpdateUserEmailDto } from './dto/admin-update-user-email.dto';
import { UserEmailResponseDto } from './dto/user-email-response.dto';

const ADMIN_ROLES = [
  'super_admin',
  'internal_hr',
  'internal_account_manager',
  'client_admin',
  'client_hr',
];

@ApiTags('Admin User Emails')
@Controller('v1/users/:userId/emails')
@UseGuards(JwtOrServiceGuard, RolesOrServiceGuard)
@ApiBearerAuth()
export class AdminUserEmailsController {
  constructor(private readonly userEmailsService: UserEmailsService) {}

  @Get()
  @Roles(...ADMIN_ROLES)
  @RequiredScopes('read:user-emails')
  @ApiOperation({ summary: 'Get all emails for a specific user (Admin)' })
  @ApiParam({ name: 'userId', description: 'User ID to get emails for' })
  @ApiResponse({
    status: 200,
    description: 'List of user emails',
    type: [UserEmailResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getUserEmails(
    @Param('userId') userId: string,
  ): Promise<UserEmailResponseDto[]> {
    return this.userEmailsService.getUserEmails(userId);
  }

  @Post()
  @Roles(...ADMIN_ROLES)
  @RequiredScopes('write:user-emails')
  @ApiOperation({ summary: 'Add an email to a specific user (Admin)' })
  @ApiParam({ name: 'userId', description: 'User ID to add email for' })
  @ApiResponse({
    status: 201,
    description: 'Email added successfully',
    type: UserEmailResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async addEmail(
    @Param('userId') userId: string,
    @Body() dto: AdminAddUserEmailDto,
  ): Promise<UserEmailResponseDto> {
    return this.userEmailsService.adminAddEmail(userId, dto);
  }

  @Put(':emailId')
  @Roles(...ADMIN_ROLES)
  @RequiredScopes('write:user-emails')
  @ApiOperation({ summary: 'Update an email for a specific user (Admin)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'emailId', description: 'Email ID to update' })
  @ApiResponse({
    status: 200,
    description: 'Email updated successfully',
    type: UserEmailResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateEmail(
    @Param('userId') userId: string,
    @Param('emailId') emailId: string,
    @Body() dto: AdminUpdateUserEmailDto,
  ): Promise<UserEmailResponseDto> {
    return this.userEmailsService.adminUpdateEmail(userId, emailId, dto);
  }

  @Delete(':emailId')
  @Roles(...ADMIN_ROLES)
  @RequiredScopes('write:user-emails')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an email from a specific user (Admin)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'emailId', description: 'Email ID to remove' })
  @ApiResponse({ status: 204, description: 'Email removed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot remove primary email' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async removeEmail(
    @Param('userId') userId: string,
    @Param('emailId') emailId: string,
  ): Promise<void> {
    return this.userEmailsService.adminRemoveEmail(userId, emailId);
  }

  @Put(':emailId/set-primary')
  @Roles(...ADMIN_ROLES)
  @RequiredScopes('write:user-emails')
  @ApiOperation({ summary: 'Set an email as primary for a specific user (Admin)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'emailId', description: 'Email ID to set as primary' })
  @ApiResponse({
    status: 200,
    description: 'Email set as primary',
    type: UserEmailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Email not verified' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async setPrimaryEmail(
    @Param('userId') userId: string,
    @Param('emailId') emailId: string,
  ): Promise<UserEmailResponseDto> {
    return this.userEmailsService.setPrimaryEmail(userId, emailId);
  }

  @Put(':emailId/verify')
  @Roles(...ADMIN_ROLES)
  @RequiredScopes('write:user-emails')
  @ApiOperation({ summary: 'Manually verify an email for a specific user (Admin)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'emailId', description: 'Email ID to verify' })
  @ApiResponse({
    status: 200,
    description: 'Email verified',
    type: UserEmailResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async verifyEmail(
    @Param('userId') userId: string,
    @Param('emailId') emailId: string,
  ): Promise<UserEmailResponseDto> {
    return this.userEmailsService.adminVerifyEmail(userId, emailId);
  }
}
