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
import { ExchangeRateService } from '../services/exchange-rate.service';
import {
  CreateExchangeRateDto,
  UpdateExchangeRateDto,
  ExchangeRateResponseDto,
} from '../dto/exchange-rate.dto';

@ApiTags('Payroll - Exchange Rates')
@Controller('v1/payroll/configuration/exchange-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Post()
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new exchange rate' })
  @ApiResponse({
    status: 201,
    description: 'Exchange rate created successfully',
    type: ExchangeRateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async create(@Body() createExchangeRateDto: CreateExchangeRateDto): Promise<ExchangeRateResponseDto> {
    return await this.exchangeRateService.create(createExchangeRateDto);
  }

  @Get('pair/:fromCurrency/:toCurrency')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get all exchange rates for a currency pair' })
  @ApiParam({ name: 'fromCurrency', description: 'From currency UUID' })
  @ApiParam({ name: 'toCurrency', description: 'To currency UUID' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive exchange rates',
  })
  @ApiResponse({
    status: 200,
    description: 'Exchange rates retrieved successfully',
    type: [ExchangeRateResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByCurrencyPair(
    @Param('fromCurrency') fromCurrencyId: string,
    @Param('toCurrency') toCurrencyId: string,
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<ExchangeRateResponseDto[]> {
    return await this.exchangeRateService.findByCurrencyPair(
      fromCurrencyId,
      toCurrencyId,
      includeInactive === true,
    );
  }

  @Get('current/:fromCurrency/:toCurrency')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get current exchange rate for a currency pair' })
  @ApiParam({ name: 'fromCurrency', description: 'From currency UUID' })
  @ApiParam({ name: 'toCurrency', description: 'To currency UUID' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Date for historical rate (ISO format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Current exchange rate retrieved successfully',
    type: ExchangeRateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exchange rate not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findCurrentRate(
    @Param('fromCurrency') fromCurrencyId: string,
    @Param('toCurrency') toCurrencyId: string,
    @Query('date') date?: string,
  ): Promise<ExchangeRateResponseDto> {
    const effectiveDate = date ? new Date(date) : undefined;
    return await this.exchangeRateService.findCurrentRate(fromCurrencyId, toCurrencyId, effectiveDate);
  }

  @Get('currency/:currencyId')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get all exchange rates for a currency' })
  @ApiParam({ name: 'currencyId', description: 'Currency UUID' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rates retrieved successfully',
    type: [ExchangeRateResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByCurrency(@Param('currencyId') currencyId: string): Promise<ExchangeRateResponseDto[]> {
    return await this.exchangeRateService.findByCurrency(currencyId);
  }

  @Get(':id')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get exchange rate by ID' })
  @ApiParam({ name: 'id', description: 'Exchange rate UUID' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rate retrieved successfully',
    type: ExchangeRateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exchange rate not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<ExchangeRateResponseDto> {
    return await this.exchangeRateService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update exchange rate' })
  @ApiParam({ name: 'id', description: 'Exchange rate UUID' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rate updated successfully',
    type: ExchangeRateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Exchange rate not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async update(
    @Param('id') id: string,
    @Body() updateExchangeRateDto: UpdateExchangeRateDto,
  ): Promise<ExchangeRateResponseDto> {
    return await this.exchangeRateService.update(id, updateExchangeRateDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate exchange rate (soft delete)' })
  @ApiParam({ name: 'id', description: 'Exchange rate UUID' })
  @ApiResponse({ status: 200, description: 'Exchange rate deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Exchange rate not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.exchangeRateService.remove(id);
  }
}

