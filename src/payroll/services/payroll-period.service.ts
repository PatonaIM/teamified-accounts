import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PayrollPeriod, PayrollPeriodStatus } from '../entities/payroll-period.entity';
import { CreatePayrollPeriodDto, UpdatePayrollPeriodDto } from '../dto/payroll-period.dto';
import { CountryService } from './country.service';

@Injectable()
export class PayrollPeriodService {
  private readonly logger = new Logger(PayrollPeriodService.name);

  constructor(
    @InjectRepository(PayrollPeriod)
    private readonly payrollPeriodRepository: Repository<PayrollPeriod>,
    @Inject(forwardRef(() => CountryService))
    private readonly countryService: CountryService,
  ) {}

  /**
   * Create a new payroll period
   * Accepts either country UUID or country code (e.g., "IN", "AU")
   */
  async create(createPayrollPeriodDto: CreatePayrollPeriodDto): Promise<PayrollPeriod> {
    try {
      // Convert country code to UUID if necessary
      let countryId = createPayrollPeriodDto.countryId;
      const isCountryCode = /^[A-Z]{2,3}$/i.test(countryId);
      
      if (isCountryCode) {
        const country = await this.countryService.findByCode(countryId.toUpperCase());
        if (!country) {
          throw new NotFoundException(`Country with code ${countryId} not found`);
        }
        countryId = country.id;
        this.logger.log(`Resolved country code ${createPayrollPeriodDto.countryId} to ID ${countryId}`);
      }
      
      // Validate start date is before end date
      const startDate = new Date(createPayrollPeriodDto.startDate);
      const endDate = new Date(createPayrollPeriodDto.endDate);
      const payDate = new Date(createPayrollPeriodDto.payDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      if (payDate < endDate) {
        throw new BadRequestException('Pay date should be on or after the period end date');
      }

      // Check for overlapping periods in the same country
      const overlapping = await this.payrollPeriodRepository.findOne({
        where: {
          countryId: countryId,
          startDate: Between(startDate, endDate),
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          `Period overlaps with existing period: ${overlapping.periodName}`,
        );
      }

      const period = this.payrollPeriodRepository.create({
        ...createPayrollPeriodDto,
        countryId, // Use the resolved UUID
        startDate,
        endDate,
        payDate,
      });
      
      const savedPeriod = await this.payrollPeriodRepository.save(period);
      
      this.logger.log(`Payroll period created: ${savedPeriod.periodName}`);
      return savedPeriod;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to create payroll period: ${error.message}`);
      throw new InternalServerErrorException('Failed to create payroll period');
    }
  }

  /**
   * Get all payroll periods for a country
   * Accepts either country UUID or country code (e.g., "IN", "AU")
   */
  async findByCountry(countryIdOrCode: string, status?: PayrollPeriodStatus): Promise<PayrollPeriod[]> {
    try {
      let countryId = countryIdOrCode;
      
      // Check if it's a country code (2-3 letter code) instead of UUID
      const isCountryCode = /^[A-Z]{2,3}$/i.test(countryIdOrCode);
      
      if (isCountryCode) {
        // Look up country by code to get UUID
        const country = await this.countryService.findByCode(countryIdOrCode.toUpperCase());
        if (!country) {
          throw new NotFoundException(`Country with code ${countryIdOrCode} not found`);
        }
        countryId = country.id;
        this.logger.log(`Resolved country code ${countryIdOrCode} to ID ${countryId}`);
      }
      
      const where: any = { countryId };
      if (status) {
        where.status = status;
      }

      return await this.payrollPeriodRepository.find({
        where,
        order: { startDate: 'DESC' },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch payroll periods: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch payroll periods');
    }
  }

  /**
   * Get payroll period by ID
   */
  async findOne(id: string): Promise<PayrollPeriod> {
    try {
      const period = await this.payrollPeriodRepository.findOne({
        where: { id },
        relations: ['country'],
      });

      if (!period) {
        throw new NotFoundException(`Payroll period with ID ${id} not found`);
      }

      return period;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch payroll period: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch payroll period');
    }
  }

  /**
   * Update payroll period
   */
  async update(id: string, updatePayrollPeriodDto: UpdatePayrollPeriodDto): Promise<PayrollPeriod> {
    try {
      const period = await this.findOne(id);

      // Prevent updates to closed periods
      if (period.status === PayrollPeriodStatus.CLOSED) {
        throw new BadRequestException('Cannot update closed payroll period');
      }

      Object.assign(period, updatePayrollPeriodDto);
      
      if (updatePayrollPeriodDto.startDate) {
        period.startDate = new Date(updatePayrollPeriodDto.startDate);
      }
      if (updatePayrollPeriodDto.endDate) {
        period.endDate = new Date(updatePayrollPeriodDto.endDate);
      }
      if (updatePayrollPeriodDto.payDate) {
        period.payDate = new Date(updatePayrollPeriodDto.payDate);
      }

      const updatedPeriod = await this.payrollPeriodRepository.save(period);
      
      this.logger.log(`Payroll period updated: ${updatedPeriod.periodName}`);
      return updatedPeriod;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update payroll period: ${error.message}`);
      throw new InternalServerErrorException('Failed to update payroll period');
    }
  }

  /**
   * Delete payroll period (only allowed for draft/open status)
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const period = await this.findOne(id);

      // Only allow deletion of draft or open periods
      if (period.status !== PayrollPeriodStatus.DRAFT && period.status !== PayrollPeriodStatus.OPEN) {
        throw new BadRequestException(
          `Cannot delete period with status '${period.status}'. Only 'draft' or 'open' periods can be deleted.`
        );
      }

      await this.payrollPeriodRepository.remove(period);
      
      this.logger.log(`Payroll period deleted: ${period.periodName} (ID: ${id})`);
      return { message: 'Period deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to delete payroll period: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete payroll period');
    }
  }

  /**
   * Close payroll period
   */
  async close(id: string): Promise<PayrollPeriod> {
    try {
      const period = await this.findOne(id);

      if (period.status !== PayrollPeriodStatus.COMPLETED) {
        throw new BadRequestException('Only completed periods can be closed');
      }

      period.status = PayrollPeriodStatus.CLOSED;
      const closedPeriod = await this.payrollPeriodRepository.save(period);
      
      this.logger.log(`Payroll period closed: ${closedPeriod.periodName}`);
      return closedPeriod;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to close payroll period: ${error.message}`);
      throw new InternalServerErrorException('Failed to close payroll period');
    }
  }

  /**
   * Get current (active) payroll period for a country
   */
  async findCurrentByCountry(countryId: string): Promise<PayrollPeriod | null> {
    try {
      const now = new Date();
      return await this.payrollPeriodRepository.findOne({
        where: {
          countryId,
          startDate: Between(new Date(now.getFullYear(), now.getMonth() - 1, 1), now),
          endDate: Between(now, new Date(now.getFullYear(), now.getMonth() + 1, 31)),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch current payroll period: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete payroll period (only if in draft status)
   */
  async remove(id: string): Promise<void> {
    try {
      const period = await this.findOne(id);

      if (period.status !== PayrollPeriodStatus.DRAFT) {
        throw new BadRequestException('Only draft periods can be deleted');
      }

      await this.payrollPeriodRepository.remove(period);
      
      this.logger.log(`Payroll period deleted: ${period.periodName}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to delete payroll period: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete payroll period');
    }
  }
}

