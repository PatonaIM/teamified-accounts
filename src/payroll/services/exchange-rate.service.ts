import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { CreateExchangeRateDto, UpdateExchangeRateDto } from '../dto/exchange-rate.dto';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  /**
   * Create a new exchange rate
   */
  async create(createExchangeRateDto: CreateExchangeRateDto): Promise<ExchangeRate> {
    try {
      // Validate that from and to currencies are different
      if (createExchangeRateDto.fromCurrencyId === createExchangeRateDto.toCurrencyId) {
        throw new BadRequestException('From and to currencies must be different');
      }

      const exchangeRate = this.exchangeRateRepository.create({
        ...createExchangeRateDto,
        effectiveDate: new Date(createExchangeRateDto.effectiveDate),
      });
      
      const savedRate = await this.exchangeRateRepository.save(exchangeRate);
      
      this.logger.log(
        `Exchange rate created: ${savedRate.fromCurrencyId} -> ${savedRate.toCurrencyId} (${savedRate.rate})`,
      );
      return savedRate;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create exchange rate: ${error.message}`);
      throw new InternalServerErrorException('Failed to create exchange rate');
    }
  }

  /**
   * Get all exchange rates for a currency pair
   */
  async findByCurrencyPair(
    fromCurrencyId: string,
    toCurrencyId: string,
    includeInactive = false,
  ): Promise<ExchangeRate[]> {
    try {
      const where: any = { fromCurrencyId, toCurrencyId };
      if (!includeInactive) {
        where.isActive = true;
      }

      return await this.exchangeRateRepository.find({
        where,
        relations: ['fromCurrency', 'toCurrency'],
        order: { effectiveDate: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch exchange rates: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch exchange rates');
    }
  }

  /**
   * Get current (most recent) exchange rate for a currency pair
   */
  async findCurrentRate(
    fromCurrencyId: string,
    toCurrencyId: string,
    date?: Date,
  ): Promise<ExchangeRate> {
    try {
      const effectiveDate = date || new Date();
      
      const rate = await this.exchangeRateRepository.findOne({
        where: {
          fromCurrencyId,
          toCurrencyId,
          isActive: true,
          effectiveDate: LessThanOrEqual(effectiveDate),
        },
        relations: ['fromCurrency', 'toCurrency'],
        order: { effectiveDate: 'DESC' },
      });

      if (!rate) {
        throw new NotFoundException(
          `No exchange rate found for the specified currency pair`,
        );
      }

      return rate;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch current exchange rate: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch current exchange rate');
    }
  }

  /**
   * Get exchange rate by ID
   */
  async findOne(id: string): Promise<ExchangeRate> {
    try {
      const rate = await this.exchangeRateRepository.findOne({
        where: { id },
        relations: ['fromCurrency', 'toCurrency'],
      });

      if (!rate) {
        throw new NotFoundException(`Exchange rate with ID ${id} not found`);
      }

      return rate;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch exchange rate: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch exchange rate');
    }
  }

  /**
   * Update exchange rate
   */
  async update(id: string, updateExchangeRateDto: UpdateExchangeRateDto): Promise<ExchangeRate> {
    try {
      const rate = await this.findOne(id);

      Object.assign(rate, updateExchangeRateDto);
      
      if (updateExchangeRateDto.effectiveDate) {
        rate.effectiveDate = new Date(updateExchangeRateDto.effectiveDate);
      }

      const updatedRate = await this.exchangeRateRepository.save(rate);
      
      this.logger.log(`Exchange rate updated: ${updatedRate.id}`);
      return updatedRate;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update exchange rate: ${error.message}`);
      throw new InternalServerErrorException('Failed to update exchange rate');
    }
  }

  /**
   * Delete exchange rate (soft delete)
   */
  async remove(id: string): Promise<void> {
    try {
      const rate = await this.findOne(id);
      rate.isActive = false;
      await this.exchangeRateRepository.save(rate);
      
      this.logger.log(`Exchange rate deactivated: ${rate.id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to deactivate exchange rate: ${error.message}`);
      throw new InternalServerErrorException('Failed to deactivate exchange rate');
    }
  }

  /**
   * Get all exchange rates for a currency
   */
  async findByCurrency(currencyId: string): Promise<ExchangeRate[]> {
    try {
      const [fromRates, toRates] = await Promise.all([
        this.exchangeRateRepository.find({
          where: { fromCurrencyId: currencyId, isActive: true },
          relations: ['fromCurrency', 'toCurrency'],
          order: { effectiveDate: 'DESC' },
        }),
        this.exchangeRateRepository.find({
          where: { toCurrencyId: currencyId, isActive: true },
          relations: ['fromCurrency', 'toCurrency'],
          order: { effectiveDate: 'DESC' },
        }),
      ]);

      return [...fromRates, ...toRates];
    } catch (error) {
      this.logger.error(`Failed to fetch exchange rates by currency: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch exchange rates by currency');
    }
  }
}

