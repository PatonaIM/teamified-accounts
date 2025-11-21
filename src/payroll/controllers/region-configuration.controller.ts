import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RegionConfigurationService } from '../services/region-configuration.service';
import {
  CreateRegionConfigurationDto,
  UpdateRegionConfigurationDto,
  RegionConfigurationResponseDto,
} from '../dto/region-configuration.dto';

@ApiTags('Payroll - Region Configuration')
@Controller('v1/payroll/configuration/countries/:country/configurations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RegionConfigurationController {
  constructor(private readonly regionConfigService: RegionConfigurationService) {}

  @Post()
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new region configuration for a country' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiResponse({
    status: 201,
    description: 'Configuration created successfully',
    type: RegionConfigurationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async create(
    @Param('country') country: string,
    @Body() createConfigDto: CreateRegionConfigurationDto,
  ): Promise<RegionConfigurationResponseDto> {
    // The country parameter is used for URL structure consistency
    // The actual countryId comes from the DTO
    return await this.regionConfigService.create(createConfigDto);
  }

  @Get()
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get all configurations for a country' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive configurations',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurations retrieved successfully',
    type: [RegionConfigurationResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByCountry(
    @Param('country') countryId: string,
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<RegionConfigurationResponseDto[]> {
    return await this.regionConfigService.findByCountry(countryId, includeInactive === true);
  }

  @Get('key/:configKey')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get specific configuration by key' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiParam({ name: 'configKey', description: 'Configuration key' })
  @ApiResponse({
    status: 200,
    description: 'Configuration retrieved successfully',
    type: RegionConfigurationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByKey(
    @Param('country') countryId: string,
    @Param('configKey') configKey: string,
  ): Promise<RegionConfigurationResponseDto> {
    return await this.regionConfigService.findByKey(countryId, configKey);
  }

  @Get(':id')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get configuration by ID' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiParam({ name: 'id', description: 'Configuration UUID' })
  @ApiResponse({
    status: 200,
    description: 'Configuration retrieved successfully',
    type: RegionConfigurationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<RegionConfigurationResponseDto> {
    return await this.regionConfigService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update region configuration' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiParam({ name: 'id', description: 'Configuration UUID' })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
    type: RegionConfigurationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async update(
    @Param('id') id: string,
    @Body() updateConfigDto: UpdateRegionConfigurationDto,
  ): Promise<RegionConfigurationResponseDto> {
    return await this.regionConfigService.update(id, updateConfigDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate configuration (soft delete)' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiParam({ name: 'id', description: 'Configuration UUID' })
  @ApiResponse({ status: 200, description: 'Configuration deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.regionConfigService.remove(id);
  }
}

