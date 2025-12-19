import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import { ServiceTokenGuard, RequiredScopes, ServiceRequest } from '../common/guards/service-token.guard';
import { ErrorResponseDto, AuthErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('invitations-s2s')
@Controller('v1/s2s/invitations')
@UseGuards(ServiceTokenGuard)
@ApiBearerAuth()
export class InvitationsS2SController {
  constructor(private readonly invitationsService: InvitationsService) {}

  private getBaseUrl(req: any): string {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (process.env.BASE_URL) {
      return process.env.BASE_URL;
    } else if (process.env.FRONTEND_URL) {
      return process.env.FRONTEND_URL;
    } else if (isProduction && process.env.REPLIT_DOMAINS) {
      const primaryDomain = process.env.REPLIT_DOMAINS.split(',')[0].trim();
      return `https://${primaryDomain}`;
    } else if (process.env.REPLIT_DEV_DOMAIN) {
      return `https://${process.env.REPLIT_DEV_DOMAIN}`;
    } else {
      return `${req.protocol}://${req.get('host')}`;
    }
  }

  @Get()
  @RequiredScopes('read:invitations')
  @ApiOperation({ 
    summary: 'Get all invitations (S2S)',
    description: `
      Retrieve a list of all invitations with optional filtering.
      
      ## Authorization:
      - Requires S2S token with 'read:invitations' scope
      
      ## Query Parameters:
      - organizationId: Filter by organization
      - status: Filter by status (pending/accepted/expired/revoked)
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Invitations retrieved successfully',
    type: [InvitationResponseDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing S2S token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient scopes',
    type: AuthErrorResponseDto
  })
  @ApiQuery({ name: 'organizationId', required: false, type: String, description: 'Filter by organization ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'accepted', 'expired', 'revoked'], description: 'Filter by status' })
  async findAll(
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: string,
  ): Promise<InvitationResponseDto[]> {
    return this.invitationsService.findAllS2S(organizationId, status);
  }

  @Get(':id')
  @RequiredScopes('read:invitations')
  @ApiOperation({ 
    summary: 'Get invitation by ID (S2S)',
    description: `
      Retrieve detailed information about a specific invitation.
      
      ## Authorization:
      - Requires S2S token with 'read:invitations' scope
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Invitation retrieved successfully',
    type: InvitationResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing S2S token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient scopes',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Invitation not found',
    type: ErrorResponseDto
  })
  async findOne(@Param('id') id: string): Promise<InvitationResponseDto> {
    return this.invitationsService.findOneS2S(id);
  }

  @Post()
  @RequiredScopes('write:invitations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create invitation (S2S)',
    description: `
      Create a new organization invitation.
      
      ## Authorization:
      - Requires S2S token with 'write:invitations' scope
    `
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Invitation created successfully',
    type: InvitationResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing S2S token',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient scopes',
    type: AuthErrorResponseDto
  })
  async create(
    @Body() createInvitationDto: CreateInvitationDto,
    @Request() req: ServiceRequest,
  ): Promise<InvitationResponseDto> {
    const baseUrl = this.getBaseUrl(req);
    return this.invitationsService.createS2S(createInvitationDto, baseUrl, req.serviceClient);
  }
}
