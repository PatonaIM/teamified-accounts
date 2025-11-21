import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Headers,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, ApiBody, ApiParam, ApiSecurity } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import { ErrorResponseDto, ValidationErrorResponseDto, AuthErrorResponseDto, BusinessErrorResponseDto } from '../common/dto/error-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('invitations')
@Controller('v1/invitations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @Roles('Admin', 'OpsAdmin')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new invitation',
    description: `
      Create a new invitation for a user to join the platform.
      
      ## Invitation Process:
      1. Validate invitation data and user permissions
      2. Check for existing invitations to prevent duplicates
      3. Generate unique invitation token and expiration date
      4. Send invitation email to the recipient
      5. Log invitation creation for audit purposes
      
      ## Role-Based Access:
      - Only Admin and OpsAdmin roles can create invitations
      - Invitation creator is tracked for accountability
      - All actions are logged with user context
      
      ## Rate Limiting:
      - Limited to 10 invitations per minute per user
      - Prevents spam and abuse of invitation system
      
      ## Idempotency:
      - Use Idempotency-Key header to prevent duplicate invitations
      - Same key within 24 hours returns existing invitation
    `
  })
  @ApiBody({
    type: CreateInvitationDto,
    description: 'Invitation details including email, role, and optional metadata',
    examples: {
      'admin-invitation': {
        summary: 'Admin invitation',
        description: 'Create an invitation for a new admin user',
        value: {
          email: 'admin@example.com',
          role: 'Admin',
          firstName: 'John',
          lastName: 'Doe',
          metadata: {
            department: 'IT',
            notes: 'New system administrator'
          }
        }
      },
      'user-invitation': {
        summary: 'Regular user invitation',
        description: 'Create an invitation for a regular user',
        value: {
          email: 'user@example.com',
          role: 'User',
          firstName: 'Jane',
          lastName: 'Smith'
        }
      }
    }
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Optional idempotency key for duplicate prevention',
    required: false,
    example: 'invitation-2024-01-15-user@example.com'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Invitation created successfully',
    type: InvitationResponseDto,
    headers: {
      'X-Invitation-ID': {
        description: 'Unique identifier for the created invitation',
        schema: { type: 'string', example: 'inv_1234567890abcdef' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid invitation data',
    type: ValidationErrorResponseDto
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
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - Invitation already exists',
    type: BusinessErrorResponseDto
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error',
    type: ErrorResponseDto
  })
  async create(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser() user: CurrentUserData,
    @Headers('idempotency-key') idempotencyKey: string,
    @Request() req: any,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.create(
      createInvitationDto,
      user.id,
      user.role,
      req.ip,
      req.get('user-agent'),
      idempotencyKey,
    );
  }

  @Get()
  @Roles('Admin', 'OpsAdmin')
  @ApiOperation({ 
    summary: 'Get all invitations',
    description: `
      Retrieve a list of all invitations in the system.
      
      ## Access Control:
      - Only Admin and OpsAdmin roles can view all invitations
      - Returns invitations created by all users
      - Sensitive information is filtered based on user permissions
      
      ## Data Privacy:
      - Personal information is included only for authorized users
      - Invitation tokens are never returned in list responses
      - Expired invitations are clearly marked
      
      ## Use Cases:
      - Monitor invitation status and usage
      - Track invitation creation patterns
      - Audit invitation management activities
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of invitations retrieved successfully',
    type: [InvitationResponseDto],
    headers: {
      'X-Total-Count': {
        description: 'Total number of invitations',
        schema: { type: 'integer', example: 42 }
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
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error',
    type: ErrorResponseDto
  })
  async findAll(): Promise<InvitationResponseDto[]> {
    return this.invitationsService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'OpsAdmin')
  @ApiOperation({ 
    summary: 'Get invitation by ID',
    description: `
      Retrieve a specific invitation by its unique identifier.
      
      ## Access Control:
      - Only Admin and OpsAdmin roles can view individual invitations
      - Full invitation details including token are returned
      - Creator information is included for audit purposes
      
      ## Response Details:
      - Complete invitation information including metadata
      - Invitation status and expiration information
      - Creator and recipient details
      - Creation and update timestamps
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the invitation',
    type: 'string',
    example: 'inv_1234567890abcdef',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Invitation retrieved successfully',
    type: InvitationResponseDto,
    headers: {
      'X-Invitation-Status': {
        description: 'Current status of the invitation',
        schema: { type: 'string', example: 'pending' }
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
  @ApiResponse({ 
    status: 404, 
    description: 'Invitation not found',
    type: BusinessErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error',
    type: ErrorResponseDto
  })
  async findOne(@Param('id') id: string): Promise<InvitationResponseDto> {
    return this.invitationsService.findOne(id);
  }

  @Post(':id/resend')
  @Roles('Admin', 'OpsAdmin')
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 resends per 5 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Resend invitation',
    description: `
      Resend an existing invitation to the recipient.
      
      ## Resend Process:
      1. Validate invitation exists and is resendable
      2. Check rate limiting to prevent spam
      3. Generate new invitation token and expiration
      4. Send updated invitation email to recipient
      5. Log resend action for audit purposes
      
      ## Resend Conditions:
      - Invitation must be in 'pending' status
      - Invitation must not be expired
      - Rate limit must not be exceeded
      - Original invitation must exist
      
      ## Rate Limiting:
      - Limited to 5 resends per 5 minutes per user
      - Prevents abuse of resend functionality
      - Tracks resend history for monitoring
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the invitation to resend',
    type: 'string',
    example: 'inv_1234567890abcdef',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Invitation resent successfully',
    type: InvitationResponseDto,
    headers: {
      'X-Resend-Count': {
        description: 'Number of times this invitation has been resent',
        schema: { type: 'integer', example: 2 }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Cannot resend this invitation',
    type: BusinessErrorResponseDto
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
  @ApiResponse({ 
    status: 404, 
    description: 'Invitation not found',
    type: BusinessErrorResponseDto
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error',
    type: ErrorResponseDto
  })
  async resend(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Request() req: any,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.resend(
      id,
      user.id,
      user.role,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Delete(':id')
  @Roles('Admin', 'OpsAdmin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete invitation',
    description: `
      Delete an invitation from the system.
      
      ## Deletion Process:
      1. Validate invitation exists and is deletable
      2. Check if invitation can be safely deleted
      3. Remove invitation from database
      4. Log deletion action for audit purposes
      
      ## Deletion Conditions:
      - Invitation must exist in the system
      - Invitation must not be in 'accepted' status
      - User must have appropriate permissions
      
      ## Audit Trail:
      - Deletion is logged with user context
      - Soft delete may be implemented for data retention
      - Original invitation data may be archived
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the invitation to delete',
    type: 'string',
    example: 'inv_1234567890abcdef',
    required: true
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Invitation deleted successfully',
    headers: {
      'X-Deleted-At': {
        description: 'Timestamp when the invitation was deleted',
        schema: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Cannot delete this invitation',
    type: BusinessErrorResponseDto
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
  @ApiResponse({ 
    status: 404, 
    description: 'Invitation not found',
    type: BusinessErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error',
    type: ErrorResponseDto
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.invitationsService.remove(id);
  }
}