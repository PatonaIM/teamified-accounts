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
import { CurrencyService } from '../services/currency.service';
import {
  CreateCurrencyDto,
  UpdateCurrencyDto,
  CurrencyResponseDto,
  CurrencyConversionDto,
  CurrencyConversionResponseDto,
} from '../dto/currency.dto';

@ApiTags('Payroll - Currencies')
@Controller('v1/payroll/configuration/currencies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new currency' })
  @ApiResponse({
    status: 201,
    description: 'Currency created successfully',
    type: CurrencyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async create(@Body() createCurrencyDto: CreateCurrencyDto): Promise<CurrencyResponseDto> {
    return await this.currencyService.create(createCurrencyDto);
  }

  @Get()
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get all currencies' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive currencies',
  })
  @ApiResponse({
    status: 200,
    description: 'Currencies retrieved successfully',
    type: [CurrencyResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<CurrencyResponseDto[]> {
    return await this.currencyService.findAll(includeInactive === true);
  }

  @Get(':currency')
  @Roles('admin', 'hr', 'account_manager')
  @ApiOperation({ summary: 'Get currency by code or ID' })
  @ApiParam({ name: 'currency', description: 'Currency code (INR, PHP, AUD) or UUID' })
  @ApiResponse({
    status: 200,
    description: 'Currency retrieved successfully',
    type: CurrencyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('currency') currency: string): Promise<CurrencyResponseDto> {
    // Check if it's a UUID or currency code
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      currency,
    );

    if (isUUID) {
      return await this.currencyService.findOne(currency);
    } else {
      return await this.currencyService.findByCode(currency.toUpperCase());
    }
  }

  @Put(':currency')
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update currency' })
  @ApiParam({ name: 'currency', description: 'Currency code (INR, PHP, AUD) or UUID' })
  @ApiResponse({
    status: 200,
    description: 'Currency updated successfully',
    type: CurrencyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async update(
    @Param('currency') currency: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ): Promise<CurrencyResponseDto> {
    // Check if it's a UUID or currency code
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      currency,
    );

    let currencyId: string;
    if (isUUID) {
      currencyId = currency;
    } else {
      const currencyEntity = await this.currencyService.findByCode(currency.toUpperCase());
      currencyId = currencyEntity.id;
    }

    return await this.currencyService.update(currencyId, updateCurrencyDto);
  }

  @Delete(':currency')
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate currency (soft delete)' })
  @ApiParam({ name: 'currency', description: 'Currency code (INR, PHP, AUD) or UUID' })
  @ApiResponse({ status: 200, description: 'Currency deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async remove(@Param('currency') currency: string): Promise<void> {
    // Check if it's a UUID or currency code
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      currency,
    );

    let currencyId: string;
    if (isUUID) {
      currencyId = currency;
    } else {
      const currencyEntity = await this.currencyService.findByCode(currency.toUpperCase());
      currencyId = currencyEntity.id;
    }

    await this.currencyService.remove(currencyId);
  }

  @Post('convert')
  @Roles('admin', 'hr', 'account_manager')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Convert currency amount' })
  @ApiResponse({
    status: 200,
    description: 'Currency converted successfully',
    type: CurrencyConversionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Currency or exchange rate not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async convertCurrency(
    @Body() conversionDto: CurrencyConversionDto,
  ): Promise<CurrencyConversionResponseDto> {
    const result = await this.currencyService.convertCurrency(
      conversionDto.fromCurrency,
      conversionDto.toCurrency,
      conversionDto.amount,
    );

    return {
      fromCurrency: conversionDto.fromCurrency,
      toCurrency: conversionDto.toCurrency,
      amount: conversionDto.amount,
      convertedAmount: result.convertedAmount,
      rate: result.rate,
      effectiveDate: result.effectiveDate,
    };
  }
}

