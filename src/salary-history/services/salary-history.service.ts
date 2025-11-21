import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, MoreThan } from 'typeorm';
import { SalaryHistory } from '../entities/salary-history.entity';
import { EmploymentRecord } from '../../employment-records/entities/employment-record.entity';
import { CreateSalaryHistoryDto } from '../dto/create-salary-history.dto';
import { SalaryHistoryResponseDto } from '../dto/salary-history-response.dto';
import { SalaryHistorySearchDto } from '../dto/salary-history-search.dto';
import { SalaryReportResponseDto } from '../dto/salary-report-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class SalaryHistoryService {
  private readonly logger = new Logger(SalaryHistoryService.name);

  constructor(
    @InjectRepository(SalaryHistory)
    private readonly salaryHistoryRepository: Repository<SalaryHistory>,
    @InjectRepository(EmploymentRecord)
    private readonly employmentRecordRepository: Repository<EmploymentRecord>,
  ) {}

  /**
   * Create a new salary history record
   * Enforces immutability and validates business rules
   */
  async create(createDto: CreateSalaryHistoryDto, changedBy: string): Promise<SalaryHistoryResponseDto> {
    try {
      this.logger.log(`Creating salary history for employment ${createDto.employmentRecordId}`);

      // Validate employment record exists
      const employmentRecord = await this.employmentRecordRepository.findOne({
        where: { id: createDto.employmentRecordId },
      });

      if (!employmentRecord) {
        throw new NotFoundException(`Employment record with ID ${createDto.employmentRecordId} not found`);
      }

      // Validate future effective date (max 1 year ahead)
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
      const effectiveDate = new Date(createDto.effectiveDate);
      
      if (effectiveDate > maxFutureDate) {
        throw new BadRequestException('Effective date cannot be more than 1 year in the future');
      }

      // Check for existing salary history on the same effective date
      const existingRecord = await this.salaryHistoryRepository.findOne({
        where: {
          employmentRecordId: createDto.employmentRecordId,
          effectiveDate: effectiveDate,
        },
      });

      if (existingRecord) {
        throw new BadRequestException(
          `Salary history already exists for employment ${createDto.employmentRecordId} on ${effectiveDate.toISOString().split('T')[0]}`
        );
      }

      // Create new salary history record
      const salaryHistory = this.salaryHistoryRepository.create({
        employmentRecordId: createDto.employmentRecordId,
        salaryAmount: createDto.salaryAmount,
        salaryCurrency: createDto.salaryCurrency,
        effectiveDate: effectiveDate,
        changeReason: createDto.changeReason,
        changedBy,
      });

      const savedRecord = await this.salaryHistoryRepository.save(salaryHistory);

      // Reload with relations to populate employee information
      const recordWithRelations = await this.salaryHistoryRepository.findOne({
        where: { id: savedRecord.id },
        relations: ['changedByUser', 'employmentRecord', 'employmentRecord.user'],
      });

      this.logger.log(`Salary history created with ID ${savedRecord.id}`);
      return this.mapToResponseDto(recordWithRelations!);

    } catch (error) {
      this.logger.error(`Failed to create salary history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get salary history for a specific employment record
   */
  async findByEmploymentId(employmentId: string): Promise<SalaryHistoryResponseDto[]> {
    try {
      this.logger.log(`Finding salary history for employment ${employmentId}`);

      // Validate employment record exists
      const employmentRecord = await this.employmentRecordRepository.findOne({
        where: { id: employmentId },
      });

      if (!employmentRecord) {
        throw new NotFoundException(`Employment record with ID ${employmentId} not found`);
      }

      const salaryHistory = await this.salaryHistoryRepository.find({
        where: { employmentRecordId: employmentId },
        order: { effectiveDate: 'DESC', createdAt: 'DESC' },
        relations: ['changedByUser', 'employmentRecord', 'employmentRecord.user'],
      });

      return salaryHistory.map(record => this.mapToResponseDto(record));

    } catch (error) {
      this.logger.error(`Failed to find salary history for employment ${employmentId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get salary history for a specific user across all employments
   */
  async findByUserId(userId: string): Promise<SalaryHistoryResponseDto[]> {
    try {
      this.logger.log(`Finding salary history for user ${userId}`);

      // Get all employment records for the user
      const employmentRecords = await this.employmentRecordRepository.find({
        where: { userId },
        select: ['id'],
      });

      if (employmentRecords.length === 0) {
        return [];
      }

      const employmentIds = employmentRecords.map(record => record.id);

      const salaryHistory = await this.salaryHistoryRepository
        .createQueryBuilder('sh')
        .leftJoinAndSelect('sh.changedByUser', 'user')
        .leftJoinAndSelect('sh.employmentRecord', 'employment')
        .leftJoinAndSelect('employment.user', 'employmentUser')
        .where('sh.employmentRecordId IN (:...employmentIds)', { employmentIds })
        .orderBy('sh.effectiveDate', 'DESC')
        .addOrderBy('sh.createdAt', 'DESC')
        .getMany();

      return salaryHistory.map(record => this.mapToResponseDto(record));

    } catch (error) {
      this.logger.error(`Failed to find salary history for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search and filter salary history records with pagination
   */
  async search(searchDto: SalaryHistorySearchDto): Promise<PaginatedResponseDto<SalaryHistoryResponseDto>> {
    try {
      this.logger.log(`Searching salary history with criteria: ${JSON.stringify(searchDto)}`);

      const queryBuilder = this.salaryHistoryRepository
        .createQueryBuilder('sh')
        .leftJoinAndSelect('sh.changedByUser', 'user')
        .leftJoinAndSelect('sh.employmentRecord', 'employment')
        .leftJoinAndSelect('employment.user', 'employmentUser');

      // Apply filters
      if (searchDto.employmentRecordId) {
        queryBuilder.andWhere('sh.employmentRecordId = :employmentId', {
          employmentId: searchDto.employmentRecordId,
        });
      }

      if (searchDto.userId) {
        queryBuilder.andWhere('employment.userId = :userId', {
          userId: searchDto.userId,
        });
      }

      if (searchDto.clientId) {
        queryBuilder.andWhere('employment.clientId = :clientId', {
          clientId: searchDto.clientId,
        });
      }

      if (searchDto.currency) {
        queryBuilder.andWhere('sh.salaryCurrency = :currency', {
          currency: searchDto.currency,
        });
      }

      if (searchDto.minAmount) {
        queryBuilder.andWhere('sh.salaryAmount >= :minAmount', {
          minAmount: searchDto.minAmount,
        });
      }

      if (searchDto.maxAmount) {
        queryBuilder.andWhere('sh.salaryAmount <= :maxAmount', {
          maxAmount: searchDto.maxAmount,
        });
      }

      if (searchDto.startDate && searchDto.endDate) {
        queryBuilder.andWhere('sh.effectiveDate BETWEEN :startDate AND :endDate', {
          startDate: searchDto.startDate,
          endDate: searchDto.endDate,
        });
      } else if (searchDto.startDate) {
        queryBuilder.andWhere('sh.effectiveDate >= :startDate', {
          startDate: searchDto.startDate,
        });
      } else if (searchDto.endDate) {
        queryBuilder.andWhere('sh.effectiveDate <= :endDate', {
          endDate: searchDto.endDate,
        });
      }

      if (searchDto.isScheduled !== undefined) {
        const now = new Date();
        if (searchDto.isScheduled) {
          queryBuilder.andWhere('sh.effectiveDate > :now', { now });
        } else {
          queryBuilder.andWhere('sh.effectiveDate <= :now', { now });
        }
      }

      // Apply sorting with deterministic tie-breaker
      const sortField = searchDto.sortField || 'effectiveDate';
      const sortOrder = searchDto.sortOrder || 'DESC';
      queryBuilder
        .orderBy(`sh.${sortField}`, sortOrder as 'ASC' | 'DESC')
        .addOrderBy('sh.createdAt', 'DESC');

      // Apply pagination with defaults
      const limit = searchDto.limit || 50;
      const offset = searchDto.offset || 0;
      
      queryBuilder.limit(limit);
      queryBuilder.offset(offset);

      // Get results with total count
      const [salaryHistory, totalCount] = await queryBuilder.getManyAndCount();
      
      const items = salaryHistory.map(record => this.mapToResponseDto(record));
      const currentPage = Math.floor(offset / limit);

      return new PaginatedResponseDto(items, totalCount, limit, currentPage);

    } catch (error) {
      this.logger.error(`Failed to search salary history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get salary report for employment record
   */
  async getEmploymentReport(employmentId: string): Promise<SalaryReportResponseDto> {
    try {
      this.logger.log(`Generating salary report for employment ${employmentId}`);

      // Validate employment record exists
      const employmentRecord = await this.employmentRecordRepository.findOne({
        where: { id: employmentId },
        relations: ['user', 'client'],
      });

      if (!employmentRecord) {
        throw new NotFoundException(`Employment record with ID ${employmentId} not found`);
      }

      // Get all salary history for this employment
      const salaryHistory = await this.salaryHistoryRepository.find({
        where: { employmentRecordId: employmentId },
        order: { effectiveDate: 'DESC', createdAt: 'DESC' },
        relations: ['changedByUser', 'employmentRecord', 'employmentRecord.user'],
      });

      if (salaryHistory.length === 0) {
        return {
          employmentId,
          userId: employmentRecord.userId,
          clientId: employmentRecord.clientId,
          currentSalary: null,
          salaryHistory: [],
          statistics: {
            averageSalary: 0,
            totalActiveRecords: 0,
            totalSalaries: 0,
          },
          generatedAt: new Date(),
        };
      }

      // Calculate statistics
      const now = new Date();
      const currentSalary = salaryHistory.find(sh => sh.effectiveDate <= now) || salaryHistory[0];

      // For single employment record, statistics are straightforward
      const currentSalaryAmount = currentSalary?.salaryAmount || 0;
      const hasCurrentSalary = currentSalary !== null && currentSalary.effectiveDate <= now;

      return {
        employmentId,
        userId: employmentRecord.userId,
        clientId: employmentRecord.clientId,
        currentSalary: this.mapToResponseDto(currentSalary),
        salaryHistory: salaryHistory.map(record => this.mapToResponseDto(record)),
        statistics: {
          averageSalary: currentSalaryAmount,
          totalActiveRecords: hasCurrentSalary ? 1 : 0,
          totalSalaries: currentSalaryAmount,
        },
        generatedAt: new Date(),
      };

    } catch (error) {
      this.logger.error(`Failed to generate employment report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get salary report for user across all employments
   */
  async getUserReport(userId: string): Promise<SalaryReportResponseDto> {
    try {
      this.logger.log(`Generating salary report for user ${userId}`);

      // Get ALL employment records for the user (not just active)
      const employmentRecords = await this.employmentRecordRepository.find({
        where: { userId },
        relations: ['client'],
      });

      if (employmentRecords.length === 0) {
        return {
          employmentId: null,
          userId,
          clientId: null,
          currentSalary: null,
          salaryHistory: [],
          statistics: {
            averageSalary: 0,
            totalActiveRecords: 0,
            totalSalaries: 0,
          },
          generatedAt: new Date(),
        };
      }

      const now = new Date();
      const employmentIds = employmentRecords.map(record => record.id);

      // Get all salary history for all employments
      const allSalaryHistory = await this.salaryHistoryRepository
        .createQueryBuilder('sh')
        .leftJoinAndSelect('sh.changedByUser', 'user')
        .leftJoinAndSelect('sh.employmentRecord', 'employment')
        .leftJoinAndSelect('employment.user', 'employmentUser')
        .where('sh.employmentRecordId IN (:...employmentIds)', { employmentIds })
        .orderBy('sh.effectiveDate', 'DESC')
        .addOrderBy('sh.createdAt', 'DESC')
        .getMany();

      // Calculate statistics for all employment records
      const currentSalaries: { employmentId: string; salary: SalaryHistory | null }[] = [];
      
      for (const employmentId of employmentIds) {
        // Get salary history for this employment
        const employmentSalaryHistory = allSalaryHistory
          .filter(sh => sh.employmentRecordId === employmentId)
          .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());

        // Find current salary (most recent salary where effectiveDate <= now)
        const currentSalary = employmentSalaryHistory.find(sh => sh.effectiveDate <= now) || null;
        
        currentSalaries.push({
          employmentId,
          salary: currentSalary,
        });
      }

      // Filter out employments without salary history
      const employmentWithSalaries = currentSalaries.filter(cs => cs.salary !== null);

      // Calculate statistics
      const totalSalaries = employmentWithSalaries.reduce((sum, cs) => sum + cs.salary!.salaryAmount, 0);
      const totalActiveRecords = employmentWithSalaries.length;
      const averageSalary = totalActiveRecords > 0 ? totalSalaries / totalActiveRecords : 0;

      // Get the most recent current salary across all employments for display
      const latestCurrentSalary = employmentWithSalaries
        .map(cs => cs.salary!)
        .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0] || null;

      return {
        employmentId: null,
        userId,
        clientId: null,
        currentSalary: latestCurrentSalary ? this.mapToResponseDto(latestCurrentSalary) : null,
        salaryHistory: allSalaryHistory.map(record => this.mapToResponseDto(record)),
        statistics: {
          averageSalary,
          totalActiveRecords,
          totalSalaries,
        },
        generatedAt: new Date(),
      };

    } catch (error) {
      this.logger.error(`Failed to generate user report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get organization-wide salary report (admin/HR only)
   * Returns statistics across ALL employment records (not just 'active')
   */
  async getOrganizationSummary(): Promise<SalaryReportResponseDto> {
    try {
      this.logger.log('Generating organization-wide salary summary');

      // Get ALL employment records across the organization (not just 'active')
      const allEmploymentRecords = await this.employmentRecordRepository.find({
        relations: ['client', 'user'],
      });

      if (allEmploymentRecords.length === 0) {
        return {
          employmentId: null,
          userId: null,
          clientId: null,
          currentSalary: null,
          salaryHistory: [],
          statistics: {
            averageSalary: 0,
            totalActiveRecords: 0,
            totalSalaries: 0,
          },
          generatedAt: new Date(),
        };
      }

      const now = new Date();
      const allEmploymentIds = allEmploymentRecords.map(record => record.id);

      // Get all salary history for all employments
      const allSalaryHistory = await this.salaryHistoryRepository
        .createQueryBuilder('sh')
        .leftJoinAndSelect('sh.changedByUser', 'user')
        .leftJoinAndSelect('sh.employmentRecord', 'employment')
        .leftJoinAndSelect('employment.user', 'employmentUser')
        .where('sh.employmentRecordId IN (:...employmentIds)', { employmentIds: allEmploymentIds })
        .orderBy('sh.effectiveDate', 'DESC')
        .getMany();

      // Calculate statistics for all employment records
      const currentSalaries: { employmentId: string; salary: SalaryHistory | null }[] = [];
      
      for (const employmentId of allEmploymentIds) {
        // Get salary history for this employment
        const employmentSalaryHistory = allSalaryHistory
          .filter(sh => sh.employmentRecordId === employmentId)
          .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());

        // Find current salary (most recent salary where effectiveDate <= now)
        const currentSalary = employmentSalaryHistory.find(sh => sh.effectiveDate <= now) || null;
        
        currentSalaries.push({
          employmentId,
          salary: currentSalary,
        });
      }

      // Filter out employments without salary history
      const employmentWithSalaries = currentSalaries.filter(cs => cs.salary !== null);

      // Calculate statistics
      const totalSalaries = employmentWithSalaries.reduce((sum, cs) => sum + cs.salary!.salaryAmount, 0);
      const totalActiveRecords = employmentWithSalaries.length;
      const averageSalary = totalActiveRecords > 0 ? totalSalaries / totalActiveRecords : 0;

      // Get the most recent current salary across all employments for display
      const latestCurrentSalary = employmentWithSalaries
        .map(cs => cs.salary!)
        .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0] || null;

      return {
        employmentId: null,
        userId: null,
        clientId: null,
        currentSalary: latestCurrentSalary ? this.mapToResponseDto(latestCurrentSalary) : null,
        salaryHistory: allSalaryHistory.map(record => this.mapToResponseDto(record)),
        statistics: {
          averageSalary,
          totalActiveRecords,
          totalSalaries,
        },
        generatedAt: new Date(),
      };

    } catch (error) {
      this.logger.error(`Failed to generate organization summary: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check if a salary history record exists (for validation)
   */
  async exists(employmentRecordId: string, effectiveDate: Date): Promise<boolean> {
    const count = await this.salaryHistoryRepository.count({
      where: {
        employmentRecordId,
        effectiveDate,
      },
    });
    return count > 0;
  }

  /**
   * Get scheduled salary changes (future effective dates)
   */
  async getScheduledChanges(): Promise<SalaryHistoryResponseDto[]> {
    try {
      const now = new Date();
      const salaryHistory = await this.salaryHistoryRepository.find({
        where: {
          effectiveDate: MoreThan(now),
        },
        order: { effectiveDate: 'ASC' },
        relations: ['changedByUser', 'employmentRecord'],
      });

      return salaryHistory.map(record => this.mapToResponseDto(record));

    } catch (error) {
      this.logger.error(`Failed to get scheduled changes: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(entity: SalaryHistory): SalaryHistoryResponseDto {
    const now = new Date();
    
    // Get employee information from employment record if loaded
    let employeeName: string | null = null;
    let employeeRole: string | null = null;
    let employmentStatus: string | null = null;
    
    if (entity.employmentRecord) {
      employeeRole = entity.employmentRecord.role || null;
      employmentStatus = entity.employmentRecord.status || null;
      
      if (entity.employmentRecord.user) {
        employeeName = `${entity.employmentRecord.user.firstName} ${entity.employmentRecord.user.lastName}`;
      }
    }
    
    return {
      id: entity.id,
      employmentRecordId: entity.employmentRecordId,
      salaryAmount: entity.salaryAmount,
      salaryCurrency: entity.salaryCurrency,
      effectiveDate: entity.effectiveDate,
      changeReason: entity.changeReason,
      changedBy: entity.changedBy,
      changedByName: entity.changedByUser ? 
        `${entity.changedByUser.firstName} ${entity.changedByUser.lastName}` : 
        null,
      employeeName,
      employeeRole,
      employmentStatus,
      isScheduled: entity.effectiveDate > now,
      migratedFromZoho: entity.migratedFromZoho,
      zohoSalaryId: entity.zohoSalaryId,
      createdAt: entity.createdAt,
    };
  }
}
