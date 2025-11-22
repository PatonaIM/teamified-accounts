import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { CreateCountryDto, UpdateCountryDto } from '../dto/country.dto';

@Injectable()
export class CountryService {
  private readonly logger = new Logger(CountryService.name);

  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  /**
   * Create a new country
   */
  async create(createCountryDto: CreateCountryDto): Promise<Country> {
    try {
      // Check if country code already exists
      const existingCountry = await this.countryRepository.findOne({
        where: { code: createCountryDto.code },
      });

      if (existingCountry) {
        throw new BadRequestException(
          `Country with code ${createCountryDto.code} already exists`,
        );
      }

      const country = this.countryRepository.create(createCountryDto);
      const savedCountry = await this.countryRepository.save(country);
      
      this.logger.log(`Country created: ${savedCountry.code} - ${savedCountry.name}`);
      return savedCountry;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create country: ${error.message}`);
      throw new InternalServerErrorException('Failed to create country');
    }
  }

  /**
   * Get all countries
   */
  async findAll(includeInactive = false): Promise<Country[]> {
    try {
      const where = includeInactive ? {} : { isActive: true };
      return await this.countryRepository.find({
        where,
        relations: ['currency'],
        order: { name: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch countries: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch countries');
    }
  }

  /**
   * Get country by ID
   */
  async findOne(id: string): Promise<Country> {
    try {
      const country = await this.countryRepository.findOne({
        where: { id },
        relations: ['currency', 'taxYears', 'regionConfigurations'],
      });

      if (!country) {
        throw new NotFoundException(`Country with ID ${id} not found`);
      }

      return country;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch country: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch country');
    }
  }

  /**
   * Get country by code
   */
  async findByCode(code: string): Promise<Country> {
    try {
      const country = await this.countryRepository.findOne({
        where: { code },
        relations: ['currency'],
      });

      if (!country) {
        throw new NotFoundException(`Country with code ${code} not found`);
      }

      return country;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch country by code: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch country');
    }
  }

  /**
   * Update country
   */
  async update(id: string, updateCountryDto: UpdateCountryDto): Promise<Country> {
    try {
      const country = await this.findOne(id);

      Object.assign(country, updateCountryDto);
      const updatedCountry = await this.countryRepository.save(country);
      
      this.logger.log(`Country updated: ${updatedCountry.code}`);
      return updatedCountry;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update country: ${error.message}`);
      throw new InternalServerErrorException('Failed to update country');
    }
  }

  /**
   * Delete country (soft delete by setting isActive to false)
   */
  async remove(id: string): Promise<void> {
    try {
      const country = await this.findOne(id);
      country.isActive = false;
      await this.countryRepository.save(country);
      
      this.logger.log(`Country deactivated: ${country.code}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to deactivate country: ${error.message}`);
      throw new InternalServerErrorException('Failed to deactivate country');
    }
  }

  /**
   * Validate country exists and is active
   */
  async validateCountryExists(countryId: string): Promise<void> {
    const country = await this.countryRepository.findOne({
      where: { id: countryId, isActive: true },
    });

    if (!country) {
      throw new NotFoundException(`Active country with ID ${countryId} not found`);
    }
  }

  /**
   * Get countries by currency
   */
  async findByCurrency(currencyId: string): Promise<Country[]> {
    try {
      return await this.countryRepository.find({
        where: { currencyId, isActive: true },
        relations: ['currency'],
      });
    } catch (error) {
      this.logger.error(`Failed to fetch countries by currency: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch countries by currency');
    }
  }
}

