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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ThemesService } from './themes.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@ApiTags('themes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a custom theme' })
  @ApiResponse({ status: 201, description: 'Theme created successfully' })
  create(@Request() req, @Body() createThemeDto: CreateThemeDto) {
    return this.themesService.create(req.user.sub, createThemeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user themes' })
  @ApiResponse({ status: 200, description: 'Returns all themes for the user' })
  findAll(@Request() req) {
    return this.themesService.findAll(req.user.sub);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active theme' })
  @ApiResponse({ status: 200, description: 'Returns the active theme' })
  findActive(@Request() req) {
    return this.themesService.findActive(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get theme by ID' })
  @ApiResponse({ status: 200, description: 'Returns the theme' })
  @ApiResponse({ status: 404, description: 'Theme not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.themesService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update theme' })
  @ApiResponse({ status: 200, description: 'Theme updated successfully' })
  @ApiResponse({ status: 404, description: 'Theme not found' })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateThemeDto: UpdateThemeDto,
  ) {
    return this.themesService.update(id, req.user.sub, updateThemeDto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Set theme as active' })
  @ApiResponse({ status: 200, description: 'Theme activated successfully' })
  @ApiResponse({ status: 404, description: 'Theme not found' })
  setActive(@Param('id') id: string, @Request() req) {
    return this.themesService.setActive(id, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete theme' })
  @ApiResponse({ status: 200, description: 'Theme deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete active theme' })
  @ApiResponse({ status: 404, description: 'Theme not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.themesService.remove(id, req.user.sub);
  }
}
