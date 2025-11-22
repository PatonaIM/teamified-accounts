import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOptionsWhere, Between } from 'typeorm';
import { EmploymentRecord } from '../entities/employment-record.entity';
import { CreateEmploymentRecordDto } from '../dto/create-employment-record.dto';
import { UpdateEmploymentRecordDto } from '../dto/update-employment-record.dto';
import { TerminateEmploymentRecordDto } from '../dto/terminate-employment-record.dto';
import { EmploymentRecordResponseDto } from '../dto/employment-record-response.dto';
import { EmploymentRecordSearchDto } from '../dto/employment-record-search.dto';
import { AuditService } from '../../audit/audit.service';
import { CurrentUserData } from '../../common/decorators/current-user.decorator';
import {
  EmploymentRecordNotFoundException,
  EmploymentRecordConflictException,
  EmploymentRecordValidationException,
  EmploymentRecordStatusTransitionException,
  EmploymentRecordDateValidationException,
  EmploymentRecordOverlapException,
  EmploymentRecordTerminationException
} from '../exceptions/employment-record.exceptions';

@Injectable()
export class EmploymentRecordService {
  private readonly logger = new Logger(EmploymentRecordService.name);

  constructor(
    @InjectRepository(EmploymentRecord)
    private readonly employmentRecordRepository: Repository<EmploymentRecord>,
    private readonly auditService: AuditService,
  ) {}

  async create(createDto: CreateEmploymentRecordDto, currentUser: CurrentUserData): Promise<EmploymentRecordResponseDto> {
    try {
      // Validate user and client exist
      await this.validateUserAndClient(createDto.userId, createDto.clientId);

      // Convert string dates to Date objects
      const startDate = new Date(createDto.startDate);
      const endDate = createDto.endDate ? new Date(createDto.endDate) : null;

      // Check for overlapping active employments
      await this.validateNoOverlappingEmployment(createDto.userId, createDto.clientId, startDate);

      const employmentRecordData = {
        ...createDto,
        startDate,
        endDate
      };

      const employmentRecord = this.employmentRecordRepository.create(employmentRecordData);
      const savedRecord = await this.employmentRecordRepository.save(employmentRecord);
      
      // Log audit trail
      await this.auditService.logEmploymentRecordCreated(
        currentUser.id,
        currentUser.role,
        savedRecord.id,
        {
          userId: createDto.userId,
          clientId: createDto.clientId,
          startDate: createDto.startDate,
          endDate: createDto.endDate,
          role: createDto.role,
          status: createDto.status || 'active'
        }
      );
      
      this.logger.log(`Created employment record ${savedRecord.id} for user ${createDto.userId} with client ${createDto.clientId}`);
      
      return this.mapToResponseDto(savedRecord);
    } catch (error) {
      this.logger.error(`Failed to create employment record: ${error.message}`);
      throw error;
    }
  }

  async findAll(searchDto: EmploymentRecordSearchDto): Promise<{ employmentRecords: EmploymentRecordResponseDto[], pagination: any }> {
    try {
      const { page = 1, limit = 10, search, status, clientId, userId, countryId, sort = 'createdAt', order = 'DESC' } = searchDto;
      
      const queryBuilder = this.employmentRecordRepository.createQueryBuilder('er')
        .leftJoinAndSelect('er.user', 'user')
        .leftJoinAndSelect('er.client', 'client')
        .leftJoinAndSelect('er.country', 'country');

      // Apply filters
      if (search) {
        queryBuilder.andWhere(
          '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR client.name ILIKE :search OR er.role ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (status) {
        queryBuilder.andWhere('er.status = :status', { status });
      }

      if (clientId) {
        queryBuilder.andWhere('er.clientId = :clientId', { clientId });
      }

      if (userId) {
        queryBuilder.andWhere('er.userId = :userId', { userId });
      }

      // Country filter for payroll employee selection (Story 7.8.2)
      // Direct filtering by country_id (now a foreign key on employment_records)
      // Note: Parameter accepts either country UUID or country code
      if (countryId) {
        // Check if countryId is a UUID or a country code
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(countryId);
        
        if (isUUID) {
          // Direct UUID filtering (most performant)
          queryBuilder.andWhere('er.countryId = :countryId', { countryId });
          this.logger.log(`Filtering employment records by country UUID: ${countryId}`);
        } else {
          // Country code provided - need to resolve to UUID via join
          queryBuilder
            .leftJoin('er.country', 'country')
            .andWhere('country.code = :countryCode', { countryCode: countryId });
          this.logger.log(`Filtering employment records by country code: ${countryId}`);
        }
      }

      // Apply sorting
      const validSortFields = ['createdAt', 'updatedAt', 'startDate', 'endDate', 'status', 'role'];
      const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
      queryBuilder.orderBy(`er.${sortField}`, order.toUpperCase() as 'ASC' | 'DESC');

      // Apply pagination
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const [employmentRecords, total] = await queryBuilder.getManyAndCount();
      
      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;
      
      return {
        employmentRecords: employmentRecords.map(record => this.mapToResponseDto(record)),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext,
          hasPrev
        }
      };
    } catch (error) {
      this.logger.error(`Failed to find employment records: ${error.message}`);
      throw new BadRequestException('Failed to retrieve employment records');
    }
  }

  async findOne(id: string): Promise<EmploymentRecordResponseDto> {
    try {
      const employmentRecord = await this.employmentRecordRepository.findOne({
        where: { id },
        relations: ['user', 'client', 'country']
      });

      if (!employmentRecord) {
        throw new EmploymentRecordNotFoundException(id);
      }

      return this.mapToResponseDto(employmentRecord);
    } catch (error) {
      this.logger.error(`Failed to find employment record ${id}: ${error.message}`);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<EmploymentRecordResponseDto[]> {
    try {
      const employmentRecords = await this.employmentRecordRepository.find({
        where: { userId },
        relations: ['user', 'client', 'country'],
        order: { startDate: 'DESC' }
      });

      return employmentRecords.map(record => this.mapToResponseDto(record));
    } catch (error) {
      this.logger.error(`Failed to find employment records for user ${userId}: ${error.message}`);
      throw new BadRequestException('Failed to retrieve user employment records');
    }
  }

  async findByClientId(clientId: string): Promise<EmploymentRecordResponseDto[]> {
    try {
      const employmentRecords = await this.employmentRecordRepository.find({
        where: { clientId },
        relations: ['user', 'client', 'country'],
        order: { startDate: 'DESC' }
      });

      return employmentRecords.map(record => this.mapToResponseDto(record));
    } catch (error) {
      this.logger.error(`Failed to find employment records for client ${clientId}: ${error.message}`);
      throw new BadRequestException('Failed to retrieve client employment records');
    }
  }

  async update(id: string, updateDto: UpdateEmploymentRecordDto, currentUser: CurrentUserData): Promise<EmploymentRecordResponseDto> {
    try {
      const employmentRecord = await this.employmentRecordRepository.findOne({
        where: { id },
        relations: ['user', 'client', 'country']
      });

      if (!employmentRecord) {
        throw new EmploymentRecordNotFoundException(id);
      }

      // Validate status transitions
      if (updateDto.status && updateDto.status !== employmentRecord.status) {
        this.validateStatusTransition(employmentRecord.status, updateDto.status);
      }

      // Validate dates
      if (updateDto.startDate || updateDto.endDate) {
        const startDate = updateDto.startDate ? new Date(updateDto.startDate) : employmentRecord.startDate;
        const endDate = updateDto.endDate ? new Date(updateDto.endDate) : employmentRecord.endDate;
        
        if (endDate && endDate < startDate) {
          throw new EmploymentRecordDateValidationException('End date cannot be before start date');
        }
      }

      // Convert string dates to Date objects if provided
      const updateData: any = { ...updateDto };
      if (updateDto.startDate) {
        updateData.startDate = new Date(updateDto.startDate);
      }
      if (updateDto.endDate) {
        updateData.endDate = new Date(updateDto.endDate);
      }

      const originalData = { ...employmentRecord };
      Object.assign(employmentRecord, updateData);
      const savedRecord = await this.employmentRecordRepository.save(employmentRecord);
      
      // Log audit trail
      await this.auditService.logEmploymentRecordUpdated(
        currentUser.id,
        currentUser.role,
        id,
        {
          original: {
            startDate: originalData.startDate,
            endDate: originalData.endDate,
            role: originalData.role,
            status: originalData.status
          },
          updated: {
            startDate: updateDto.startDate,
            endDate: updateDto.endDate,
            role: updateDto.role,
            status: updateDto.status
          }
        }
      );
      
      this.logger.log(`Updated employment record ${id}`);
      
      return this.mapToResponseDto(savedRecord);
    } catch (error) {
      this.logger.error(`Failed to update employment record ${id}: ${error.message}`);
      throw error;
    }
  }

  async terminate(id: string, terminateDto: TerminateEmploymentRecordDto, currentUser: CurrentUserData): Promise<EmploymentRecordResponseDto> {
    try {
      const employmentRecord = await this.employmentRecordRepository.findOne({
        where: { id },
        relations: ['user', 'client', 'country']
      });

      if (!employmentRecord) {
        throw new EmploymentRecordNotFoundException(id);
      }

      if (employmentRecord.status === 'terminated') {
        throw new EmploymentRecordTerminationException('Employment record is already terminated');
      }

      if (employmentRecord.status === 'completed') {
        throw new EmploymentRecordTerminationException('Employment record is already completed');
      }

      // Validate end date
      const endDate = terminateDto.endDate ? new Date(terminateDto.endDate) : new Date();
      if (endDate < employmentRecord.startDate) {
        throw new EmploymentRecordDateValidationException('End date cannot be before start date');
      }

      employmentRecord.endDate = endDate;
      employmentRecord.status = 'terminated';
      
      const savedRecord = await this.employmentRecordRepository.save(employmentRecord);
      
      // Log audit trail
      await this.auditService.logEmploymentRecordTerminated(
        currentUser.id,
        currentUser.role,
        id,
        {
          endDate: terminateDto.endDate || new Date().toISOString(),
          reason: terminateDto.reason,
          previousStatus: 'active'
        }
      );
      
      this.logger.log(`Terminated employment record ${id}`);
      
      return this.mapToResponseDto(savedRecord);
    } catch (error) {
      this.logger.error(`Failed to terminate employment record ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string, currentUser: CurrentUserData): Promise<void> {
    try {
      // Get the record before deletion for audit logging
      const employmentRecord = await this.employmentRecordRepository.findOne({
        where: { id },
        relations: ['user', 'client', 'country']
      });

      if (!employmentRecord) {
        throw new EmploymentRecordNotFoundException(id);
      }

      const result = await this.employmentRecordRepository.delete(id);
      
      // Log audit trail
      await this.auditService.logEmploymentRecordDeleted(
        currentUser.id,
        currentUser.role,
        id,
        {
          userId: employmentRecord.userId,
          clientId: employmentRecord.clientId,
          role: employmentRecord.role,
          status: employmentRecord.status,
          startDate: employmentRecord.startDate,
          endDate: employmentRecord.endDate
        }
      );
      
      this.logger.log(`Deleted employment record ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete employment record ${id}: ${error.message}`);
      throw error;
    }
  }

  private async validateUserAndClient(userId: string, clientId: string): Promise<void> {
    // This would typically check if user and client exist
    // For now, we'll assume they exist since we have foreign key constraints
    // In a real implementation, you might want to inject UserService and ClientService
  }

  private async validateNoOverlappingEmployment(userId: string, clientId: string, startDate: Date): Promise<void> {
    const existingRecord = await this.employmentRecordRepository.findOne({
      where: {
        userId,
        clientId,
        status: 'active'
      }
    });

    if (existingRecord) {
      throw new EmploymentRecordOverlapException(userId, clientId);
    }
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: { [key: string]: string[] } = {
      'active': ['inactive', 'terminated', 'completed'],
      'inactive': ['active', 'terminated'],
      'terminated': [], // Cannot transition from terminated
      'completed': [] // Cannot transition from completed
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new EmploymentRecordStatusTransitionException(currentStatus, newStatus);
    }
  }

  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    terminated: number;
    completed: number;
    recentHires: number;
    recentTerminations: number;
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        total,
        active,
        inactive,
        terminated,
        completed,
        recentHires,
        recentTerminations
      ] = await Promise.all([
        this.employmentRecordRepository.count(),
        this.employmentRecordRepository.count({ where: { status: 'active' } }),
        this.employmentRecordRepository.count({ where: { status: 'inactive' } }),
        this.employmentRecordRepository.count({ where: { status: 'terminated' } }),
        this.employmentRecordRepository.count({ where: { status: 'completed' } }),
        this.employmentRecordRepository.count({ 
          where: { 
            status: 'active',
            startDate: Between(thirtyDaysAgo, new Date())
          } 
        }),
        this.employmentRecordRepository.count({ 
          where: { 
            status: 'terminated',
            endDate: Between(thirtyDaysAgo, new Date())
          } 
        })
      ]);

      return {
        total,
        active,
        inactive,
        terminated,
        completed,
        recentHires,
        recentTerminations
      };
    } catch (error) {
      this.logger.error('Failed to get employment statistics', error);
      throw new BadRequestException('Failed to retrieve employment statistics');
    }
  }

  private mapToResponseDto(employmentRecord: EmploymentRecord): EmploymentRecordResponseDto {
    return {
      id: employmentRecord.id,
      userId: employmentRecord.userId,
      clientId: employmentRecord.clientId,
      countryId: employmentRecord.countryId,
      startDate: employmentRecord.startDate,
      endDate: employmentRecord.endDate,
      role: employmentRecord.role,
      status: employmentRecord.status,
      migratedFromZoho: employmentRecord.migratedFromZoho,
      zohoEmploymentId: employmentRecord.zohoEmploymentId,
      onboardingSubmittedAt: employmentRecord.onboardingSubmittedAt,
      createdAt: employmentRecord.createdAt,
      updatedAt: employmentRecord.updatedAt,
      user: employmentRecord.user ? {
        id: employmentRecord.user.id,
        email: employmentRecord.user.email,
        firstName: employmentRecord.user.firstName,
        lastName: employmentRecord.user.lastName
      } : undefined,
      client: employmentRecord.client ? {
        id: employmentRecord.client.id,
        name: employmentRecord.client.name,
        status: employmentRecord.client.status
      } : undefined,
      country: employmentRecord.country ? {
        id: employmentRecord.country.id,
        code: employmentRecord.country.code,
        name: employmentRecord.country.name
      } : undefined
    };
  }
}
