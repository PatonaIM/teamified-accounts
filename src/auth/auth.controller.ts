import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
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
    return this.authService.acceptInvitation(
      acceptInvitationDto,
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
  ): Promise<LoginResponseDto> {
    return this.authService.login(
      loginDto,
      req.ip,
      req.get('user-agent'),
    );
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
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refresh(
      refreshTokenDto.refreshToken,
      req.ip,
      req.get('user-agent'),
    );
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
  ): Promise<LogoutResponseDto> {
    return this.authService.logout(
      refreshTokenDto.refreshToken,
      req.ip,
      req.get('user-agent'),
    );
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

  @Get('me/employment')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user employment records',
    description: `
      Retrieve the current user's employment records and work history.
      
      ## Employment Records Information:
      - Current and historical employment positions
      - Client assignments and project details
      - Employment status and dates
      - Role and responsibility information
      - Performance and evaluation data
      
      ## Data Privacy:
      - Only returns user's own employment records
      - Sensitive information may be filtered
      - All access is logged for audit purposes
      - Data is returned in chronological order
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Employment records retrieved successfully',
    type: ApiResponseDto<any[]>,
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
    description: 'Internal Server Error - Employment records retrieval failed',
    type: ErrorResponseDto,
  })
  async getEmploymentRecords(@Request() req: any): Promise<any[]> {
    return this.authService.getEmploymentRecords(req.user.sub);
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
}

