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
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, ApiBody, ApiParam, ApiSecurity } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CreateInternalInvitationDto } from './dto/create-internal-invitation.dto';
import { GenerateOrgShareableLinkDto } from './dto/generate-org-shareable-link.dto';
import { AcceptOrganizationInvitationDto } from './dto/accept-organization-invitation.dto';
import { AcceptInternalInvitationDto } from './dto/accept-internal-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import { InvitationPreviewDto } from './dto/invitation-preview.dto';
import { InternalInvitationResponseDto } from './dto/internal-invitation-response.dto';
import { AcceptInvitationResponseDto } from '../auth/dto/accept-invitation.dto';
import { ErrorResponseDto, ValidationErrorResponseDto, AuthErrorResponseDto, BusinessErrorResponseDto } from '../common/dto/error-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUserGuard } from '../common/guards/current-user.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('invitations')
@Controller('v1/invitations')
export class InvitationsController {
  private readonly logger = new Logger(InvitationsController.name);

  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('accept')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for public endpoint
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Accept organization invitation (public)',
    description: `
      Public endpoint for new users to accept an organization invitation and create their account.
      This endpoint does NOT require authentication.
      
      ## Process Flow:
      1. Validates the invitation code and checks expiration
      2. Validates password strength and confirmation
      3. Creates new user account or reactivates inactive account
      4. Creates organization membership
      5. Assigns appropriate role to the user
      6. Sends email verification
      7. Creates comprehensive audit logs
      
      ## Security:
      - Password must meet security requirements (min 8 chars, uppercase, lowercase, number, special char)
      - Email verification is required before full account access
      - Rate limited to prevent abuse (5 requests per minute)
      
      ## Business Rules:
      - If user already exists and is active: returns 409 Conflict
      - If user exists but inactive: reactivates and updates password
      - Invitation must be valid, not expired, and not fully used
      - Each acceptance increments the invitation usage counter
    `
  })
  @ApiBody({
    type: AcceptOrganizationInvitationDto,
    description: 'Invitation acceptance details including credentials and user information',
    examples: {
      'new-user-acceptance': {
        summary: 'New user accepting invitation',
        description: 'Complete signup flow for a new user',
        value: {
          inviteCode: 'abc123xyz456def789',
          email: 'john.doe@example.com',
          password: 'MySecurePass123!',
          confirmPassword: 'MySecurePass123!',
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Invitation accepted successfully, account created',
    type: AcceptInvitationResponseDto,
    headers: {
      'X-User-ID': {
        description: 'Unique identifier for the created user',
        schema: { type: 'string', format: 'uuid' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid data, passwords mismatch, or password policy violation',
    type: ValidationErrorResponseDto,
    content: {
      'application/json': {
        examples: {
          'password-mismatch': {
            summary: 'Passwords do not match',
            value: {
              statusCode: 400,
              message: 'Passwords do not match',
              error: 'Bad Request'
            }
          },
          'password-policy': {
            summary: 'Password policy violation',
            value: {
              statusCode: 400,
              message: {
                message: 'Password does not meet security requirements',
                errors: [
                  'Password must contain at least one uppercase letter',
                  'Password must contain at least one special character (@$!%*?&)'
                ]
              },
              error: 'Bad Request'
            }
          },
          'invitation-expired': {
            summary: 'Invitation has expired',
            value: {
              statusCode: 400,
              message: 'Invitation has expired',
              error: 'Bad Request'
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Invitation not found',
    type: BusinessErrorResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - User already has an active account',
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
  async acceptOrganizationInvitation(
    @Body() acceptDto: AcceptOrganizationInvitationDto,
    @Request() req: any,
  ): Promise<AcceptInvitationResponseDto> {
    // Use frontend URL for email verification links
    // Priority: FRONTEND_URL (custom/production) > REPLIT_DEV_DOMAIN (Replit) > request host (fallback)
    const baseUrl = process.env.FRONTEND_URL 
      || (process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
          : `${req.protocol}://${req.get('host')}`);
    return this.invitationsService.acceptOrganizationInvitation(
      acceptDto,
      baseUrl,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Get('preview/:code')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Preview invitation details (public)',
    description: `
      Public endpoint to preview invitation details without authentication.
      Users can view invitation details before accepting.
    `
  })
  @ApiParam({
    name: 'code',
    description: 'Unique invitation code',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Invitation details retrieved successfully',
    type: InvitationPreviewDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Invitation not found',
    type: ErrorResponseDto
  })
  async preview(@Param('code') code: string): Promise<InvitationPreviewDto> {
    return this.invitationsService.preview(code);
  }

  @Get('internal/:code')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get internal invitation details (public)',
    description: 'Public endpoint to fetch invitation details including whether email is pre-assigned.',
  })
  @ApiParam({
    name: 'code',
    description: 'Invitation code',
    example: 'ABC123XYZ',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found',
    type: BusinessErrorResponseDto,
  })
  async getInternalInvitationDetails(@Param('code') code: string) {
    return this.invitationsService.getInternalInvitationDetails(code);
  }

  @Post('internal/accept')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Accept internal invitation (public)',
    description: 'Public endpoint for internal team members to accept their invitation and set up their account.',
  })
  @ApiResponse({
    status: 201,
    description: 'Internal invitation accepted successfully',
    type: AcceptInvitationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data or password requirements not met',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found',
    type: BusinessErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User already has an active account',
    type: BusinessErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto,
  })
  async acceptInternalInvitation(
    @Body() acceptDto: AcceptInternalInvitationDto,
    @Request() req: any,
  ): Promise<AcceptInvitationResponseDto> {
    try {
      this.logger.log(`[acceptInternalInvitation] Starting invitation acceptance for ${acceptDto.email}`);
      // Use frontend URL for email verification links
      // Priority: FRONTEND_URL (custom/production) > REPLIT_DEV_DOMAIN (Replit) > request host (fallback)
      const baseUrl = process.env.FRONTEND_URL 
        || (process.env.REPLIT_DEV_DOMAIN 
            ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
            : `${req.protocol}://${req.get('host')}`);
      const result = await this.invitationsService.acceptInternalInvitation(
        acceptDto,
        baseUrl,
        req.ip,
        req.get('user-agent'),
      );
      this.logger.log(`[acceptInternalInvitation] Successfully completed for ${acceptDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`[acceptInternalInvitation] Error for ${acceptDto.email}:`, error.stack);
      throw error;
    }
  }

  @Post('internal')
  @UseGuards(JwtAuthGuard, CurrentUserGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create an internal user invitation',
    description: `
      Create a new invitation for an internal Teamified team member.
      
      ## Internal Invitation Process:
      1. Validate email domain (@teamified.com or @teamified.com.au)
      2. Generate unique invitation code
      3. Send invitation email to the team member
      4. Return shareable invitation URL
      5. Log invitation creation for audit purposes
      
      ## Security:
      - Only super_admin can create internal invitations
      - Email must be from @teamified.com or @teamified.com.au
      - Invitations expire after 7 days
      - Each invitation is single-use by default
      
      ## Rate Limiting:
      - Limited to 5 invitations per minute
      - Prevents spam and abuse
    `
  })
  @ApiBody({
    type: CreateInternalInvitationDto,
    description: 'Internal invitation details',
    examples: {
      'super-admin-invitation': {
        summary: 'Super Admin invitation',
        description: 'Invite a new super admin',
        value: {
          email: 'admin@teamified.com',
          roleType: 'super_admin'
        }
      },
      'internal-hr-invitation': {
        summary: 'Internal HR invitation',
        description: 'Invite an internal HR team member',
        value: {
          email: 'hr.manager@teamified.com',
          roleType: 'internal_hr',
          maxUses: 1
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Internal invitation created successfully',
    type: InternalInvitationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid email domain or data',
    type: ValidationErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Only super_admin can create internal invitations',
    type: AuthErrorResponseDto
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
  async createInternal(
    @Body() createDto: CreateInternalInvitationDto,
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<InternalInvitationResponseDto> {
    // Use frontend URL for invitation acceptance links
    // Priority: FRONTEND_URL (custom/production) > REPLIT_DEV_DOMAIN (Replit) > request host (fallback)
    const baseUrl = process.env.FRONTEND_URL 
      || (process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
          : `${req.protocol}://${req.get('host')}`);
    return this.invitationsService.createInternalInvitation(
      createDto,
      user,
      baseUrl,
      undefined, // Use default 168 hours (7 days) for email invitations
      req.ip,
      req.get('user-agent'),
    );
  }

  @Post('internal/generate-link')
  @UseGuards(JwtAuthGuard, CurrentUserGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Generate a shareable invite link for internal members',
    description: `
      Generate a shareable invitation link for internal team members with 1-hour expiration.
      
      ## Shareable Link Process:
      1. Generate unique invitation code
      2. Create invitation with internal_employee role and 1-hour expiration
      3. Return shareable URL that can be used by anyone with approved email domain
      4. Log link generation for audit purposes
      
      ## Features:
      - 1-hour expiration for security
      - Single-use link (maxUses: 1)
      - Assigns internal_employee role by default
      - No email required - link can be shared anywhere
      
      ## Security:
      - Only super_admin can generate shareable links
      - Links expire after 1 hour
      - Email domain validation during acceptance (@teamified.com or @teamified.com.au)
      - Each link can only be used once
    `
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Shareable invite link generated successfully',
    type: InternalInvitationResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Only super_admin can generate shareable links',
    type: AuthErrorResponseDto
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
  async generateShareableLink(
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<InternalInvitationResponseDto> {
    // Use frontend URL for invitation acceptance links
    // Priority: FRONTEND_URL (custom/production) > REPLIT_DEV_DOMAIN (Replit) > request host (fallback)
    const baseUrl = process.env.FRONTEND_URL 
      || (process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
          : `${req.protocol}://${req.get('host')}`);
    return this.invitationsService.generateShareableInviteLink(
      user,
      baseUrl,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Post('generate-link')
  @UseGuards(CurrentUserGuard, RolesGuard)
  @Roles('super_admin', 'client_admin')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Generate a shareable invite link for organization',
    description: `
      Generate a shareable invitation link for an organization with 7-day expiration.
      
      ## Shareable Link Process:
      1. Validate organization access (admin permission required)
      2. Generate unique invitation code
      3. Create invitation with specified role and expiration (7 days)
      4. Return shareable URL that can be used by multiple users (up to maxUses)
      5. Log link generation for audit purposes
      
      ## Features:
      - 7-day expiration (consistent with email invitations)
      - Configurable max uses (default: 1)
      - Assigns specified role to users who accept
      - No email required - link can be shared anywhere
      
      ## Security:
      - Only super_admin and client_admin can generate links
      - client_admin can only generate links for their own organization
      - Links expire after 7 days
      - Usage tracked (currentUses increments with each acceptance)
      
      ## Use Cases:
      - Bulk onboarding (set maxUses to desired number)
      - Social media recruitment campaigns
      - Job postings with direct application links
      - Quick team member additions without email collection
    `
  })
  @ApiBody({
    type: GenerateOrgShareableLinkDto,
    description: 'Organization shareable link generation details',
    examples: {
      'single-use-link': {
        summary: 'Single-use employee link',
        description: 'Generate a one-time use invitation link',
        value: {
          organizationId: '123e4567-e89b-12d3-a456-426614174000',
          roleType: 'client_employee',
          maxUses: 1
        }
      },
      'bulk-recruitment-link': {
        summary: 'Bulk recruitment link',
        description: 'Generate a multi-use link for recruiting multiple candidates',
        value: {
          organizationId: '123e4567-e89b-12d3-a456-426614174000',
          roleType: 'candidate',
          maxUses: 50
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Shareable invite link generated successfully',
    type: InvitationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid organization or role',
    type: ValidationErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions for this organization',
    type: AuthErrorResponseDto
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
  async generateOrgShareableLink(
    @Body() generateDto: GenerateOrgShareableLinkDto,
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<InvitationResponseDto> {
    // Use frontend URL for invitation acceptance links
    // Priority: FRONTEND_URL (custom/production) > REPLIT_DEV_DOMAIN (Replit) > request host (fallback)
    const baseUrl = process.env.FRONTEND_URL 
      || (process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
          : `${req.protocol}://${req.get('host')}`);
    return this.invitationsService.generateOrgShareableLink(
      generateDto.organizationId,
      generateDto.roleType,
      generateDto.maxUses || 1,
      user,
      baseUrl,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Post('send-email')
  @UseGuards(CurrentUserGuard, RolesGuard)
  @Roles('super_admin', 'client_admin')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Send email invitation to join organization',
    description: `
      Send an email invitation to a user to join an organization.
      
      ## Email Invitation Process:
      1. Validate organization access (admin permission required)
      2. Generate unique invitation code
      3. Create invitation with specified role and 7-day expiration
      4. Send email to recipient with invitation link
      5. Log invitation creation for audit purposes
      
      ## Features:
      - 7-day expiration (consistent with link invitations)
      - Personalized email with recipient's name (optional)
      - Single-use invitation (maxUses = 1)
      - Beautiful email template with organization branding
      
      ## Security:
      - Only super_admin and client_admin can send invitations
      - client_admin can only send invitations for their own organization
      - Emails are sent via SendGrid
      - All actions logged for audit purposes
      
      ## Use Cases:
      - Individual user onboarding with personal touch
      - Formal business invitations
      - Compliance-required email trail
      - Known email addresses
    `
  })
  @ApiBody({
    type: () => import('./dto/create-org-email-invitation.dto').then(m => m.CreateOrgEmailInvitationDto),
    description: 'Organization email invitation details',
    examples: {
      'employee-invitation': {
        summary: 'Employee email invitation',
        description: 'Send a personalized invitation to a new employee',
        value: {
          organizationId: '123e4567-e89b-12d3-a456-426614174000',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          roleType: 'client_employee'
        }
      },
      'hr-admin-invitation': {
        summary: 'HR admin invitation',
        description: 'Send invitation to an HR administrator',
        value: {
          organizationId: '123e4567-e89b-12d3-a456-426614174000',
          email: 'hr.manager@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          roleType: 'client_hr'
        }
      },
      'candidate-invitation': {
        summary: 'Candidate invitation without name',
        description: 'Send invitation to a candidate without providing their name',
        value: {
          organizationId: '123e4567-e89b-12d3-a456-426614174000',
          email: 'candidate@example.com',
          roleType: 'candidate'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Email invitation sent successfully',
    type: InvitationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid organization, role, or email',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions for this organization',
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too Many Requests - Rate limit exceeded',
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error',
  })
  async sendOrgEmailInvitation(
    @Body() emailDto: any,
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<InvitationResponseDto> {
    const baseUrl = process.env.FRONTEND_URL 
      || (process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
          : `${req.protocol}://${req.get('host')}`);
    
    return this.invitationsService.sendOrgEmailInvitation(
      emailDto.organizationId,
      emailDto.email,
      emailDto.roleType,
      emailDto.firstName,
      emailDto.lastName,
      user,
      baseUrl,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Post()
  @UseGuards(CurrentUserGuard, RolesGuard)
  @Roles('super_admin', 'client_admin')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
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
    @CurrentUser() user: User,
    @Headers('idempotency-key') idempotencyKey: string,
    @Request() req: any,
  ): Promise<InvitationResponseDto> {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.invitationsService.create(
      createInvitationDto,
      user,
      baseUrl,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Get('internal')
  @UseGuards(CurrentUserGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @ApiOperation({ 
    summary: 'Get all internal user invitations',
    description: `
      Retrieve a list of internal user invitations (invitations without an organization).
      
      ## Access Control:
      - Only super_admin can view internal invitations
      - Returns only invitations for internal team members
      
      ## Security:
      - Filters to only invitations without organizationId
      - Super admin access required
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of internal invitations retrieved successfully',
    type: [InternalInvitationResponseDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Only super_admin can view internal invitations',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error',
    type: ErrorResponseDto
  })
  async findInternal(
    @Request() req: any,
  ): Promise<InternalInvitationResponseDto[]> {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.invitationsService.findInternal(baseUrl);
  }

  @Get()
  @UseGuards(CurrentUserGuard, RolesGuard)
  @Roles('super_admin', 'client_admin', 'client_hr')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @ApiOperation({ 
    summary: 'Get all invitations',
    description: `
      Retrieve a list of all invitations in the system.
      
      ## Access Control:
      - super_admin and internal_* roles can view all invitations
      - client_* roles only see invitations for organizations they belong to
      - Returns invitations created by all users (within scope)
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
  async findAll(
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<InvitationResponseDto[]> {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.invitationsService.findAll(user, undefined, baseUrl);
  }

  @Get(':id')
  @UseGuards(CurrentUserGuard, RolesGuard)
  @Roles('super_admin', 'client_admin', 'client_hr')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @ApiOperation({ 
    summary: 'Get invitation by ID',
    description: `
      Retrieve a specific invitation by its unique identifier.
      
      ## Access Control:
      - super_admin and internal_* roles can view all invitations
      - client_* roles can only view invitations for their organizations
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
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<InvitationResponseDto> {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.invitationsService.findOne(id, baseUrl);
  }

  @Delete(':id')
  @UseGuards(CurrentUserGuard, RolesGuard)
  @Roles('super_admin', 'client_admin')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Cancel an invitation',
    description: `
      Cancel a pending invitation.
      
      ## Access Control:
      - super_admin and internal_* roles can cancel any invitation
      - client_admin can only cancel invitations for their organizations
      
      ## Business Rules:
      - Only pending invitations can be cancelled
      - Cancelled invitations cannot be reactivated
      - All cancellations are logged for audit purposes
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the invitation to cancel',
    type: 'string',
    example: 'inv_1234567890abcdef',
    required: true
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Invitation cancelled successfully',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Can only cancel pending invitations',
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
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Request() req: any,
  ): Promise<void> {
    return this.invitationsService.cancel(
      id,
      user,
      req.ip,
      req.get('user-agent'),
    );
  }

  // TODO: PHASE 3 - Implement resend and remove endpoints for organization-based invitations
  // These methods have been removed from the controller as they reference non-existent service methods
  // The new InvitationsService (for multitenancy) doesn't have resend/remove yet
  // They will be reimplemented in Phase 3 with the new organization-based invitation system
  
  // Note: Legacy invitation system (email-based) doesn't use these endpoints
  // Legacy system works through AuthService.acceptInvitation() which remains fully functional
}