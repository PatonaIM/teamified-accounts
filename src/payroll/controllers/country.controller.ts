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
import { CountryService } from '../services/country.service';
import {
  CreateCountryDto,
  UpdateCountryDto,
  CountryResponseDto,
} from '../dto/country.dto';

@ApiTags('Payroll - Countries')
@Controller('v1/payroll/configuration/countries')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new country' })
  @ApiResponse({
    status: 201,
    description: 'Country created successfully',
    type: CountryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async create(@Body() createCountryDto: CreateCountryDto): Promise<CountryResponseDto> {
    return await this.countryService.create(createCountryDto);
  }

  @Get()
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get all countries' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive countries',
  })
  @ApiResponse({
    status: 200,
    description: 'Countries retrieved successfully',
    type: [CountryResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<CountryResponseDto[]> {
    return await this.countryService.findAll(includeInactive === true);
  }

  @Get(':country')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get country by code or ID' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiResponse({
    status: 200,
    description: 'Country retrieved successfully',
    type: CountryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Country not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('country') country: string): Promise<CountryResponseDto> {
    // Check if it's a UUID or country code
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      country,
    );

    if (isUUID) {
      return await this.countryService.findOne(country);
    } else {
      return await this.countryService.findByCode(country.toUpperCase());
    }
  }

  @Put(':country')
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update country' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiResponse({
    status: 200,
    description: 'Country updated successfully',
    type: CountryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async update(
    @Param('country') country: string,
    @Body() updateCountryDto: UpdateCountryDto,
  ): Promise<CountryResponseDto> {
    // Check if it's a UUID or country code
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      country,
    );

    let countryId: string;
    if (isUUID) {
      countryId = country;
    } else {
      const countryEntity = await this.countryService.findByCode(country.toUpperCase());
      countryId = countryEntity.id;
    }

    return await this.countryService.update(countryId, updateCountryDto);
  }

  @Delete(':country')
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate country (soft delete)' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiResponse({ status: 200, description: 'Country deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async remove(@Param('country') country: string): Promise<void> {
    // Check if it's a UUID or country code
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      country,
    );

    let countryId: string;
    if (isUUID) {
      countryId = country;
    } else {
      const countryEntity = await this.countryService.findByCode(country.toUpperCase());
      countryId = countryEntity.id;
    }

    await this.countryService.remove(countryId);
  }
}

