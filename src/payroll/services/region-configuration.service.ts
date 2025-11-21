import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegionConfiguration } from '../entities/region-configuration.entity';
import {
  CreateRegionConfigurationDto,
  UpdateRegionConfigurationDto,
} from '../dto/region-configuration.dto';
import { CountryService } from './country.service';

@Injectable()
export class RegionConfigurationService {
  private readonly logger = new Logger(RegionConfigurationService.name);

  constructor(
    @InjectRepository(RegionConfiguration)
    private readonly regionConfigRepository: Repository<RegionConfiguration>,
    private readonly countryService: CountryService,
  ) {}

  /**
   * Create a new region configuration
   */
  async create(
    createRegionConfigDto: CreateRegionConfigurationDto,
  ): Promise<RegionConfiguration> {
    try {
      // Check if configuration key already exists for this country
      const existing = await this.regionConfigRepository.findOne({
        where: {
          countryId: createRegionConfigDto.countryId,
          configKey: createRegionConfigDto.configKey,
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Configuration key '${createRegionConfigDto.configKey}' already exists for this country`,
        );
      }

      const config = this.regionConfigRepository.create(createRegionConfigDto);
      const savedConfig = await this.regionConfigRepository.save(config);
      
      this.logger.log(
        `Region configuration created: ${savedConfig.configKey} for country ${savedConfig.countryId}`,
      );
      return savedConfig;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create region configuration: ${error.message}`);
      throw new InternalServerErrorException('Failed to create region configuration');
    }
  }

  /**
   * Get all configurations for a country
   */
  async findByCountry(countryIdOrCode: string, includeInactive = false): Promise<RegionConfiguration[]> {
    try {
      // Try to resolve country code to UUID
      let countryId = countryIdOrCode;
      
      // Check if it's a country code (2-3 letters) or UUID
      if (/^[A-Z]{2,3}$/i.test(countryIdOrCode)) {
        const country = await this.countryService.findByCode(countryIdOrCode);
        countryId = country.id;
      }

      const where: any = { countryId };
      if (!includeInactive) {
        where.isActive = true;
      }

      return await this.regionConfigRepository.find({
        where,
        order: { configKey: 'ASC' },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Return empty array if country not found
        return [];
      }
      this.logger.error(`Failed to fetch region configurations: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch region configurations');
    }
  }

  /**
   * Get specific configuration by key and country
   */
  async findByKey(countryIdOrCode: string, configKey: string): Promise<RegionConfiguration> {
    try {
      // Try to resolve country code to UUID
      let countryId = countryIdOrCode;
      
      // Check if it's a country code (2-3 letters) or UUID
      if (/^[A-Z]{2,3}$/i.test(countryIdOrCode)) {
        const country = await this.countryService.findByCode(countryIdOrCode);
        countryId = country.id;
      }

      const config = await this.regionConfigRepository.findOne({
        where: { countryId, configKey, isActive: true },
      });

      if (!config) {
        throw new NotFoundException(
          `Configuration '${configKey}' not found for country ${countryIdOrCode}`,
        );
      }

      return config;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch configuration: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch configuration');
    }
  }

  /**
   * Get configuration value by key and country
   */
  async getConfigValue<T = any>(countryIdOrCode: string, configKey: string, defaultValue?: T): Promise<T> {
    try {
      // Try to resolve country code to UUID
      let countryId = countryIdOrCode;
      
      // Check if it's a country code (2-3 letters) or UUID
      if (/^[A-Z]{2,3}$/i.test(countryIdOrCode)) {
        const country = await this.countryService.findByCode(countryIdOrCode);
        countryId = country.id;
      }

      const config = await this.regionConfigRepository.findOne({
        where: { countryId, configKey, isActive: true },
      });

      if (!config) {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw new NotFoundException(
          `Configuration '${configKey}' not found for country ${countryIdOrCode}`,
        );
      }

      return config.configValue as T;
    } catch (error) {
      if (error instanceof NotFoundException) {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw error;
      }
      this.logger.error(`Failed to get configuration value: ${error.message}`);
      throw new InternalServerErrorException('Failed to get configuration value');
    }
  }

  /**
   * Get configuration by ID
   */
  async findOne(id: string): Promise<RegionConfiguration> {
    try {
      const config = await this.regionConfigRepository.findOne({
        where: { id },
        relations: ['country'],
      });

      if (!config) {
        throw new NotFoundException(`Configuration with ID ${id} not found`);
      }

      return config;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch configuration: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch configuration');
    }
  }

  /**
   * Update region configuration
   */
  async update(
    id: string,
    updateRegionConfigDto: UpdateRegionConfigurationDto,
  ): Promise<RegionConfiguration> {
    try {
      const config = await this.findOne(id);

      Object.assign(config, updateRegionConfigDto);
      const updatedConfig = await this.regionConfigRepository.save(config);
      
      this.logger.log(`Region configuration updated: ${updatedConfig.configKey}`);
      return updatedConfig;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update region configuration: ${error.message}`);
      throw new InternalServerErrorException('Failed to update region configuration');
    }
  }

  /**
   * Delete region configuration (soft delete)
   */
  async remove(id: string): Promise<void> {
    try {
      const config = await this.findOne(id);
      config.isActive = false;
      await this.regionConfigRepository.save(config);
      
      this.logger.log(`Region configuration deactivated: ${config.configKey}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to deactivate region configuration: ${error.message}`);
      throw new InternalServerErrorException('Failed to deactivate region configuration');
    }
  }

  /**
   * Validate region-specific business rules
   */
  async validateBusinessRule(countryId: string, ruleKey: string, value: any): Promise<boolean> {
    try {
      const config = await this.getConfigValue<any>(countryId, ruleKey);
      
      // Implement validation logic based on configuration
      // This is a placeholder for region-specific validation
      if (config && config.validationRules) {
        // Perform validation based on rules
        return true;
      }

      return true;
    } catch (error) {
      this.logger.warn(`Business rule validation failed: ${error.message}`);
      return false;
    }
  }
}

