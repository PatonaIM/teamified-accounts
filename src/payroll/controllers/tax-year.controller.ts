import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TaxYearService } from '../services/tax-year.service';
import { CountryService } from '../services/country.service';
import {
  CreateTaxYearDto,
  UpdateTaxYearDto,
  TaxYearResponseDto,
} from '../dto/tax-year.dto';

@ApiTags('Payroll - Tax Years')
@Controller('v1/payroll/configuration/countries/:country/tax-years')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TaxYearController {
  constructor(
    private readonly taxYearService: TaxYearService,
    private readonly countryService: CountryService,
  ) {}

  /**
   * Helper method to resolve country code to UUID
   */
  private async resolveCountryId(countryCodeOrId: string): Promise<string> {
    // Check if it's already a UUID (contains hyphens)
    if (countryCodeOrId.includes('-')) {
      return countryCodeOrId;
    }
    // It's a country code, look it up
    const country = await this.countryService.findByCode(countryCodeOrId);
    return country.id;
  }

  @Post()
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new tax year for a country' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiResponse({
    status: 201,
    description: 'Tax year created successfully',
    type: TaxYearResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async create(
    @Param('country') country: string,
    @Body() createTaxYearDto: CreateTaxYearDto,
  ): Promise<TaxYearResponseDto> {
    // The country parameter is used for URL structure consistency
    // The actual countryId comes from the DTO
    return await this.taxYearService.create(createTaxYearDto);
  }

  @Get()
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get all tax years for a country' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiResponse({
    status: 200,
    description: 'Tax years retrieved successfully',
    type: [TaxYearResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByCountry(@Param('country') country: string): Promise<TaxYearResponseDto[]> {
    const countryId = await this.resolveCountryId(country);
    return await this.taxYearService.findByCountry(countryId);
  }

  @Get('current')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get current tax year for a country' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiResponse({
    status: 200,
    description: 'Current tax year retrieved successfully',
    type: TaxYearResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No current tax year found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findCurrentByCountry(@Param('country') country: string): Promise<TaxYearResponseDto> {
    const countryId = await this.resolveCountryId(country);
    return await this.taxYearService.findCurrentByCountry(countryId);
  }

  @Get(':id')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get tax year by ID' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiParam({ name: 'id', description: 'Tax year UUID' })
  @ApiResponse({
    status: 200,
    description: 'Tax year retrieved successfully',
    type: TaxYearResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tax year not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<TaxYearResponseDto> {
    return await this.taxYearService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update tax year' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiParam({ name: 'id', description: 'Tax year UUID' })
  @ApiResponse({
    status: 200,
    description: 'Tax year updated successfully',
    type: TaxYearResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Tax year not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async update(
    @Param('id') id: string,
    @Body() updateTaxYearDto: UpdateTaxYearDto,
  ): Promise<TaxYearResponseDto> {
    return await this.taxYearService.update(id, updateTaxYearDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete tax year' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiParam({ name: 'id', description: 'Tax year UUID' })
  @ApiResponse({ status: 200, description: 'Tax year deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tax year not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.taxYearService.remove(id);
  }
}

