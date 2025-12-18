import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OAuthClientsService } from './oauth-clients.service';
import { CreateOAuthClientDto } from './dto/create-oauth-client.dto';
import { UpdateOAuthClientDto } from './dto/update-oauth-client.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('OAuth Clients')
@Controller('v1/oauth-clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OAuthClientsController {
  constructor(private readonly oauthClientsService: OAuthClientsService) {}

  @Post()
  @Roles('admin', 'hr_manager')
  @ApiOperation({
    summary: 'Register a new OAuth client (app)',
    description: 'Only admins can register new apps for SSO',
  })
  @ApiResponse({ status: 201, description: 'Client registered successfully' })
  create(@Body() createDto: CreateOAuthClientDto, @Request() req) {
    return this.oauthClientsService.create(createDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'hr_manager')
  @ApiOperation({
    summary: 'List all registered OAuth clients',
    description: 'Get all registered apps',
  })
  findAll() {
    return this.oauthClientsService.findAll();
  }

  @Get('active')
  @Roles('admin', 'hr_manager')
  @ApiOperation({ summary: 'List active OAuth clients only' })
  findActive() {
    return this.oauthClientsService.findActive();
  }

  @Get(':id')
  @Roles('admin', 'hr_manager')
  @ApiOperation({ summary: 'Get OAuth client details' })
  findOne(@Param('id') id: string) {
    return this.oauthClientsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'hr_manager')
  @ApiOperation({ summary: 'Update OAuth client' })
  update(@Param('id') id: string, @Body() updateDto: UpdateOAuthClientDto, @Req() req: any) {
    console.log('[OAuthClientsController] Raw request body:', JSON.stringify(req.body));
    console.log('[OAuthClientsController] Transformed DTO:', JSON.stringify(updateDto));
    console.log('[OAuthClientsController] redirect_uris type:', typeof updateDto.redirect_uris);
    console.log('[OAuthClientsController] redirect_uris isArray:', Array.isArray(updateDto.redirect_uris));
    if (updateDto.redirect_uris && updateDto.redirect_uris.length > 0) {
      console.log('[OAuthClientsController] First URI:', JSON.stringify(updateDto.redirect_uris[0]));
      console.log('[OAuthClientsController] First URI type:', typeof updateDto.redirect_uris[0]);
    }
    return this.oauthClientsService.update(id, updateDto);
  }

  @Post(':id/regenerate-secret')
  @Roles('admin')
  @ApiOperation({
    summary: 'Regenerate client secret',
    description: 'Only admins can regenerate secrets',
  })
  regenerateSecret(@Param('id') id: string) {
    return this.oauthClientsService.regenerateSecret(id);
  }

  @Post(':id/toggle')
  @Roles('admin')
  @ApiOperation({ summary: 'Activate/deactivate OAuth client' })
  toggleActive(@Param('id') id: string) {
    return this.oauthClientsService.toggleActive(id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({
    summary: 'Delete OAuth client',
    description: 'Permanently removes an OAuth client',
  })
  remove(@Param('id') id: string) {
    return this.oauthClientsService.remove(id);
  }
}
