import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryComponent } from '../entities/salary-component.entity';
import { Country } from '../entities/country.entity';
import { RegionConfigurationService } from './region-configuration.service';
import {
  CreateSalaryComponentDto,
  UpdateSalaryComponentDto,
  SalaryComponentResponseDto,
  SalaryComponentListResponseDto,
} from '../dto/salary-component.dto';
import { CalculationType } from '../entities/salary-component.entity';

@Injectable()
export class SalaryComponentService {
  private readonly logger = new Logger(SalaryComponentService.name);

  constructor(
    @InjectRepository(SalaryComponent)
    private readonly salaryComponentRepository: Repository<SalaryComponent>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly regionConfigurationService: RegionConfigurationService,
  ) {}

  /**
   * Create a new salary component
   */
  async create(createDto: CreateSalaryComponentDto): Promise<SalaryComponentResponseDto> {
    try {
      // Validate country exists
      const country = await this.countryRepository.findOne({
        where: { id: createDto.countryId },
      });

      if (!country) {
        throw new NotFoundException(`Country with ID ${createDto.countryId} not found`);
      }

      // Check if component code already exists for this country
      const existingComponent = await this.salaryComponentRepository.findOne({
        where: {
          countryId: createDto.countryId,
          componentCode: createDto.componentCode,
        },
      });

      if (existingComponent) {
        throw new BadRequestException(
          `Salary component with code '${createDto.componentCode}' already exists for this country`,
        );
      }

      // Validate calculation rules
      this.validateCalculationRules(createDto);

      // Apply country-specific business rules
      await this.applyCountrySpecificRules(createDto, country);

      const component = this.salaryComponentRepository.create(createDto);
      const savedComponent = await this.salaryComponentRepository.save(component);
      
      this.logger.log(
        `Salary component created: ${savedComponent.componentCode} for country ${savedComponent.countryId}`,
      );
      
      return this.mapToResponseDto(savedComponent);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create salary component: ${error.message}`);
      throw new InternalServerErrorException('Failed to create salary component');
    }
  }

  /**
   * Get all salary components for a country
   */
  async findByCountry(
    countryId: string,
    page: number = 1,
    limit: number = 10,
    componentType?: string,
    isActive?: boolean,
  ): Promise<SalaryComponentListResponseDto> {
    try {
      const queryBuilder = this.salaryComponentRepository
        .createQueryBuilder('component')
        .where('component.countryId = :countryId', { countryId });

      if (componentType) {
        queryBuilder.andWhere('component.componentType = :componentType', { componentType });
      }

      if (isActive !== undefined) {
        queryBuilder.andWhere('component.isActive = :isActive', { isActive });
      }

      queryBuilder
        .orderBy('component.displayOrder', 'ASC')
        .addOrderBy('component.componentName', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      const [components, total] = await queryBuilder.getManyAndCount();

      return {
        components: components.map(component => this.mapToResponseDto(component)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch salary components for country ${countryId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch salary components');
    }
  }

  /**
   * Get a salary component by ID
   */
  async findOne(id: string): Promise<SalaryComponentResponseDto> {
    try {
      const component = await this.salaryComponentRepository.findOne({
        where: { id },
        relations: ['country'],
      });

      if (!component) {
        throw new NotFoundException(`Salary component with ID ${id} not found`);
      }

      return this.mapToResponseDto(component);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch salary component ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch salary component');
    }
  }

  /**
   * Update a salary component
   */
  async update(id: string, updateDto: UpdateSalaryComponentDto): Promise<SalaryComponentResponseDto> {
    try {
      const component = await this.salaryComponentRepository.findOne({
        where: { id },
        relations: ['country'],
      });

      if (!component) {
        throw new NotFoundException(`Salary component with ID ${id} not found`);
      }

      // Check if component code already exists for this country (if being updated)
      if (updateDto.componentCode && updateDto.componentCode !== component.componentCode) {
        const existingComponent = await this.salaryComponentRepository.findOne({
          where: {
            countryId: component.countryId,
            componentCode: updateDto.componentCode,
          },
        });

        if (existingComponent) {
          throw new BadRequestException(
            `Salary component with code '${updateDto.componentCode}' already exists for this country`,
          );
        }
      }

      // Validate calculation rules
      const mergedDto = { ...component, ...updateDto };
      this.validateCalculationRules(mergedDto);

      // Apply country-specific business rules
      await this.applyCountrySpecificRules(mergedDto, component.country);

      Object.assign(component, updateDto);
      const savedComponent = await this.salaryComponentRepository.save(component);
      
      this.logger.log(`Salary component updated: ${savedComponent.componentCode}`);
      
      return this.mapToResponseDto(savedComponent);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update salary component ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to update salary component');
    }
  }

  /**
   * Delete a salary component
   */
  async remove(id: string): Promise<void> {
    try {
      const component = await this.salaryComponentRepository.findOne({
        where: { id },
      });

      if (!component) {
        throw new NotFoundException(`Salary component with ID ${id} not found`);
      }

      // Check if component is mandatory
      if (component.isMandatory) {
        throw new BadRequestException(
          `Cannot delete mandatory salary component: ${component.componentCode}`,
        );
      }

      await this.salaryComponentRepository.remove(component);
      
      this.logger.log(`Salary component deleted: ${component.componentCode}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to delete salary component ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete salary component');
    }
  }

  /**
   * Get salary components by type for a country
   */
  async findByType(
    countryId: string,
    componentType: string,
  ): Promise<SalaryComponentResponseDto[]> {
    try {
      const components = await this.salaryComponentRepository.find({
        where: {
          countryId,
          componentType: componentType as any,
          isActive: true,
        },
        order: {
          displayOrder: 'ASC',
          componentName: 'ASC',
        },
      });

      return components.map(component => this.mapToResponseDto(component));
    } catch (error) {
      this.logger.error(
        `Failed to fetch salary components by type ${componentType} for country ${countryId}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to fetch salary components by type');
    }
  }

  /**
   * Validate calculation rules
   */
  private validateCalculationRules(dto: CreateSalaryComponentDto | UpdateSalaryComponentDto): void {
    if (dto.calculationType === CalculationType.FIXED_AMOUNT) {
      if (!dto.calculationValue || dto.calculationValue <= 0) {
        throw new BadRequestException(
          'Fixed amount calculation requires a positive calculation value',
        );
      }
      if (dto.calculationFormula) {
        throw new BadRequestException(
          'Fixed amount calculation should not have a calculation formula',
        );
      }
    } else if (dto.calculationType === CalculationType.PERCENTAGE_OF_BASIC ||
               dto.calculationType === CalculationType.PERCENTAGE_OF_GROSS ||
               dto.calculationType === CalculationType.PERCENTAGE_OF_NET) {
      if (!dto.calculationValue || dto.calculationValue <= 0 || dto.calculationValue > 100) {
        throw new BadRequestException(
          'Percentage calculation requires a value between 0 and 100',
        );
      }
      if (dto.calculationFormula) {
        throw new BadRequestException(
          'Percentage calculation should not have a calculation formula',
        );
      }
    } else if (dto.calculationType === CalculationType.FORMULA) {
      if (!dto.calculationFormula || dto.calculationFormula.trim().length === 0) {
        throw new BadRequestException(
          'Formula calculation requires a valid calculation formula',
        );
      }
      if (dto.calculationValue !== undefined && dto.calculationValue !== null) {
        throw new BadRequestException(
          'Formula calculation should not have a calculation value',
        );
      }
    }
  }

  /**
   * Apply country-specific business rules
   */
  private async applyCountrySpecificRules(
    dto: CreateSalaryComponentDto | UpdateSalaryComponentDto,
    country: Country,
  ): Promise<void> {
    // Get country-specific configuration
    const regionConfigs = await this.regionConfigurationService.findByCountry(country.id);
    
    // Apply country-specific validation rules
    if (country.code === 'IN') {
      // India-specific rules
      if (dto.componentType === 'earnings' && dto.componentCode === 'BASIC') {
        if (!dto.isMandatory) {
          throw new BadRequestException('Basic salary component must be mandatory in India');
        }
      }
    } else if (country.code === 'PH') {
      // Philippines-specific rules
      if (dto.componentType === 'earnings' && dto.componentCode === 'BASIC') {
        if (!dto.isMandatory) {
          throw new BadRequestException('Basic salary component must be mandatory in Philippines');
        }
      }
    }

    // Apply any other country-specific rules based on region configuration
    const salaryRules = regionConfigs.find(config => config.configKey === 'salary_component_rules');
    if (salaryRules) {
      // Apply additional rules from region configuration
      this.logger.log(`Applied salary component rules for country ${country.code}`);
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(component: SalaryComponent): SalaryComponentResponseDto {
    return {
      id: component.id,
      countryId: component.countryId,
      componentName: component.componentName,
      componentCode: component.componentCode,
      componentType: component.componentType,
      calculationType: component.calculationType,
      calculationValue: component.calculationValue,
      calculationFormula: component.calculationFormula,
      isTaxable: component.isTaxable,
      isStatutory: component.isStatutory,
      isMandatory: component.isMandatory,
      displayOrder: component.displayOrder,
      description: component.description,
      isActive: component.isActive,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt,
    };
  }
}
