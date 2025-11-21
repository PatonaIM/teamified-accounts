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
import { StatutoryComponentService } from '../services/statutory-component.service';
import {
  CreateStatutoryComponentDto,
  UpdateStatutoryComponentDto,
  StatutoryComponentResponseDto,
  StatutoryComponentListResponseDto,
} from '../dto/statutory-component.dto';

@ApiTags('Payroll - Statutory Components')
@Controller('v1/payroll/configuration/countries/:countryId/statutory-components')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StatutoryComponentController {
  constructor(private readonly statutoryComponentService: StatutoryComponentService) {}

  @Post()
  @Roles('admin', 'hr')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new statutory component for a country' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiResponse({
    status: 201,
    description: 'Statutory component created successfully',
    type: StatutoryComponentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or hr role required' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  async create(
    @Param('countryId') countryId: string,
    @Body() createDto: CreateStatutoryComponentDto,
  ): Promise<StatutoryComponentResponseDto> {
    createDto.countryId = countryId;
    return this.statutoryComponentService.create(createDto);
  }

  @Get()
  @Roles('admin', 'hr', 'eor')
  @ApiOperation({ summary: 'Get all statutory components for a country' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'componentType', required: false, description: 'Filter by component type' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiResponse({
    status: 200,
    description: 'Statutory components retrieved successfully',
    type: StatutoryComponentListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Param('countryId') countryId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('componentType') componentType?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<StatutoryComponentListResponseDto> {
    return this.statutoryComponentService.findByCountry(
      countryId,
      page,
      limit,
      componentType,
      isActive,
    );
  }

  @Get('by-type/:componentType')
  @Roles('admin', 'hr', 'eor')
  @ApiOperation({ summary: 'Get statutory components by type for a country' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiParam({ name: 'componentType', description: 'Component type' })
  @ApiResponse({
    status: 200,
    description: 'Statutory components retrieved successfully',
    type: [StatutoryComponentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByType(
    @Param('countryId') countryId: string,
    @Param('componentType') componentType: string,
  ): Promise<StatutoryComponentResponseDto[]> {
    return this.statutoryComponentService.findByType(countryId, componentType);
  }

  @Get('active-by-date')
  @Roles('admin', 'hr', 'eor')
  @ApiOperation({ summary: 'Get active statutory components for a country on a specific date' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiQuery({ name: 'date', required: true, description: 'Date to check (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiResponse({
    status: 200,
    description: 'Active statutory components retrieved successfully',
    type: [StatutoryComponentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findActiveByDate(
    @Param('countryId') countryId: string,
    @Query('date') date: string,
  ): Promise<StatutoryComponentResponseDto[]> {
    const targetDate = new Date(date);
    return this.statutoryComponentService.findActiveByDate(countryId, targetDate);
  }

  @Get(':id')
  @Roles('admin', 'hr', 'eor')
  @ApiOperation({ summary: 'Get a statutory component by ID' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiParam({ name: 'id', description: 'Statutory component ID' })
  @ApiResponse({
    status: 200,
    description: 'Statutory component retrieved successfully',
    type: StatutoryComponentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Statutory component not found' })
  async findOne(
    @Param('countryId') countryId: string,
    @Param('id') id: string,
  ): Promise<StatutoryComponentResponseDto> {
    return this.statutoryComponentService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'hr')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update a statutory component' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiParam({ name: 'id', description: 'Statutory component ID' })
  @ApiResponse({
    status: 200,
    description: 'Statutory component updated successfully',
    type: StatutoryComponentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or hr role required' })
  @ApiResponse({ status: 404, description: 'Statutory component not found' })
  async update(
    @Param('countryId') countryId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateStatutoryComponentDto,
  ): Promise<StatutoryComponentResponseDto> {
    return this.statutoryComponentService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a statutory component' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiParam({ name: 'id', description: 'Statutory component ID' })
  @ApiResponse({ status: 200, description: 'Statutory component deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'Statutory component not found' })
  @ApiResponse({ status: 400, description: 'Bad request - cannot delete mandatory component' })
  async remove(
    @Param('countryId') countryId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.statutoryComponentService.remove(id);
    return { message: 'Statutory component deleted successfully' };
  }
}
