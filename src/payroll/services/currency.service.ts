import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Currency } from '../entities/currency.entity';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { CreateCurrencyDto, UpdateCurrencyDto } from '../dto/currency.dto';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  /**
   * Create a new currency
   */
  async create(createCurrencyDto: CreateCurrencyDto): Promise<Currency> {
    try {
      // Check if currency code already exists
      const existingCurrency = await this.currencyRepository.findOne({
        where: { code: createCurrencyDto.code },
      });

      if (existingCurrency) {
        throw new BadRequestException(
          `Currency with code ${createCurrencyDto.code} already exists`,
        );
      }

      const currency = this.currencyRepository.create(createCurrencyDto);
      const savedCurrency = await this.currencyRepository.save(currency);
      
      this.logger.log(`Currency created: ${savedCurrency.code} - ${savedCurrency.name}`);
      return savedCurrency;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create currency: ${error.message}`);
      throw new InternalServerErrorException('Failed to create currency');
    }
  }

  /**
   * Get all currencies
   */
  async findAll(includeInactive = false): Promise<Currency[]> {
    try {
      const where = includeInactive ? {} : { isActive: true };
      return await this.currencyRepository.find({
        where,
        order: { code: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch currencies: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch currencies');
    }
  }

  /**
   * Get currency by ID
   */
  async findOne(id: string): Promise<Currency> {
    try {
      const currency = await this.currencyRepository.findOne({
        where: { id },
      });

      if (!currency) {
        throw new NotFoundException(`Currency with ID ${id} not found`);
      }

      return currency;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch currency: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch currency');
    }
  }

  /**
   * Get currency by code
   */
  async findByCode(code: string): Promise<Currency> {
    try {
      const currency = await this.currencyRepository.findOne({
        where: { code },
      });

      if (!currency) {
        throw new NotFoundException(`Currency with code ${code} not found`);
      }

      return currency;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch currency by code: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch currency');
    }
  }

  /**
   * Update currency
   */
  async update(id: string, updateCurrencyDto: UpdateCurrencyDto): Promise<Currency> {
    try {
      const currency = await this.findOne(id);

      Object.assign(currency, updateCurrencyDto);
      const updatedCurrency = await this.currencyRepository.save(currency);
      
      this.logger.log(`Currency updated: ${updatedCurrency.code}`);
      return updatedCurrency;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update currency: ${error.message}`);
      throw new InternalServerErrorException('Failed to update currency');
    }
  }

  /**
   * Delete currency (soft delete by setting isActive to false)
   */
  async remove(id: string): Promise<void> {
    try {
      const currency = await this.findOne(id);
      currency.isActive = false;
      await this.currencyRepository.save(currency);
      
      this.logger.log(`Currency deactivated: ${currency.code}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to deactivate currency: ${error.message}`);
      throw new InternalServerErrorException('Failed to deactivate currency');
    }
  }

  /**
   * Convert currency amount
   */
  async convertCurrency(
    fromCurrencyCode: string,
    toCurrencyCode: string,
    amount: number,
    date?: Date,
  ): Promise<{ convertedAmount: number; rate: number; effectiveDate: Date }> {
    try {
      const fromCurrency = await this.findByCode(fromCurrencyCode);
      const toCurrency = await this.findByCode(toCurrencyCode);

      // If same currency, no conversion needed
      if (fromCurrency.id === toCurrency.id) {
        return {
          convertedAmount: amount,
          rate: 1,
          effectiveDate: new Date(),
        };
      }

      // Find the most recent exchange rate
      const effectiveDate = date || new Date();
      const exchangeRate = await this.exchangeRateRepository.findOne({
        where: {
          fromCurrencyId: fromCurrency.id,
          toCurrencyId: toCurrency.id,
          isActive: true,
          effectiveDate: LessThanOrEqual(effectiveDate),
        },
        order: { effectiveDate: 'DESC' },
      });

      if (!exchangeRate) {
        throw new NotFoundException(
          `No exchange rate found from ${fromCurrencyCode} to ${toCurrencyCode}`,
        );
      }

      const convertedAmount = amount * Number(exchangeRate.rate);
      
      this.logger.debug(
        `Converted ${amount} ${fromCurrencyCode} to ${convertedAmount} ${toCurrencyCode} (rate: ${exchangeRate.rate})`,
      );

      return {
        convertedAmount,
        rate: Number(exchangeRate.rate),
        effectiveDate: exchangeRate.effectiveDate,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to convert currency: ${error.message}`);
      throw new InternalServerErrorException('Failed to convert currency');
    }
  }

  /**
   * Format currency amount according to currency settings
   */
  formatAmount(amount: number, currency: Currency): string {
    const formatted = amount.toFixed(currency.decimalPlaces);
    return `${currency.symbol}${formatted}`;
  }

  /**
   * Validate currency exists and is active
   */
  async validateCurrencyExists(currencyId: string): Promise<void> {
    const currency = await this.currencyRepository.findOne({
      where: { id: currencyId, isActive: true },
    });

    if (!currency) {
      throw new NotFoundException(`Active currency with ID ${currencyId} not found`);
    }
  }
}

