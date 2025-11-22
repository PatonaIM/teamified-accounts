import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollProcessingLog, ProcessingStatus } from '../entities/payroll-processing-log.entity';
import {
  CreatePayrollProcessingLogDto,
  UpdatePayrollProcessingLogDto,
} from '../dto/payroll-processing-log.dto';

@Injectable()
export class PayrollProcessingLogService {
  private readonly logger = new Logger(PayrollProcessingLogService.name);

  constructor(
    @InjectRepository(PayrollProcessingLog)
    private readonly processingLogRepository: Repository<PayrollProcessingLog>,
  ) {}

  /**
   * Create a new processing log
   */
  async create(createProcessingLogDto: CreatePayrollProcessingLogDto): Promise<PayrollProcessingLog> {
    try {
      const log = this.processingLogRepository.create({
        ...createProcessingLogDto,
        startedAt: new Date(createProcessingLogDto.startedAt),
      });
      
      const savedLog = await this.processingLogRepository.save(log);
      
      this.logger.log(`Processing log created for country ${savedLog.countryId}`);
      return savedLog;
    } catch (error) {
      this.logger.error(`Failed to create processing log: ${error.message}`);
      throw new InternalServerErrorException('Failed to create processing log');
    }
  }

  /**
   * Get all processing logs for a country
   */
  async findByCountry(countryId: string, status?: ProcessingStatus): Promise<PayrollProcessingLog[]> {
    try {
      const where: any = { countryId };
      if (status) {
        where.status = status;
      }

      return await this.processingLogRepository.find({
        where,
        order: { startedAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch processing logs: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch processing logs');
    }
  }

  /**
   * Get all processing logs for a payroll period
   */
  async findByPeriod(payrollPeriodId: string): Promise<PayrollProcessingLog[]> {
    try {
      return await this.processingLogRepository.find({
        where: { payrollPeriodId },
        order: { startedAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch processing logs: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch processing logs');
    }
  }

  /**
   * Get processing log by ID
   */
  async findOne(id: string): Promise<PayrollProcessingLog> {
    try {
      const log = await this.processingLogRepository.findOne({
        where: { id },
        relations: ['country', 'payrollPeriod'],
      });

      if (!log) {
        throw new NotFoundException(`Processing log with ID ${id} not found`);
      }

      return log;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch processing log: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch processing log');
    }
  }

  /**
   * Update processing log
   */
  async update(
    id: string,
    updateProcessingLogDto: UpdatePayrollProcessingLogDto,
  ): Promise<PayrollProcessingLog> {
    try {
      const log = await this.findOne(id);

      Object.assign(log, updateProcessingLogDto);
      
      if (updateProcessingLogDto.completedAt) {
        log.completedAt = new Date(updateProcessingLogDto.completedAt);
      }

      const updatedLog = await this.processingLogRepository.save(log);
      
      this.logger.log(`Processing log updated: ${updatedLog.id} - Status: ${updatedLog.status}`);
      return updatedLog;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update processing log: ${error.message}`);
      throw new InternalServerErrorException('Failed to update processing log');
    }
  }

  /**
   * Mark processing as completed
   */
  async markCompleted(id: string, employeesProcessed: number, employeesFailed: number): Promise<PayrollProcessingLog> {
    try {
      const log = await this.findOne(id);

      log.status = ProcessingStatus.COMPLETED;
      log.completedAt = new Date();
      log.employeesProcessed = employeesProcessed;
      log.employeesFailed = employeesFailed;

      const completedLog = await this.processingLogRepository.save(log);
      
      this.logger.log(
        `Processing completed: ${completedLog.employeesProcessed} succeeded, ${completedLog.employeesFailed} failed`,
      );
      return completedLog;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to mark processing as completed: ${error.message}`);
      throw new InternalServerErrorException('Failed to mark processing as completed');
    }
  }

  /**
   * Mark processing as failed
   */
  async markFailed(id: string, errorMessage: string, errorDetails?: any): Promise<PayrollProcessingLog> {
    try {
      const log = await this.findOne(id);

      log.status = ProcessingStatus.FAILED;
      log.completedAt = new Date();
      log.errorMessage = errorMessage;
      log.errorDetails = errorDetails;

      const failedLog = await this.processingLogRepository.save(log);
      
      this.logger.error(`Processing failed: ${failedLog.errorMessage}`);
      return failedLog;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to mark processing as failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to mark processing as failed');
    }
  }

  /**
   * Update processing progress
   */
  async updateProgress(
    id: string,
    employeesProcessed: number,
    employeesFailed: number,
  ): Promise<PayrollProcessingLog> {
    try {
      const log = await this.findOne(id);

      log.status = ProcessingStatus.IN_PROGRESS;
      log.employeesProcessed = employeesProcessed;
      log.employeesFailed = employeesFailed;

      return await this.processingLogRepository.save(log);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update processing progress: ${error.message}`);
      throw new InternalServerErrorException('Failed to update processing progress');
    }
  }

  /**
   * Get latest processing log for a country
   */
  async findLatestByCountry(countryId: string): Promise<PayrollProcessingLog | null> {
    try {
      return await this.processingLogRepository.findOne({
        where: { countryId },
        order: { startedAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch latest processing log: ${error.message}`);
      return null;
    }
  }

  /**
   * Get processing statistics for a country
   */
  async getProcessingStats(countryId: string): Promise<{
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
  }> {
    try {
      const logs = await this.processingLogRepository.find({
        where: { countryId },
      });

      return {
        total: logs.length,
        completed: logs.filter((l) => l.status === ProcessingStatus.COMPLETED).length,
        failed: logs.filter((l) => l.status === ProcessingStatus.FAILED).length,
        inProgress: logs.filter((l) => l.status === ProcessingStatus.IN_PROGRESS).length,
      };
    } catch (error) {
      this.logger.error(`Failed to get processing stats: ${error.message}`);
      throw new InternalServerErrorException('Failed to get processing stats');
    }
  }
}

