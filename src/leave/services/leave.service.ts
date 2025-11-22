import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { LeaveRequest, LeaveRequestStatus } from '../entities/leave-request.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  LeaveRequestQueryDto,
} from '../dto/leave.dto';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepository: Repository<LeaveBalance>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Validate client access for hr_manager_client role
   * Ensures the leave request belongs to an employee who works/worked for the manager's client
   */
  async validateClientAccess(leaveRequestId: string, managerClientId: string): Promise<void> {
    const leaveRequest = await this.leaveRequestRepository
      .createQueryBuilder('leave')
      .innerJoin('leave.user', 'user')
      .innerJoin('employment_records', 'er', 'er.user_id = user.id')
      .where('leave.id = :leaveRequestId', { leaveRequestId })
      .andWhere('er.client_id = :clientId', { clientId: managerClientId })
      .getOne();

    if (!leaveRequest) {
      throw new ForbiddenException('Access denied: leave request not associated with your client');
    }
  }

  /**
   * Create a new leave request
   */
  async create(
    userId: string,
    createDto: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    // Validate dates
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for overlapping leave requests
    await this.checkLeaveOverlap(userId, startDate, endDate);

    // Check leave balance availability
    const currentYear = new Date().getFullYear();
    const balance = await this.leaveBalanceRepository.findOne({
      where: {
        userId,
        countryCode: createDto.countryCode,
        leaveType: createDto.leaveType,
        year: currentYear,
      },
    });

    if (balance && createDto.totalDays > balance.availableDays) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${balance.availableDays} days, Requested: ${createDto.totalDays} days`,
      );
    }

    // Create leave request
    const leaveRequest = this.leaveRequestRepository.create({
      userId,
      countryCode: createDto.countryCode,
      leaveType: createDto.leaveType,
      startDate,
      endDate,
      totalDays: createDto.totalDays,
      notes: createDto.notes || null,
      isPaid: createDto.isPaid,
      status: LeaveRequestStatus.DRAFT,
    });

    const savedRequest = await this.leaveRequestRepository.save(leaveRequest);

    // Log audit trail
    await this.auditService.log({
      action: 'LEAVE_REQUEST_CREATED',
      entityType: 'LeaveRequest',
      entityId: savedRequest.id,
      actorUserId: userId,
      actorRole: 'employee',
      changes: {
        leaveType: createDto.leaveType,
        startDate: createDto.startDate,
        endDate: createDto.endDate,
        totalDays: createDto.totalDays,
      },
    });

    return savedRequest;
  }

  /**
   * Check for overlapping leave requests
   */
  private async checkLeaveOverlap(
    userId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<void> {
    const queryBuilder = this.leaveRequestRepository
      .createQueryBuilder('leave')
      .where('leave.userId = :userId', { userId })
      .andWhere('leave.status IN (:...statuses)', {
        statuses: [
          LeaveRequestStatus.SUBMITTED,
          LeaveRequestStatus.APPROVED,
        ],
      })
      .andWhere(
        '(leave.startDate <= :endDate AND leave.endDate >= :startDate)',
        { startDate, endDate },
      );

    if (excludeId) {
      queryBuilder.andWhere('leave.id != :excludeId', { excludeId });
    }

    const overlappingLeaves = await queryBuilder.getMany();

    if (overlappingLeaves.length > 0) {
      const overlappingDates = overlappingLeaves.map((leave) =>
        `${leave.startDate.toISOString().split('T')[0]} to ${leave.endDate.toISOString().split('T')[0]}`,
      ).join(', ');
      
      throw new BadRequestException(
        `Leave request overlaps with existing leave(s): ${overlappingDates}`,
      );
    }
  }

  /**
   * Find all leave requests with optional filters
   */
  async findAll(query: LeaveRequestQueryDto): Promise<LeaveRequest[]> {
    const queryBuilder = this.leaveRequestRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.user', 'user')
      .leftJoinAndSelect('leave.country', 'country')
      .leftJoinAndSelect('leave.approvals', 'approvals')
      .leftJoinAndSelect('approvals.approver', 'approver');

    if (query.status) {
      queryBuilder.andWhere('leave.status = :status', { status: query.status });
    }

    if (query.userId) {
      queryBuilder.andWhere('leave.userId = :userId', { userId: query.userId });
    }

    if (query.countryCode) {
      queryBuilder.andWhere('leave.countryCode = :countryCode', {
        countryCode: query.countryCode,
      });
    }

    // Client-scoping filter: join to employment_records and filter by client_id
    if (query.clientId) {
      queryBuilder
        .innerJoin('leave.user', 'u')
        .innerJoin('employment_records', 'er', 'er.user_id = u.id')
        .andWhere('er.client_id = :clientId', { clientId: query.clientId });
    }

    if (query.leaveType) {
      queryBuilder.andWhere('leave.leaveType = :leaveType', {
        leaveType: query.leaveType,
      });
    }

    if (query.startDate) {
      queryBuilder.andWhere('leave.startDate >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('leave.endDate <= :endDate', {
        endDate: query.endDate,
      });
    }

    queryBuilder.orderBy('leave.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Find leave request by ID
   */
  async findOne(id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
      relations: ['user', 'country', 'approvals', 'approvals.approver'],
    });

    if (!leaveRequest) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return leaveRequest;
  }

  /**
   * Update a leave request (only if status is DRAFT)
   */
  async update(
    id: string,
    userId: string,
    updateDto: UpdateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id);

    // Check ownership
    if (leaveRequest.userId !== userId) {
      throw new ForbiddenException('You can only update your own leave requests');
    }

    // Only allow updates if status is DRAFT
    if (leaveRequest.status !== LeaveRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Leave requests can only be updated when in DRAFT status',
      );
    }

    // Validate dates if provided
    if (updateDto.startDate || updateDto.endDate) {
      const startDate = updateDto.startDate
        ? new Date(updateDto.startDate)
        : leaveRequest.startDate;
      const endDate = updateDto.endDate
        ? new Date(updateDto.endDate)
        : leaveRequest.endDate;

      if (endDate < startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Update fields
    Object.assign(leaveRequest, updateDto);

    return await this.leaveRequestRepository.save(leaveRequest);
  }

  /**
   * Submit a leave request for approval
   */
  async submit(id: string, userId: string): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id);

    // Check ownership
    if (leaveRequest.userId !== userId) {
      throw new ForbiddenException('You can only submit your own leave requests');
    }

    // Only allow submission if status is DRAFT
    if (leaveRequest.status !== LeaveRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Only DRAFT leave requests can be submitted',
      );
    }

    leaveRequest.status = LeaveRequestStatus.SUBMITTED;
    const savedRequest = await this.leaveRequestRepository.save(leaveRequest);

    // Log audit trail
    await this.auditService.log({
      action: 'LEAVE_REQUEST_SUBMITTED',
      entityType: 'LeaveRequest',
      entityId: id,
      actorUserId: userId,
      actorRole: 'employee',
      changes: {
        status: {
          old: LeaveRequestStatus.DRAFT,
          new: LeaveRequestStatus.SUBMITTED,
        },
      },
    });

    return savedRequest;
  }

  /**
   * Cancel/withdraw a leave request
   */
  async cancel(id: string, userId: string): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id);

    // Check ownership
    if (leaveRequest.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own leave requests');
    }

    // Only allow cancellation if status is DRAFT or SUBMITTED
    if (
      leaveRequest.status !== LeaveRequestStatus.DRAFT &&
      leaveRequest.status !== LeaveRequestStatus.SUBMITTED
    ) {
      throw new BadRequestException(
        'Only DRAFT or SUBMITTED leave requests can be cancelled',
      );
    }

    const oldStatus = leaveRequest.status;
    leaveRequest.status = LeaveRequestStatus.CANCELLED;
    const savedRequest = await this.leaveRequestRepository.save(leaveRequest);

    // Log audit trail
    await this.auditService.log({
      action: 'LEAVE_REQUEST_CANCELLED',
      entityType: 'LeaveRequest',
      entityId: id,
      actorUserId: userId,
      actorRole: 'employee',
      changes: {
        status: {
          old: oldStatus,
          new: LeaveRequestStatus.CANCELLED,
        },
      },
    });

    return savedRequest;
  }

  /**
   * Delete a leave request (only if status is DRAFT)
   */
  async remove(id: string, userId: string): Promise<void> {
    const leaveRequest = await this.findOne(id);

    // Check ownership
    if (leaveRequest.userId !== userId) {
      throw new ForbiddenException('You can only delete your own leave requests');
    }

    // Only allow deletion if status is DRAFT
    if (leaveRequest.status !== LeaveRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Leave requests can only be deleted when in DRAFT status',
      );
    }

    await this.leaveRequestRepository.remove(leaveRequest);
  }

  /**
   * Get leave balances for a user
   */
  async getBalances(
    userId: string,
    countryCode?: string,
  ): Promise<LeaveBalance[]> {
    const currentYear = new Date().getFullYear();
    const queryBuilder = this.leaveBalanceRepository
      .createQueryBuilder('balance')
      .where('balance.userId = :userId', { userId })
      .andWhere('balance.year = :year', { year: currentYear });

    if (countryCode) {
      queryBuilder.andWhere('balance.countryCode = :countryCode', {
        countryCode,
      });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get approved leave requests for a specific payroll period
   */
  async getPayrollReadyLeaves(
    payrollPeriodId: string,
    countryCode?: string,
  ): Promise<LeaveRequest[]> {
    const queryBuilder = this.leaveRequestRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.user', 'user')
      .where('leave.status = :status', { status: LeaveRequestStatus.APPROVED })
      .andWhere('leave.payrollPeriodId = :payrollPeriodId', {
        payrollPeriodId,
      });

    if (countryCode) {
      queryBuilder.andWhere('leave.countryCode = :countryCode', {
        countryCode,
      });
    }

    return await queryBuilder.getMany();
  }
}

