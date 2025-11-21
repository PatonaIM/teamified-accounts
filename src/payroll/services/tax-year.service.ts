import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TaxYear } from '../entities/tax-year.entity';
import { CreateTaxYearDto, UpdateTaxYearDto } from '../dto/tax-year.dto';

@Injectable()
export class TaxYearService {
  private readonly logger = new Logger(TaxYearService.name);

  constructor(
    @InjectRepository(TaxYear)
    private readonly taxYearRepository: Repository<TaxYear>,
  ) {}

  /**
   * Create a new tax year
   */
  async create(createTaxYearDto: CreateTaxYearDto): Promise<TaxYear> {
    try {
      // Parse dates as local dates (no timezone conversion)
      // Add 'T00:00:00' to ensure consistent parsing
      const startDate = new Date(`${createTaxYearDto.startDate}T00:00:00`);
      const endDate = new Date(`${createTaxYearDto.endDate}T00:00:00`);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Check for overlapping tax years in the same country
      const overlapping = await this.taxYearRepository.findOne({
        where: {
          countryId: createTaxYearDto.countryId,
          startDate: Between(startDate, endDate),
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          `Tax year overlaps with existing tax year ${overlapping.year}`,
        );
      }

      const taxYear = this.taxYearRepository.create({
        ...createTaxYearDto,
        startDate,
        endDate,
      });
      
      const savedTaxYear = await this.taxYearRepository.save(taxYear);
      
      this.logger.log(`Tax year created: ${savedTaxYear.year} for country ${savedTaxYear.countryId}`);
      return savedTaxYear;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create tax year: ${error.message}`);
      throw new InternalServerErrorException('Failed to create tax year');
    }
  }

  /**
   * Get all tax years for a country
   */
  async findByCountry(countryId: string): Promise<TaxYear[]> {
    try {
      return await this.taxYearRepository.find({
        where: { countryId },
        order: { year: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch tax years: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch tax years');
    }
  }

  /**
   * Get current tax year for a country
   */
  async findCurrentByCountry(countryId: string): Promise<TaxYear> {
    try {
      const taxYear = await this.taxYearRepository.findOne({
        where: { countryId, isCurrent: true },
      });

      if (!taxYear) {
        throw new NotFoundException(`No current tax year found for country ${countryId}`);
      }

      return taxYear;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch current tax year: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch current tax year');
    }
  }

  /**
   * Get tax year by ID
   */
  async findOne(id: string): Promise<TaxYear> {
    try {
      const taxYear = await this.taxYearRepository.findOne({
        where: { id },
        relations: ['country'],
      });

      if (!taxYear) {
        throw new NotFoundException(`Tax year with ID ${id} not found`);
      }

      return taxYear;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch tax year: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch tax year');
    }
  }

  /**
   * Update tax year
   */
  async update(id: string, updateTaxYearDto: UpdateTaxYearDto): Promise<TaxYear> {
    try {
      const taxYear = await this.findOne(id);

      // If setting as current, unset other current tax years for this country
      if (updateTaxYearDto.isCurrent === true) {
        await this.taxYearRepository.update(
          { countryId: taxYear.countryId, isCurrent: true },
          { isCurrent: false },
        );
      }

      Object.assign(taxYear, updateTaxYearDto);
      
      // Parse dates as local dates (no timezone conversion)
      if (updateTaxYearDto.startDate) {
        taxYear.startDate = new Date(`${updateTaxYearDto.startDate}T00:00:00`);
      }
      if (updateTaxYearDto.endDate) {
        taxYear.endDate = new Date(`${updateTaxYearDto.endDate}T00:00:00`);
      }

      const updatedTaxYear = await this.taxYearRepository.save(taxYear);
      
      this.logger.log(`Tax year updated: ${updatedTaxYear.year}`);
      return updatedTaxYear;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update tax year: ${error.message}`);
      throw new InternalServerErrorException('Failed to update tax year');
    }
  }

  /**
   * Delete tax year
   */
  async remove(id: string): Promise<void> {
    try {
      const taxYear = await this.findOne(id);
      await this.taxYearRepository.remove(taxYear);
      
      this.logger.log(`Tax year deleted: ${taxYear.year}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete tax year: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete tax year');
    }
  }

  /**
   * Get tax year for a specific date
   */
  async findByDate(countryId: string, date: Date): Promise<TaxYear | null> {
    try {
      return await this.taxYearRepository.findOne({
        where: {
          countryId,
          startDate: Between(new Date(date.getFullYear() - 1, 0, 1), date),
          endDate: Between(date, new Date(date.getFullYear() + 1, 11, 31)),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch tax year by date: ${error.message}`);
      return null;
    }
  }
}

