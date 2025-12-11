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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserEmailsService } from './user-emails.service';
import { AddUserEmailDto } from './dto/add-user-email.dto';
import { UpdateUserEmailDto } from './dto/update-user-email.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserEmailResponseDto } from './dto/user-email-response.dto';

@ApiTags('User Emails')
@Controller('user-emails')
export class UserEmailsController {
  constructor(private readonly userEmailsService: UserEmailsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all emails linked to the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of linked emails',
    type: [UserEmailResponseDto],
  })
  async getMyEmails(@Request() req): Promise<UserEmailResponseDto[]> {
    return this.userEmailsService.getUserEmails(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new email to the current user account' })
  @ApiResponse({
    status: 201,
    description: 'Email added successfully',
    type: UserEmailResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async addEmail(
    @Request() req,
    @Body() dto: AddUserEmailDto,
  ): Promise<UserEmailResponseDto> {
    return this.userEmailsService.addEmail(req.user.userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing personal email address' })
  @ApiParam({ name: 'id', description: 'Email ID to update' })
  @ApiResponse({
    status: 200,
    description: 'Email updated successfully',
    type: UserEmailResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Cannot edit work emails' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateEmail(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateUserEmailDto,
  ): Promise<UserEmailResponseDto> {
    return this.userEmailsService.updateEmail(req.user.userId, id, dto.email);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an email from the current user account' })
  @ApiParam({ name: 'id', description: 'Email ID to remove' })
  @ApiResponse({ status: 204, description: 'Email removed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot remove primary email' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async removeEmail(@Request() req, @Param('id') id: string): Promise<void> {
    return this.userEmailsService.removeEmail(req.user.userId, id);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify an email using verification token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Token expired' })
  @ApiResponse({ status: 404, description: 'Invalid token' })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
  ): Promise<{ success: boolean; email: string }> {
    return this.userEmailsService.verifyEmail(dto.token);
  }

  @Put(':id/set-primary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set an email as the primary email' })
  @ApiParam({ name: 'id', description: 'Email ID to set as primary' })
  @ApiResponse({
    status: 200,
    description: 'Email set as primary',
    type: UserEmailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Email not verified' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async setPrimaryEmail(
    @Request() req,
    @Param('id') id: string,
  ): Promise<UserEmailResponseDto> {
    return this.userEmailsService.setPrimaryEmail(req.user.userId, id);
  }

  @Post(':id/resend-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiParam({ name: 'id', description: 'Email ID to resend verification for' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'Email already verified' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async resendVerification(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.userEmailsService.resendVerification(req.user.userId, id);
    return { message: 'Verification email sent' };
  }
}
