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
import { SalaryComponentService } from '../services/salary-component.service';
import {
  CreateSalaryComponentDto,
  UpdateSalaryComponentDto,
  SalaryComponentResponseDto,
  SalaryComponentListResponseDto,
} from '../dto/salary-component.dto';

@ApiTags('Payroll - Salary Components')
@Controller('v1/payroll/configuration/countries/:countryId/salary-components')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SalaryComponentController {
  constructor(private readonly salaryComponentService: SalaryComponentService) {}

  @Post()
  @Roles('admin', 'hr')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new salary component for a country' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiResponse({
    status: 201,
    description: 'Salary component created successfully',
    type: SalaryComponentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or hr role required' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  async create(
    @Param('countryId') countryId: string,
    @Body() createDto: CreateSalaryComponentDto,
  ): Promise<SalaryComponentResponseDto> {
    createDto.countryId = countryId;
    return this.salaryComponentService.create(createDto);
  }

  @Get()
  @Roles('admin', 'hr', 'eor')
  @ApiOperation({ summary: 'Get all salary components for a country' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'componentType', required: false, description: 'Filter by component type' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiResponse({
    status: 200,
    description: 'Salary components retrieved successfully',
    type: SalaryComponentListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Param('countryId') countryId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('componentType') componentType?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<SalaryComponentListResponseDto> {
    return this.salaryComponentService.findByCountry(
      countryId,
      page,
      limit,
      componentType,
      isActive,
    );
  }

  @Get('by-type/:componentType')
  @Roles('admin', 'hr', 'eor')
  @ApiOperation({ summary: 'Get salary components by type for a country' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiParam({ name: 'componentType', description: 'Component type' })
  @ApiResponse({
    status: 200,
    description: 'Salary components retrieved successfully',
    type: [SalaryComponentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByType(
    @Param('countryId') countryId: string,
    @Param('componentType') componentType: string,
  ): Promise<SalaryComponentResponseDto[]> {
    return this.salaryComponentService.findByType(countryId, componentType);
  }

  @Get(':id')
  @Roles('admin', 'hr', 'eor')
  @ApiOperation({ summary: 'Get a salary component by ID' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiParam({ name: 'id', description: 'Salary component ID' })
  @ApiResponse({
    status: 200,
    description: 'Salary component retrieved successfully',
    type: SalaryComponentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Salary component not found' })
  async findOne(
    @Param('countryId') countryId: string,
    @Param('id') id: string,
  ): Promise<SalaryComponentResponseDto> {
    return this.salaryComponentService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'hr')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update a salary component' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiParam({ name: 'id', description: 'Salary component ID' })
  @ApiResponse({
    status: 200,
    description: 'Salary component updated successfully',
    type: SalaryComponentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or hr role required' })
  @ApiResponse({ status: 404, description: 'Salary component not found' })
  async update(
    @Param('countryId') countryId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateSalaryComponentDto,
  ): Promise<SalaryComponentResponseDto> {
    return this.salaryComponentService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a salary component' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiParam({ name: 'id', description: 'Salary component ID' })
  @ApiResponse({ status: 200, description: 'Salary component deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'Salary component not found' })
  @ApiResponse({ status: 400, description: 'Bad request - cannot delete mandatory component' })
  async remove(
    @Param('countryId') countryId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.salaryComponentService.remove(id);
    return { message: 'Salary component deleted successfully' };
  }
}
