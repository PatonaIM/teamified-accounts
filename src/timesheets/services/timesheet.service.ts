import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, IsNull, Not } from 'typeorm';
import { Timesheet, TimesheetStatus, TimesheetType } from '../entities/timesheet.entity';
import { TimesheetApproval, ApprovalAction } from '../entities/timesheet-approval.entity';
import {
  CreateTimesheetDto,
  UpdateTimesheetDto,
  TimesheetResponseDto,
  TimesheetListResponseDto,
  BulkOperationResultDto,
} from '../dto/timesheet.dto';

@Injectable()
export class TimesheetService {
  private readonly logger = new Logger(TimesheetService.name);

  constructor(
    @InjectRepository(Timesheet)
    private readonly timesheetRepository: Repository<Timesheet>,
    @InjectRepository(TimesheetApproval)
    private readonly approvalRepository: Repository<TimesheetApproval>,
  ) {}

  /**
   * Validate client access for hr_manager_client role
   * Ensures the timesheet belongs to an employee who works/worked for the manager's client
   */
  async validateClientAccess(timesheetId: string, managerClientId: string): Promise<void> {
    const timesheet = await this.timesheetRepository
      .createQueryBuilder('timesheet')
      .innerJoin('timesheet.user', 'user')
      .innerJoin('employment_records', 'er', 'er.user_id = user.id')
      .where('timesheet.id = :timesheetId', { timesheetId })
      .andWhere('er.client_id = :clientId', { clientId: managerClientId })
      .getOne();

    if (!timesheet) {
      this.logger.warn(
        `Client access denied: Timesheet ${timesheetId} not associated with client ${managerClientId}`,
      );
      throw new ForbiddenException('Access denied: timesheet not associated with your client');
    }

    this.logger.log(`Client access validated for timesheet ${timesheetId} by client ${managerClientId}`);
  }

  /**
   * Create a new timesheet
   */
  async create(createTimesheetDto: CreateTimesheetDto): Promise<TimesheetResponseDto> {
    try {
      // Handle weekly vs daily timesheet validation and calculation
      if (createTimesheetDto.timesheetType === TimesheetType.WEEKLY) {
        return this.createWeeklyTimesheet(createTimesheetDto);
      } else {
        return this.createDailyTimesheet(createTimesheetDto);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create timesheet: ${error.message}`);
      throw new InternalServerErrorException('Failed to create timesheet');
    }
  }

  /**
   * Create a daily timesheet
   */
  private async createDailyTimesheet(createTimesheetDto: CreateTimesheetDto): Promise<TimesheetResponseDto> {
    // Calculate total hours
    const totalHours = 
      createTimesheetDto.regularHours +
      (createTimesheetDto.overtimeHours || 0) +
      (createTimesheetDto.doubleOvertimeHours || 0) +
      (createTimesheetDto.nightShiftHours || 0);

    // Validate total hours for daily timesheet
    if (totalHours > 24) {
      throw new BadRequestException('Total hours cannot exceed 24 hours per day');
    }

    // Convert date string to Date object
    const workDate = new Date(createTimesheetDto.workDate);

    const timesheet = this.timesheetRepository.create({
      ...createTimesheetDto,
      workDate,
      totalHours,
      overtimeHours: createTimesheetDto.overtimeHours || 0,
      doubleOvertimeHours: createTimesheetDto.doubleOvertimeHours || 0,
      nightShiftHours: createTimesheetDto.nightShiftHours || 0,
      status: createTimesheetDto.status || TimesheetStatus.DRAFT,
    });

    const savedTimesheet = await this.timesheetRepository.save(timesheet);
    
    this.logger.log(`Daily timesheet created: ${savedTimesheet.id} for user ${savedTimesheet.userId}`);
    return this.mapToResponseDto(savedTimesheet);
  }

  /**
   * Create a weekly timesheet with per-day breakdown
   */
  private async createWeeklyTimesheet(createTimesheetDto: CreateTimesheetDto): Promise<TimesheetResponseDto> {
    // Validate week start and end dates
    if (!createTimesheetDto.weekStartDate || !createTimesheetDto.weekEndDate) {
      throw new BadRequestException('Week start and end dates are required for weekly timesheets');
    }

    const weekStartDate = new Date(createTimesheetDto.weekStartDate);
    const weekEndDate = new Date(createTimesheetDto.weekEndDate);
    
    // Validate that dates span exactly 7 days
    const daysDiff = Math.floor((weekEndDate.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff !== 6) {
      throw new BadRequestException('Weekly timesheet must span exactly 7 days (week start to week end)');
    }

    // Validate weekly hours breakdown
    if (!createTimesheetDto.weeklyHoursBreakdown) {
      throw new BadRequestException('Weekly hours breakdown is required for weekly timesheets');
    }

    // Calculate totals from weekly breakdown
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    let totalDoubleOvertimeHours = 0;
    let totalNightShiftHours = 0;

    days.forEach((day) => {
      const dayData = createTimesheetDto.weeklyHoursBreakdown[day];
      if (dayData) {
        // Validate per-day hours don't exceed 24
        const dayTotal = dayData.regularHours + dayData.overtimeHours + dayData.doubleOvertimeHours + dayData.nightShiftHours;
        if (dayTotal > 24) {
          throw new BadRequestException(`Total hours for ${day} cannot exceed 24 hours`);
        }

        totalRegularHours += dayData.regularHours;
        totalOvertimeHours += dayData.overtimeHours;
        totalDoubleOvertimeHours += dayData.doubleOvertimeHours;
        totalNightShiftHours += dayData.nightShiftHours;
      }
    });

    const totalHours = totalRegularHours + totalOvertimeHours + totalDoubleOvertimeHours + totalNightShiftHours;

    // Create timesheet with aggregated totals
    const timesheet = this.timesheetRepository.create({
      userId: createTimesheetDto.userId,
      employmentRecordId: createTimesheetDto.employmentRecordId,
      payrollPeriodId: createTimesheetDto.payrollPeriodId,
      timesheetType: TimesheetType.WEEKLY,
      workDate: weekStartDate, // Use week start date as the primary work date
      weekStartDate,
      weekEndDate,
      weeklyHoursBreakdown: createTimesheetDto.weeklyHoursBreakdown,
      regularHours: totalRegularHours,
      overtimeHours: totalOvertimeHours,
      doubleOvertimeHours: totalDoubleOvertimeHours,
      nightShiftHours: totalNightShiftHours,
      totalHours,
      notes: createTimesheetDto.notes,
      status: createTimesheetDto.status || TimesheetStatus.DRAFT,
    });

    const savedTimesheet = await this.timesheetRepository.save(timesheet);
    
    this.logger.log(`Weekly timesheet created: ${savedTimesheet.id} for user ${savedTimesheet.userId} (${weekStartDate.toISOString().split('T')[0]} to ${weekEndDate.toISOString().split('T')[0]})`);
    return this.mapToResponseDto(savedTimesheet);
  }

  /**
   * Update a weekly timesheet with per-day breakdown
   */
  private async updateWeeklyTimesheet(timesheet: Timesheet, updateTimesheetDto: UpdateTimesheetDto): Promise<TimesheetResponseDto> {
    // Validate week dates if provided
    if (updateTimesheetDto.weekStartDate && updateTimesheetDto.weekEndDate) {
      const weekStartDate = new Date(updateTimesheetDto.weekStartDate);
      const weekEndDate = new Date(updateTimesheetDto.weekEndDate);
      
      const daysDiff = Math.floor((weekEndDate.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff !== 6) {
        throw new BadRequestException('Weekly timesheet must span exactly 7 days (week start to week end)');
      }
      
      timesheet.weekStartDate = weekStartDate;
      timesheet.weekEndDate = weekEndDate;
      timesheet.workDate = weekStartDate;
    }

    // Update weekly hours breakdown if provided
    if (updateTimesheetDto.weeklyHoursBreakdown) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      let totalRegularHours = 0;
      let totalOvertimeHours = 0;
      let totalDoubleOvertimeHours = 0;
      let totalNightShiftHours = 0;

      days.forEach((day) => {
        const dayData = updateTimesheetDto.weeklyHoursBreakdown[day];
        if (dayData) {
          // Validate per-day hours don't exceed 24
          const dayTotal = dayData.regularHours + dayData.overtimeHours + dayData.doubleOvertimeHours + dayData.nightShiftHours;
          if (dayTotal > 24) {
            throw new BadRequestException(`Total hours for ${day} cannot exceed 24 hours`);
          }

          totalRegularHours += dayData.regularHours;
          totalOvertimeHours += dayData.overtimeHours;
          totalDoubleOvertimeHours += dayData.doubleOvertimeHours;
          totalNightShiftHours += dayData.nightShiftHours;
        }
      });

      const totalHours = totalRegularHours + totalOvertimeHours + totalDoubleOvertimeHours + totalNightShiftHours;

      // Update timesheet with new breakdown and totals
      timesheet.weeklyHoursBreakdown = updateTimesheetDto.weeklyHoursBreakdown;
      timesheet.regularHours = totalRegularHours;
      timesheet.overtimeHours = totalOvertimeHours;
      timesheet.doubleOvertimeHours = totalDoubleOvertimeHours;
      timesheet.nightShiftHours = totalNightShiftHours;
      timesheet.totalHours = totalHours;
    }

    // Update notes if provided
    if (updateTimesheetDto.notes !== undefined) {
      timesheet.notes = updateTimesheetDto.notes;
    }

    const updatedTimesheet = await this.timesheetRepository.save(timesheet);
    
    this.logger.log(`Weekly timesheet updated: ${updatedTimesheet.id}`);
    return this.mapToResponseDto(updatedTimesheet);
  }

  /**
   * Find timesheet by ID
   */
  async findOne(id: string, includeRelations = true): Promise<TimesheetResponseDto> {
    try {
      const relations = includeRelations ? ['user', 'employmentRecord', 'approvals'] : [];
      const timesheet = await this.timesheetRepository.findOne({
        where: { id },
        relations,
      });

      if (!timesheet) {
        throw new NotFoundException(`Timesheet with ID ${id} not found`);
      }

      return this.mapToResponseDto(timesheet);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch timesheet: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch timesheet');
    }
  }

  /**
   * Find timesheets with filtering and pagination
   */
  async findAll(filters: {
    userId?: string;
    employmentRecordId?: string;
    payrollPeriodId?: string;
    status?: TimesheetStatus;
    startDate?: string;
    endDate?: string;
    clientId?: string;
    page?: number;
    limit?: number;
  }): Promise<TimesheetListResponseDto> {
    try {
      const { page = 1, limit = 50, startDate, endDate, clientId, ...otherFilters } = filters;
      const skip = (page - 1) * limit;

      const where: any = { ...otherFilters };

      // Add date range filtering
      if (startDate && endDate) {
        where.workDate = Between(new Date(startDate), new Date(endDate));
      } else if (startDate) {
        where.workDate = new Date(startDate);
      }

      // Client-scoping: Filter timesheets by joining through employment_records
      let queryBuilder = this.timesheetRepository.createQueryBuilder('timesheet')
        .leftJoinAndSelect('timesheet.user', 'user')
        .leftJoinAndSelect('timesheet.employmentRecord', 'employmentRecord')
        .leftJoinAndSelect('timesheet.approvals', 'approvals');

      // Apply basic where conditions
      Object.keys(where).forEach(key => {
        queryBuilder = queryBuilder.andWhere(`timesheet.${key} = :${key}`, { [key]: where[key] });
      });

      // Client-scoping filter: join to employment_records and filter by client_id
      if (clientId) {
        queryBuilder = queryBuilder
          .innerJoin('timesheet.user', 'u')
          .innerJoin('employment_records', 'er', 'er.user_id = u.id')
          .andWhere('er.client_id = :clientId', { clientId });
      }

      queryBuilder = queryBuilder
        .orderBy('timesheet.workDate', 'DESC')
        .addOrderBy('timesheet.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      const [timesheets, total] = await queryBuilder.getManyAndCount();

      return {
        timesheets: timesheets.map(t => this.mapToResponseDto(t)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch timesheets: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch timesheets');
    }
  }

  /**
   * Update timesheet
   */
  async update(id: string, updateTimesheetDto: UpdateTimesheetDto): Promise<TimesheetResponseDto> {
    try {
      const timesheet = await this.timesheetRepository.findOne({ where: { id } });

      if (!timesheet) {
        throw new NotFoundException(`Timesheet with ID ${id} not found`);
      }

      // Prevent updates to approved/rejected timesheets
      if (timesheet.status === TimesheetStatus.APPROVED || 
          timesheet.status === TimesheetStatus.REJECTED) {
        throw new BadRequestException(
          `Cannot update timesheet with status: ${timesheet.status}`
        );
      }

      // Handle weekly timesheet updates
      if (timesheet.timesheetType === TimesheetType.WEEKLY && updateTimesheetDto.weeklyHoursBreakdown) {
        return this.updateWeeklyTimesheet(timesheet, updateTimesheetDto);
      }

      // Handle daily timesheet updates
      // Calculate total hours if hour fields are updated
      const updatedHours = {
        regularHours: updateTimesheetDto.regularHours ?? timesheet.regularHours,
        overtimeHours: updateTimesheetDto.overtimeHours ?? timesheet.overtimeHours,
        doubleOvertimeHours: updateTimesheetDto.doubleOvertimeHours ?? timesheet.doubleOvertimeHours,
        nightShiftHours: updateTimesheetDto.nightShiftHours ?? timesheet.nightShiftHours,
      };

      const totalHours = Object.values(updatedHours).reduce((sum, hours) => sum + hours, 0);

      if (totalHours > 24) {
        throw new BadRequestException('Total hours cannot exceed 24 hours per day');
      }

      // Convert date strings to Date objects if provided
      const updates: any = { ...updateTimesheetDto, totalHours };
      if (updateTimesheetDto.workDate) {
        updates.workDate = new Date(updateTimesheetDto.workDate);
      }
      if (updateTimesheetDto.weekStartDate) {
        updates.weekStartDate = new Date(updateTimesheetDto.weekStartDate);
      }
      if (updateTimesheetDto.weekEndDate) {
        updates.weekEndDate = new Date(updateTimesheetDto.weekEndDate);
      }

      Object.assign(timesheet, updates);
      const updatedTimesheet = await this.timesheetRepository.save(timesheet);

      this.logger.log(`Timesheet updated: ${id}`);
      return this.mapToResponseDto(updatedTimesheet);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update timesheet: ${error.message}`);
      throw new InternalServerErrorException('Failed to update timesheet');
    }
  }

  /**
   * Delete timesheet (only drafts)
   */
  async remove(id: string): Promise<void> {
    try {
      const timesheet = await this.timesheetRepository.findOne({ where: { id } });

      if (!timesheet) {
        throw new NotFoundException(`Timesheet with ID ${id} not found`);
      }

      // Only allow deleting draft and submitted timesheets
      // Approved and rejected timesheets are locked and cannot be deleted
      if (timesheet.status === TimesheetStatus.APPROVED || 
          timesheet.status === TimesheetStatus.REJECTED) {
        throw new BadRequestException(
          'Cannot delete approved or rejected timesheets. Only draft and submitted timesheets can be deleted.'
        );
      }

      await this.timesheetRepository.remove(timesheet);
      this.logger.log(`Timesheet deleted: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to delete timesheet: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete timesheet');
    }
  }

  /**
   * Submit timesheets
   */
  async submitTimesheets(timesheetIds: string[], userId: string, notes?: string): Promise<BulkOperationResultDto> {
    const result: BulkOperationResultDto = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const timesheetId of timesheetIds) {
      try {
        const timesheet = await this.timesheetRepository.findOne({ 
          where: { id: timesheetId } 
        });

        if (!timesheet) {
          result.failed++;
          result.errors.push({ 
            timesheetId, 
            error: 'Timesheet not found' 
          });
          continue;
        }

        // Verify ownership
        if (timesheet.userId !== userId) {
          result.failed++;
          result.errors.push({ 
            timesheetId, 
            error: 'Unauthorized - not your timesheet' 
          });
          continue;
        }

        // Only draft timesheets can be submitted
        if (timesheet.status !== TimesheetStatus.DRAFT) {
          result.failed++;
          result.errors.push({ 
            timesheetId, 
            error: `Cannot submit timesheet with status: ${timesheet.status}` 
          });
          continue;
        }

        // Update status
        timesheet.status = TimesheetStatus.SUBMITTED;
        timesheet.submittedAt = new Date();
        if (notes) {
          timesheet.notes = notes;
        }

        await this.timesheetRepository.save(timesheet);

        // Create approval record
        await this.createApprovalRecord(
          timesheetId,
          null,
          ApprovalAction.SUBMITTED,
          TimesheetStatus.DRAFT,
          TimesheetStatus.SUBMITTED,
          notes
        );

        result.success++;
        this.logger.log(`Timesheet submitted: ${timesheetId}`);
      } catch (error) {
        result.failed++;
        result.errors.push({ 
          timesheetId, 
          error: error.message 
        });
        this.logger.error(`Failed to submit timesheet ${timesheetId}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Approve timesheet
   */
  async approveTimesheet(
    id: string,
    reviewerId: string,
    comments?: string,
  ): Promise<TimesheetResponseDto> {
    try {
      const timesheet = await this.timesheetRepository.findOne({ where: { id } });

      if (!timesheet) {
        throw new NotFoundException(`Timesheet with ID ${id} not found`);
      }

      if (timesheet.status !== TimesheetStatus.SUBMITTED) {
        throw new BadRequestException(
          `Cannot approve timesheet with status: ${timesheet.status}. Only submitted timesheets can be approved.`
        );
      }

      // Update timesheet
      timesheet.status = TimesheetStatus.APPROVED;
      timesheet.approvedAt = new Date();
      timesheet.approvedById = reviewerId;

      const updatedTimesheet = await this.timesheetRepository.save(timesheet);

      // Create approval record
      await this.createApprovalRecord(
        id,
        reviewerId,
        ApprovalAction.APPROVED,
        TimesheetStatus.SUBMITTED,
        TimesheetStatus.APPROVED,
        comments
      );

      this.logger.log(`Timesheet approved: ${id} by ${reviewerId}`);
      return this.mapToResponseDto(updatedTimesheet);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to approve timesheet: ${error.message}`);
      throw new InternalServerErrorException('Failed to approve timesheet');
    }
  }

  /**
   * Reject timesheet
   */
  async rejectTimesheet(
    id: string,
    reviewerId: string,
    reason: string,
    comments?: string,
  ): Promise<TimesheetResponseDto> {
    try {
      const timesheet = await this.timesheetRepository.findOne({ where: { id } });

      if (!timesheet) {
        throw new NotFoundException(`Timesheet with ID ${id} not found`);
      }

      if (timesheet.status !== TimesheetStatus.SUBMITTED) {
        throw new BadRequestException(
          `Cannot reject timesheet with status: ${timesheet.status}. Only submitted timesheets can be rejected.`
        );
      }

      // Update timesheet
      timesheet.status = TimesheetStatus.REJECTED;
      timesheet.rejectedAt = new Date();
      timesheet.rejectedById = reviewerId;
      timesheet.rejectionReason = reason;

      const updatedTimesheet = await this.timesheetRepository.save(timesheet);

      // Create approval record
      await this.createApprovalRecord(
        id,
        reviewerId,
        ApprovalAction.REJECTED,
        TimesheetStatus.SUBMITTED,
        TimesheetStatus.REJECTED,
        comments || reason
      );

      this.logger.log(`Timesheet rejected: ${id} by ${reviewerId}`);
      return this.mapToResponseDto(updatedTimesheet);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to reject timesheet: ${error.message}`);
      throw new InternalServerErrorException('Failed to reject timesheet');
    }
  }

  /**
   * Bulk approve timesheets
   */
  async bulkApproveTimesheets(
    timesheetIds: string[],
    reviewerId: string,
    comments?: string,
  ): Promise<BulkOperationResultDto> {
    const result: BulkOperationResultDto = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const timesheetId of timesheetIds) {
      try {
        await this.approveTimesheet(timesheetId, reviewerId, comments);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({ 
          timesheetId, 
          error: error.message 
        });
        this.logger.error(`Failed to approve timesheet ${timesheetId}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Get timesheets ready for payroll processing
   */
  async getPayrollReadyTimesheets(payrollPeriodId?: string): Promise<TimesheetResponseDto[]> {
    try {
      const where: any = { 
        status: TimesheetStatus.APPROVED,
        payrollProcessed: false,
      };

      if (payrollPeriodId) {
        where.payrollPeriodId = payrollPeriodId;
      }

      const timesheets = await this.timesheetRepository.find({
        where,
        relations: ['user', 'employmentRecord'],
        order: { workDate: 'ASC' },
      });

      return timesheets.map(t => this.mapToResponseDto(t));
    } catch (error) {
      this.logger.error(`Failed to fetch payroll-ready timesheets: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch payroll-ready timesheets');
    }
  }

  /**
   * Mark timesheets as processed for payroll
   */
  async markAsPayrollProcessed(timesheetIds: string[]): Promise<void> {
    try {
      await this.timesheetRepository.update(
        { id: In(timesheetIds) },
        { 
          payrollProcessed: true,
          payrollProcessedAt: new Date(),
        }
      );

      this.logger.log(`Marked ${timesheetIds.length} timesheets as payroll processed`);
    } catch (error) {
      this.logger.error(`Failed to mark timesheets as processed: ${error.message}`);
      throw new InternalServerErrorException('Failed to mark timesheets as processed');
    }
  }

  /**
   * Create approval record
   */
  private async createApprovalRecord(
    timesheetId: string,
    reviewerId: string | null,
    action: ApprovalAction,
    previousStatus: string,
    newStatus: string,
    comments?: string,
  ): Promise<void> {
    const approval = this.approvalRepository.create({
      timesheetId,
      reviewerId,
      action,
      actionDate: new Date(),
      comments,
      previousStatus,
      newStatus,
    });

    await this.approvalRepository.save(approval);
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(timesheet: Timesheet): TimesheetResponseDto {
    // Helper to convert date to ISO string (handles both Date objects and string dates)
    const toDateString = (date: Date | string | null): string | null => {
      if (!date) return null;
      if (typeof date === 'string') return date.split('T')[0];
      return date.toISOString().split('T')[0];
    };

    return {
      id: timesheet.id,
      userId: timesheet.userId,
      employmentRecordId: timesheet.employmentRecordId,
      payrollPeriodId: timesheet.payrollPeriodId,
      timesheetType: timesheet.timesheetType,
      workDate: toDateString(timesheet.workDate) as string,
      weekStartDate: toDateString(timesheet.weekStartDate),
      weekEndDate: toDateString(timesheet.weekEndDate),
      weeklyHoursBreakdown: timesheet.weeklyHoursBreakdown,
      regularHours: Number(timesheet.regularHours),
      overtimeHours: Number(timesheet.overtimeHours),
      doubleOvertimeHours: Number(timesheet.doubleOvertimeHours),
      nightShiftHours: Number(timesheet.nightShiftHours),
      totalHours: Number(timesheet.totalHours),
      status: timesheet.status,
      notes: timesheet.notes,
      submittedAt: timesheet.submittedAt,
      approvedAt: timesheet.approvedAt,
      approvedById: timesheet.approvedById,
      rejectedAt: timesheet.rejectedAt,
      rejectedById: timesheet.rejectedById,
      rejectionReason: timesheet.rejectionReason,
      payrollProcessed: timesheet.payrollProcessed,
      payrollProcessedAt: timesheet.payrollProcessedAt,
      calculationMetadata: timesheet.calculationMetadata,
      createdAt: timesheet.createdAt,
      updatedAt: timesheet.updatedAt,
      user: timesheet.user,
      employmentRecord: timesheet.employmentRecord,
      approvals: timesheet.approvals,
    };
  }
}

