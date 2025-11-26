import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody,
  ApiSecurity,
  ApiHeader,
  ApiConsumes,
  ApiProduces
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './services/email-verification.service';
import { AcceptInvitationDto, AcceptInvitationResponseDto } from './dto/accept-invitation.dto';
import { 
  LoginDto, 
  LoginResponseDto, 
  RefreshTokenDto, 
  RefreshTokenResponseDto,
  LogoutResponseDto,
  UserProfileDto,
} from './dto/login.dto';
import { 
  VerifyEmailDto, 
  VerifyEmailResponseDto, 
  ProfileCompletionStatusDto 
} from './dto/verify-email.dto';
import { ClientAdminSignupDto, ClientAdminSignupResponseDto } from './dto/client-admin-signup.dto';
import { CandidateSignupDto, CandidateSignupResponseDto } from './dto/candidate-signup.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ErrorResponseDto, ValidationErrorResponseDto, AuthErrorResponseDto, BusinessErrorResponseDto } from '../common/dto/error-response.dto';
import { ApiResponseDto, CreatedResponseDto, UpdatedResponseDto } from '../common/dto/api-response.dto';

@ApiTags('authentication')
@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post('accept-invitation')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept invitation and set up account',
    description: `
      Accept an invitation to join the platform and set up a new user account.
      
      ## Process Flow:
      1. Validate the invitation token
      2. Check if invitation is still valid and not expired
      3. Verify password meets security requirements
      4. Create new user account with provided details
      5. Activate the account and send welcome email
      
      ## Security Considerations:
      - Rate limited to 3 attempts per 5 minutes per IP
      - Password must meet complexity requirements
      - Invitation tokens are single-use and time-limited
      - All attempts are logged for security monitoring
    `,
  })
  @ApiBody({
    type: AcceptInvitationDto,
    description: 'Invitation acceptance details including token and password',
    examples: {
      valid: {
        summary: 'Valid invitation acceptance',
        value: {
          token: 'inv_123e4567-e89b-12d3-a456-426614174000',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted and account activated successfully',
    type: ApiResponseDto<AcceptInvitationResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input or password requirements',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found or expired',
    type: BusinessErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Invitation already accepted or user exists',
    type: BusinessErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Account creation failed',
    type: ErrorResponseDto,
  })
  async acceptInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
    @Request() req: any,
  ): Promise<AcceptInvitationResponseDto> {
    // Use frontend URL for email verification links
    // Priority: FRONTEND_URL (custom/production) > REPLIT_DEV_DOMAIN (Replit) > request host (fallback)
    const baseUrl = process.env.FRONTEND_URL 
      || (process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
          : `${req.protocol}://${req.get('host')}`);
    return this.authService.acceptInvitation(
      acceptInvitationDto,
      baseUrl,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Post('verify-email')
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 attempts per hour
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email address with token',
    description: `
      Verify a user's email address using a verification token sent to their email.
      
      ## Process Flow:
      1. Validate the verification token format
      2. Check if token is valid and not expired
      3. Verify the token belongs to the requesting user
      4. Mark email as verified in the database
      5. Update user status and send confirmation
      
      ## Security Considerations:
      - Rate limited to 10 attempts per hour per IP
      - Tokens are single-use and time-limited (24 hours)
      - All verification attempts are logged
      - Tokens are invalidated after successful verification
    `,
  })
  @ApiBody({
    type: VerifyEmailDto,
    description: 'Email verification token',
    examples: {
      valid: {
        summary: 'Valid verification token',
        value: {
          token: 'verify_123e4567-e89b-12d3-a456-426614174000'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: ApiResponseDto<VerifyEmailResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or expired token',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or token invalid',
    type: BusinessErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already verified',
    type: BusinessErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Verification failed',
    type: ErrorResponseDto,
  })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Request() req: any,
  ): Promise<VerifyEmailResponseDto> {
    return this.emailVerificationService.verifyEmail(
      verifyEmailDto.token,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Post('check-email')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate email for login',
    description: `
      Validate if an email exists for the two-step login flow.
      This endpoint uses security measures to prevent email enumeration attacks.
      
      ## Security Features:
      - Rate limited to 5 attempts per minute
      - Random timing jitter to prevent timing attacks
      - Audit logging of validation attempts
      - Returns success for both existing and non-existing emails
    `,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@teamified.com'
        }
      },
      required: ['email']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Email validation completed',
    schema: {
      type: 'object',
      properties: {
        valid: {
          type: 'boolean',
          description: 'True if email exists and is active'
        },
        message: {
          type: 'string',
          description: 'User-friendly message'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid email format',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto,
  })
  async checkEmail(
    @Body() body: { email: string },
    @Request() req: any,
  ): Promise<{ valid: boolean; message?: string }> {
    return this.authService.validateEmailForLogin(body.email, req.ip);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email and password',
    description: `
      Authenticate a user with their email and password credentials.
      
      ## Authentication Flow:
      1. Validate email format and password presence
      2. Verify user exists and is active
      3. Check password against stored hash
      4. Generate JWT access and refresh tokens
      5. Create session record for token management
      6. Log successful authentication
      
      ## Security Features:
      - Rate limited to 5 attempts per minute per IP
      - Password verification using Argon2 hashing
      - JWT tokens with configurable expiration
      - Session management with device tracking
      - Failed login attempt logging and monitoring
      - Account lockout after multiple failed attempts
      
      ## Token Information:
      - Access Token: Short-lived (15 minutes) for API access
      - Refresh Token: Long-lived (7 days) for token renewal
      - Both tokens include user ID, roles, and permissions
    `,
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
    examples: {
      valid: {
        summary: 'Valid login credentials',
        value: {
          email: 'user@teamified.com',
          password: 'SecurePass123!'
        }
      },
      invalid: {
        summary: 'Invalid credentials example',
        value: {
          email: 'user@teamified.com',
          password: 'wrongpassword'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: ApiResponseDto<LoginResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input format',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid email or password',
    type: AuthErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Account locked or disabled',
    type: AuthErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Authentication failed',
    type: ErrorResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: any,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<LoginResponseDto> {
    const loginResponse = await this.authService.login(
      loginDto,
      req.ip,
      req.get('user-agent'),
    );
    
    // Set httpOnly cookie for SSO authorization redirects (browser navigation to /authorize)
    // API calls use Bearer tokens in Authorization header
    res.cookie('access_token', loginResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes (matches JWT expiry)
    });
    
    return loginResponse;
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: `
      Refresh an expired access token using a valid refresh token.
      
      ## Token Refresh Flow:
      1. Validate refresh token format and signature
      2. Check if refresh token is valid and not expired
      3. Verify token family and session integrity
      4. Generate new access token with updated claims
      5. Optionally rotate refresh token for security
      6. Update session with new token information
      
      ## Security Features:
      - Rate limited to 10 attempts per minute per IP
      - Refresh tokens are single-use (rotation enabled)
      - Token family validation prevents token reuse
      - Session tracking and device validation
      - Automatic token invalidation on suspicious activity
      
      ## Token Rotation:
      - New access token with 15-minute expiration
      - New refresh token with 7-day expiration
      - Old refresh token is invalidated immediately
      - Token family is maintained for security tracking
    `,
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token for generating new access token',
    examples: {
      valid: {
        summary: 'Valid refresh token',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: ApiResponseDto<RefreshTokenResponseDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired refresh token',
    type: AuthErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Token family compromised or account locked',
    type: AuthErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Token refresh failed',
    type: ErrorResponseDto,
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Request() req: any,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<RefreshTokenResponseDto> {
    const refreshResponse = await this.authService.refresh(
      refreshTokenDto.refreshToken,
      req.ip,
      req.get('user-agent'),
    );
    
    // Update httpOnly cookie with new access token
    res.cookie('access_token', refreshResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    
    return refreshResponse;
  }

  @Post('logout')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout and revoke refresh token',
    description: `
      Logout a user and revoke their refresh token to invalidate the session.
      
      ## Logout Process:
      1. Validate the refresh token format
      2. Find and invalidate the associated session
      3. Revoke the refresh token (add to blacklist)
      4. Clear any cached user data
      5. Log the logout event for audit purposes
      
      ## Security Features:
      - Rate limited to 10 attempts per minute per IP
      - Immediate token invalidation
      - Session cleanup and data purging
      - Audit logging for security monitoring
      - Graceful handling of invalid tokens
      
      ## Token Invalidation:
      - Refresh token is immediately revoked
      - Access token remains valid until expiration
      - All tokens in the same family are invalidated
      - User must re-authenticate for new tokens
    `,
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token to revoke during logout',
    examples: {
      valid: {
        summary: 'Valid refresh token for logout',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: ApiResponseDto<LogoutResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid token format',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired refresh token',
    type: AuthErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Logout failed',
    type: ErrorResponseDto,
  })
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Request() req: any,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<LogoutResponseDto> {
    const logoutResponse = await this.authService.logout(
      refreshTokenDto.refreshToken,
      req.ip,
      req.get('user-agent'),
    );
    
    // Clear the httpOnly cookie on logout
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return logoutResponse;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user profile',
    description: `
      Retrieve the current authenticated user's profile information.
      
      ## Profile Information:
      - Basic user details (name, email, phone)
      - Account status and verification status
      - User roles and permissions
      - Profile completion status
      - Account creation and last login timestamps
      
      ## Security:
      - Requires valid JWT access token
      - Returns only user's own profile data
      - Sensitive information is filtered out
      - All access is logged for audit purposes
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: ApiResponseDto<UserProfileDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: AuthErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: BusinessErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Profile retrieval failed',
    type: ErrorResponseDto,
  })
  async getProfile(@Request() req: any): Promise<UserProfileDto> {
    return this.authService.getProfile(req.user.sub);
  }

  @Get('me/completion-status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get profile completion status',
    description: `
      Retrieve the current user's profile completion status and missing required fields.
      
      ## Completion Status:
      - Overall completion percentage
      - List of missing required fields
      - Field-specific completion status
      - Next steps for completion
      
      ## Use Cases:
      - Onboarding progress tracking
      - Profile completion reminders
      - Required field validation
      - User experience optimization
      
      ## Response Format:
      - Completion percentage (0-100)
      - Missing fields by category
      - Priority levels for completion
      - User-friendly guidance
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Completion status retrieved successfully',
    type: ApiResponseDto<ProfileCompletionStatusDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: AuthErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Status retrieval failed',
    type: ErrorResponseDto,
  })
  async getCompletionStatus(@Request() req: any): Promise<ProfileCompletionStatusDto> {
    return this.emailVerificationService.getProfileCompletionStatus(req.user.sub);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user profile data',
    description: `
      Retrieve the current user's detailed profile data stored in the JSONB field.
      
      ## Profile Data Structure:
      - Personal information (address, emergency contacts)
      - Professional details (skills, experience)
      - EOR-specific data (employment records, documents)
      - Custom fields and preferences
      - Metadata and timestamps
      
      ## Data Privacy:
      - Only returns user's own profile data
      - Sensitive fields may be filtered based on permissions
      - All access is logged for audit purposes
      - Data is returned in structured JSON format
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Profile data retrieved successfully',
    type: ApiResponseDto<{ profileData: any }>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: AuthErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
    type: BusinessErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Profile data retrieval failed',
    type: ErrorResponseDto,
  })
  async getProfileData(@Request() req: any): Promise<{ profileData: any }> {
    return this.authService.getProfileData(req.user.sub);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: `
      Request a password reset email for your account.
      
      ## Process Flow:
      1. User submits their email address
      2. System validates the email format
      3. If account exists, a password reset link is sent via email
      4. Reset link expires after 1 hour
      
      ## Security Features:
      - Rate limited to 5 attempts per 5 minutes
      - Returns same message whether email exists or not (prevents user enumeration)
      - Reset tokens are single-use and time-limited
      - All requests are logged for security monitoring
    `,
  })
  @ApiBody({
    type: () => require('./dto/forgot-password.dto').ForgotPasswordDto,
    description: 'Email address for password reset',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if account exists)',
    type: () => require('./dto/forgot-password.dto').ForgotPasswordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid email format',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto,
  })
  async forgotPassword(
    @Body() forgotPasswordDto: { email: string },
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(
      forgotPasswordDto.email,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Post('admin/send-password-reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'internal_hr', 'internal_account_manager')
  @Throttle({ default: { limit: 10, ttl: 300000 } })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: Send password reset email on behalf of a user',
    description: `
      Admin endpoint to send a password reset email on behalf of a user.
      This endpoint requires authentication and logs which admin initiated the reset.
      Only super admins and internal users can access this endpoint.
      
      ## Process Flow:
      1. Admin provides user ID
      2. System validates admin permissions
      3. Password reset email is sent to the user
      4. Action is logged with admin as the actor
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async adminSendPasswordReset(
    @Body() body: { userId: string },
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.adminSendPasswordReset(
      body.userId,
      req.user.id,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Post('admin/set-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'internal_hr', 'internal_account_manager')
  @Throttle({ default: { limit: 10, ttl: 300000 } })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: Set password directly for a user',
    description: `
      Admin endpoint to directly set a user's password without requiring a reset token.
      This endpoint requires authentication and logs which admin initiated the password change.
      Only super admins and internal users can access this endpoint.
      
      ## Process Flow:
      1. Admin provides user ID and new password
      2. System validates admin permissions
      3. Password is validated against security policy
      4. Password is updated and all user sessions are invalidated
      5. Action is logged with admin as the actor
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Password set successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Password does not meet requirements',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async adminSetPassword(
    @Body() body: { userId: string; password: string },
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.adminSetPassword(
      body.userId,
      body.password,
      req.user.id,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with token',
    description: `
      Reset your password using the token received via email.
      
      ## Process Flow:
      1. User clicks reset link from email (contains token)
      2. User enters new password and confirms it
      3. System validates token and password requirements
      4. Password is updated and all sessions are invalidated
      5. User must log in again with new password
      
      ## Security Features:
      - Rate limited to 5 attempts per 5 minutes
      - Token expires after 1 hour
      - Password must meet security requirements
      - All existing sessions are invalidated after reset
      - All attempts are logged for security monitoring
    `,
  })
  @ApiBody({
    type: () => require('./dto/reset-password.dto').ResetPasswordDto,
    description: 'Password reset details including token and new password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: () => require('./dto/reset-password.dto').ResetPasswordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid token or password requirements not met',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto,
  })
  async resetPassword(
    @Body() resetPasswordDto: { token: string; password: string; confirmPassword: string },
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
      resetPasswordDto.confirmPassword,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Get('debug/token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Debug JWT token payload',
    description: 'Returns the decoded JWT token payload for debugging purposes. Shows what roles and data are included in your current token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token payload decoded successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async debugToken(@Request() req: any): Promise<any> {
    return {
      message: 'Current JWT token payload',
      payload: req.user,
      note: 'If roles are missing or incorrect, log out and log in again to get a fresh token with updated roles'
    };
  }

  @Post('signup/client-admin')
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Client Admin Signup - Create account and organization',
    description: `
      Create a new client admin account with an organization. This is the self-service
      signup flow for business owners and HR managers who want to create their own workspace.
      
      ## Process Flow:
      1. Validate user doesn't already exist
      2. Create user account with client_admin role
      3. Create organization with auto-generated slug
      4. Add user as organization member
      5. Generate authentication tokens
      6. Send welcome email
      
      ## What Gets Created:
      - User account with client_admin role (organization-scoped)
      - Organization with free tier subscription
      - Organization membership record
      - JWT access and refresh tokens
      
      ## Security Features:
      - Rate limited to 3 signups per 5 minutes per IP
      - Password must meet security requirements
      - Unique slug auto-generated from company name
      - All actions logged for audit
    `,
  })
  @ApiBody({
    type: () => require('./dto/client-admin-signup.dto').ClientAdminSignupDto,
    description: 'Client admin signup details',
  })
  @ApiResponse({
    status: 201,
    description: 'Account and organization created successfully',
    type: () => require('./dto/client-admin-signup.dto').ClientAdminSignupResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input or password requirements not met',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User with this email already exists',
    type: BusinessErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto,
  })
  async clientAdminSignup(
    @Body() signupDto: ClientAdminSignupDto,
    @Request() req: any,
  ): Promise<ClientAdminSignupResponseDto> {
    return this.authService.clientAdminSignup(
      signupDto,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Post('signup/candidate')
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Candidate Signup - Quick account creation for job applicants',
    description: `
      Create a new candidate account for job applicants. This is a streamlined
      signup flow designed to be completed in under 30 seconds.
      
      ## Process Flow:
      1. Validate user doesn't already exist
      2. Create user account with candidate role (global scope)
      3. Generate authentication tokens
      4. Send welcome email
      
      ## What Gets Created:
      - User account with candidate role
      - JWT access and refresh tokens
      - No organization membership (candidates are not tied to organizations)
      
      ## Security Features:
      - Rate limited to 5 signups per 5 minutes per IP
      - Password must meet security requirements
      - All actions logged for audit
      
      ## Use Cases:
      - Job seekers applying for positions
      - Candidates accessing the Candidate Portal
      - Users who will later be converted to employees
    `,
  })
  @ApiBody({
    type: () => require('./dto/candidate-signup.dto').CandidateSignupDto,
    description: 'Candidate signup details',
  })
  @ApiResponse({
    status: 201,
    description: 'Candidate account created successfully',
    type: () => require('./dto/candidate-signup.dto').CandidateSignupResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input or password requirements not met',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User with this email already exists',
    type: BusinessErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
    type: ErrorResponseDto,
  })
  async candidateSignup(
    @Body() signupDto: CandidateSignupDto,
    @Request() req: any,
  ): Promise<CandidateSignupResponseDto> {
    return this.authService.candidateSignup(
      signupDto,
      req.ip,
      req.get('user-agent'),
    );
  }
}

