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
import { PayrollPeriodService } from '../services/payroll-period.service';
import { PayrollPeriodStatus } from '../entities/payroll-period.entity';
import {
  CreatePayrollPeriodDto,
  UpdatePayrollPeriodDto,
  PayrollPeriodResponseDto,
} from '../dto/payroll-period.dto';

@ApiTags('Payroll - Periods')
@Controller('v1/payroll/configuration/countries/:country/periods')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PayrollPeriodController {
  constructor(private readonly payrollPeriodService: PayrollPeriodService) {}

  @Post()
  @Roles('admin', 'hr')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new payroll period for a country' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiResponse({
    status: 201,
    description: 'Payroll period created successfully',
    type: PayrollPeriodResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or hr role required' })
  async create(
    @Param('country') country: string,
    @Body() createPayrollPeriodDto: CreatePayrollPeriodDto,
  ): Promise<PayrollPeriodResponseDto> {
    // The country parameter is used for URL structure consistency
    // The actual countryId comes from the DTO
    return await this.payrollPeriodService.create(createPayrollPeriodDto);
  }

  @Get()
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get all payroll periods for a country' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PayrollPeriodStatus,
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Payroll periods retrieved successfully',
    type: [PayrollPeriodResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByCountry(
    @Param('country') countryId: string,
    @Query('status') status?: PayrollPeriodStatus,
  ): Promise<PayrollPeriodResponseDto[]> {
    return await this.payrollPeriodService.findByCountry(countryId, status);
  }

  @Get('current')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get current payroll period for a country' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiResponse({
    status: 200,
    description: 'Current payroll period retrieved successfully',
    type: PayrollPeriodResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No current payroll period found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findCurrentByCountry(@Param('country') countryId: string): Promise<PayrollPeriodResponseDto | null> {
    return await this.payrollPeriodService.findCurrentByCountry(countryId);
  }

  @Get(':id')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get payroll period by ID' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiParam({ name: 'id', description: 'Payroll period UUID' })
  @ApiResponse({
    status: 200,
    description: 'Payroll period retrieved successfully',
    type: PayrollPeriodResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payroll period not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<PayrollPeriodResponseDto> {
    return await this.payrollPeriodService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'hr')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update payroll period' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiParam({ name: 'id', description: 'Payroll period UUID' })
  @ApiResponse({
    status: 200,
    description: 'Payroll period updated successfully',
    type: PayrollPeriodResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or period is closed' })
  @ApiResponse({ status: 404, description: 'Payroll period not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or hr role required' })
  async update(
    @Param('id') id: string,
    @Body() updatePayrollPeriodDto: UpdatePayrollPeriodDto,
  ): Promise<PayrollPeriodResponseDto> {
    return await this.payrollPeriodService.update(id, updatePayrollPeriodDto);
  }

  @Post(':id/close')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Close payroll period' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiParam({ name: 'id', description: 'Payroll period UUID' })
  @ApiResponse({
    status: 200,
    description: 'Payroll period closed successfully',
    type: PayrollPeriodResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - period not completed' })
  @ApiResponse({ status: 404, description: 'Payroll period not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or hr role required' })
  async close(@Param('id') id: string): Promise<PayrollPeriodResponseDto> {
    return await this.payrollPeriodService.close(id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete payroll period (only draft periods)' })
  @ApiParam({ name: 'country', description: 'Country code (IN, PH, AU) or UUID' })
  @ApiParam({ name: 'id', description: 'Payroll period UUID' })
  @ApiResponse({ status: 200, description: 'Payroll period deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - only draft periods can be deleted' })
  @ApiResponse({ status: 404, description: 'Payroll period not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.payrollPeriodService.remove(id);
  }
}

