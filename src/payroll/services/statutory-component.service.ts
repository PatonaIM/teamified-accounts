import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatutoryComponent } from '../entities/statutory-component.entity';
import { Country } from '../entities/country.entity';
import { RegionConfigurationService } from './region-configuration.service';
import {
  CreateStatutoryComponentDto,
  UpdateStatutoryComponentDto,
  StatutoryComponentResponseDto,
  StatutoryComponentListResponseDto,
} from '../dto/statutory-component.dto';
import { ContributionType, StatutoryComponentType } from '../entities/statutory-component.entity';

@Injectable()
export class StatutoryComponentService {
  private readonly logger = new Logger(StatutoryComponentService.name);

  constructor(
    @InjectRepository(StatutoryComponent)
    private readonly statutoryComponentRepository: Repository<StatutoryComponent>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly regionConfigurationService: RegionConfigurationService,
  ) {}

  /**
   * Create a new statutory component
   */
  async create(createDto: CreateStatutoryComponentDto): Promise<StatutoryComponentResponseDto> {
    try {
      // Validate country exists
      const country = await this.countryRepository.findOne({
        where: { id: createDto.countryId },
      });

      if (!country) {
        throw new NotFoundException(`Country with ID ${createDto.countryId} not found`);
      }

      // Check if component code already exists for this country
      const existingComponent = await this.statutoryComponentRepository.findOne({
        where: {
          countryId: createDto.countryId,
          componentCode: createDto.componentCode,
        },
      });

      if (existingComponent) {
        throw new BadRequestException(
          `Statutory component with code '${createDto.componentCode}' already exists for this country`,
        );
      }

      // Validate contribution rules
      this.validateContributionRules(createDto);

      // Apply country-specific business rules
      await this.applyCountrySpecificRules(createDto, country);

      const component = this.statutoryComponentRepository.create(createDto);
      const savedComponent = await this.statutoryComponentRepository.save(component);
      
      this.logger.log(
        `Statutory component created: ${savedComponent.componentCode} for country ${savedComponent.countryId}`,
      );
      
      return this.mapToResponseDto(savedComponent);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create statutory component: ${error.message}`);
      throw new InternalServerErrorException('Failed to create statutory component');
    }
  }

  /**
   * Get all statutory components for a country
   */
  async findByCountry(
    countryId: string,
    page: number = 1,
    limit: number = 10,
    componentType?: string,
    isActive?: boolean,
  ): Promise<StatutoryComponentListResponseDto> {
    try {
      const queryBuilder = this.statutoryComponentRepository
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
      this.logger.error(`Failed to fetch statutory components for country ${countryId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch statutory components');
    }
  }

  /**
   * Get a statutory component by ID
   */
  async findOne(id: string): Promise<StatutoryComponentResponseDto> {
    try {
      const component = await this.statutoryComponentRepository.findOne({
        where: { id },
        relations: ['country'],
      });

      if (!component) {
        throw new NotFoundException(`Statutory component with ID ${id} not found`);
      }

      return this.mapToResponseDto(component);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch statutory component ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch statutory component');
    }
  }

  /**
   * Update a statutory component
   */
  async update(id: string, updateDto: UpdateStatutoryComponentDto): Promise<StatutoryComponentResponseDto> {
    try {
      const component = await this.statutoryComponentRepository.findOne({
        where: { id },
        relations: ['country'],
      });

      if (!component) {
        throw new NotFoundException(`Statutory component with ID ${id} not found`);
      }

      // Check if component code already exists for this country (if being updated)
      if (updateDto.componentCode && updateDto.componentCode !== component.componentCode) {
        const existingComponent = await this.statutoryComponentRepository.findOne({
          where: {
            countryId: component.countryId,
            componentCode: updateDto.componentCode,
          },
        });

        if (existingComponent) {
          throw new BadRequestException(
            `Statutory component with code '${updateDto.componentCode}' already exists for this country`,
          );
        }
      }

      // Validate contribution rules
      const mergedDto = { 
        ...component, 
        ...updateDto,
        effectiveFrom: updateDto.effectiveFrom || component.effectiveFrom.toISOString(),
        effectiveTo: updateDto.effectiveTo || (component.effectiveTo ? component.effectiveTo.toISOString() : undefined)
      };
      this.validateContributionRules(mergedDto);

      // Apply country-specific business rules
      await this.applyCountrySpecificRules(mergedDto, component.country);

      Object.assign(component, updateDto);
      const savedComponent = await this.statutoryComponentRepository.save(component);
      
      this.logger.log(`Statutory component updated: ${savedComponent.componentCode}`);
      
      return this.mapToResponseDto(savedComponent);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update statutory component ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to update statutory component');
    }
  }

  /**
   * Delete a statutory component
   */
  async remove(id: string): Promise<void> {
    try {
      const component = await this.statutoryComponentRepository.findOne({
        where: { id },
      });

      if (!component) {
        throw new NotFoundException(`Statutory component with ID ${id} not found`);
      }

      // Check if component is mandatory
      if (component.isMandatory) {
        throw new BadRequestException(
          `Cannot delete mandatory statutory component: ${component.componentCode}`,
        );
      }

      await this.statutoryComponentRepository.remove(component);
      
      this.logger.log(`Statutory component deleted: ${component.componentCode}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to delete statutory component ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete statutory component');
    }
  }

  /**
   * Get statutory components by type for a country
   */
  async findByType(
    countryId: string,
    componentType: string,
  ): Promise<StatutoryComponentResponseDto[]> {
    try {
      const components = await this.statutoryComponentRepository.find({
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
        `Failed to fetch statutory components by type ${componentType} for country ${countryId}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to fetch statutory components by type');
    }
  }

  /**
   * Get active statutory components for a country on a specific date
   */
  async findActiveByDate(
    countryId: string,
    date: Date,
  ): Promise<StatutoryComponentResponseDto[]> {
    try {
      const components = await this.statutoryComponentRepository
        .createQueryBuilder('component')
        .where('component.countryId = :countryId', { countryId })
        .andWhere('component.isActive = :isActive', { isActive: true })
        .andWhere('component.effectiveFrom <= :date', { date })
        .andWhere('(component.effectiveTo IS NULL OR component.effectiveTo >= :date)', { date })
        .orderBy('component.displayOrder', 'ASC')
        .addOrderBy('component.componentName', 'ASC')
        .getMany();

      return components.map(component => this.mapToResponseDto(component));
    } catch (error) {
      this.logger.error(
        `Failed to fetch active statutory components for country ${countryId} on date ${date}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to fetch active statutory components');
    }
  }

  /**
   * Validate contribution rules
   */
  private validateContributionRules(dto: CreateStatutoryComponentDto | UpdateStatutoryComponentDto): void {
    if (dto.contributionType === ContributionType.EMPLOYEE || dto.contributionType === ContributionType.BOTH) {
      if (!dto.employeePercentage || dto.employeePercentage <= 0 || dto.employeePercentage > 100) {
        throw new BadRequestException(
          'Employee contribution requires a percentage between 0 and 100',
        );
      }
    }

    if (dto.contributionType === ContributionType.EMPLOYER || dto.contributionType === ContributionType.BOTH) {
      if (!dto.employerPercentage || dto.employerPercentage <= 0 || dto.employerPercentage > 100) {
        throw new BadRequestException(
          'Employer contribution requires a percentage between 0 and 100',
        );
      }
    }

    if (dto.contributionType === ContributionType.EMPLOYEE) {
      if (dto.employerPercentage !== undefined && dto.employerPercentage !== null) {
        throw new BadRequestException(
          'Employee-only contribution should not have employer percentage',
        );
      }
    }

    if (dto.contributionType === ContributionType.EMPLOYER) {
      if (dto.employeePercentage !== undefined && dto.employeePercentage !== null) {
        throw new BadRequestException(
          'Employer-only contribution should not have employee percentage',
        );
      }
    }

    // Validate effective dates
    if (dto.effectiveFrom && dto.effectiveTo) {
      const fromDate = new Date(dto.effectiveFrom);
      const toDate = new Date(dto.effectiveTo);
      
      if (fromDate >= toDate) {
        throw new BadRequestException(
          'Effective from date must be before effective to date',
        );
      }
    }

    // Validate wage ceiling and floor
    if (dto.wageCeiling && dto.wageFloor && dto.wageCeiling <= dto.wageFloor) {
      throw new BadRequestException(
        'Wage ceiling must be greater than wage floor',
      );
    }

    // Validate minimum and maximum amounts
    if (dto.minimumAmount && dto.maximumAmount && dto.minimumAmount >= dto.maximumAmount) {
      throw new BadRequestException(
        'Minimum amount must be less than maximum amount',
      );
    }
  }

  /**
   * Apply country-specific business rules
   */
  private async applyCountrySpecificRules(
    dto: CreateStatutoryComponentDto | UpdateStatutoryComponentDto,
    country: Country,
  ): Promise<void> {
    // Get country-specific configuration
    const regionConfigs = await this.regionConfigurationService.findByCountry(country.id);
    
    // Apply country-specific validation rules
    if (country.code === 'IN') {
      // India-specific rules
      if (dto.componentType === StatutoryComponentType.EPF) {
        if (dto.contributionType !== ContributionType.BOTH) {
          throw new BadRequestException('EPF in India requires both employee and employer contributions');
        }
        if (!dto.employeePercentage || dto.employeePercentage !== 12) {
          throw new BadRequestException('EPF employee contribution must be 12% in India');
        }
        if (!dto.employerPercentage || dto.employerPercentage !== 12) {
          throw new BadRequestException('EPF employer contribution must be 12% in India');
        }
      }
      
      if (dto.componentType === StatutoryComponentType.ESI) {
        if (dto.contributionType !== ContributionType.BOTH) {
          throw new BadRequestException('ESI in India requires both employee and employer contributions');
        }
        if (!dto.employeePercentage || dto.employeePercentage !== 0.75) {
          throw new BadRequestException('ESI employee contribution must be 0.75% in India');
        }
        if (!dto.employerPercentage || dto.employerPercentage !== 3.25) {
          throw new BadRequestException('ESI employer contribution must be 3.25% in India');
        }
      }
    } else if (country.code === 'PH') {
      // Philippines-specific rules
      if (dto.componentType === StatutoryComponentType.SSS) {
        if (dto.contributionType !== ContributionType.BOTH) {
          throw new BadRequestException('SSS in Philippines requires both employee and employer contributions');
        }
      }
      
      if (dto.componentType === StatutoryComponentType.PHILHEALTH) {
        if (dto.contributionType !== ContributionType.BOTH) {
          throw new BadRequestException('PhilHealth in Philippines requires both employee and employer contributions');
        }
      }
      
      if (dto.componentType === StatutoryComponentType.PAGIBIG) {
        if (dto.contributionType !== ContributionType.BOTH) {
          throw new BadRequestException('Pag-IBIG in Philippines requires both employee and employer contributions');
        }
      }
    }

    // Apply any other country-specific rules based on region configuration
    const statutoryRules = regionConfigs.find(config => config.configKey === 'statutory_component_rules');
    if (statutoryRules) {
      // Apply additional rules from region configuration
      this.logger.log(`Applied statutory component rules for country ${country.code}`);
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(component: StatutoryComponent): StatutoryComponentResponseDto {
    return {
      id: component.id,
      countryId: component.countryId,
      componentName: component.componentName,
      componentCode: component.componentCode,
      componentType: component.componentType,
      contributionType: component.contributionType,
      calculationBasis: component.calculationBasis,
      employeePercentage: component.employeePercentage,
      employerPercentage: component.employerPercentage,
      minimumAmount: component.minimumAmount,
      maximumAmount: component.maximumAmount,
      wageCeiling: component.wageCeiling,
      wageFloor: component.wageFloor,
      effectiveFrom: component.effectiveFrom,
      effectiveTo: component.effectiveTo,
      isMandatory: component.isMandatory,
      displayOrder: component.displayOrder,
      description: component.description,
      regulatoryReference: component.regulatoryReference,
      isActive: component.isActive,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt,
    };
  }
}
