import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SupabaseAuthService } from '../services/supabase-auth.service';
import { ExchangeTokenDto } from '../dto/exchange-token.dto';
import { LinkAccountDto } from '../dto/link-account.dto';

@ApiTags('Authentication - Supabase')
@Controller('v1/auth/supabase')
export class SupabaseAuthController {
  constructor(private readonly supabaseAuthService: SupabaseAuthService) {}

  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per 60 seconds
  @ApiOperation({
    summary: 'Exchange Supabase token for Portal JWT (SSO)',
    description:
      'Exchanges a Supabase access token for Portal access/refresh tokens. ' +
      'This is the main SSO endpoint used by all apps after Supabase authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token exchange successful',
    schema: {
      example: {
        accessToken: 'eyJhbGc...',
        refreshToken: 'eyJhbGc...',
        expiresIn: 900,
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid Supabase token or email not verified',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async exchangeToken(@Body() dto: ExchangeTokenDto) {
    return this.supabaseAuthService.exchangeToken(
      dto.supabaseAccessToken,
      dto.clientId,
      dto.clientSecret,
    );
  }

  @Post('link')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Link existing Portal account to Supabase account',
    description:
      'Links an existing Portal account (authenticated with email/password) ' +
      'to a Supabase account for future SSO access.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account linked successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid Portal or Supabase token',
  })
  @ApiResponse({
    status: 404,
    description: 'Portal user not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Email mismatch or account already linked',
  })
  async linkAccount(@Request() req, @Body() dto: LinkAccountDto) {
    return this.supabaseAuthService.linkAccount(
      req.user.id,
      dto.supabaseAccessToken,
    );
  }
}
