import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LeaveRequest, LeaveRequestStatus } from '../entities/leave-request.entity';
import { LeaveApproval } from '../entities/leave-approval.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { AuditService } from '../../audit/audit.service';
import { LeaveCalculationService } from './leave-calculation.service';

@Injectable()
export class LeaveApprovalService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(LeaveApproval)
    private readonly leaveApprovalRepository: Repository<LeaveApproval>,
    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepository: Repository<LeaveBalance>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
    private readonly leaveCalculationService: LeaveCalculationService,
  ) {}

  /**
   * Approve a leave request
   */
  async approve(
    leaveRequestId: string,
    approverId: string,
    comments?: string,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id: leaveRequestId },
      relations: ['user'],
    });

    if (!leaveRequest) {
      throw new NotFoundException(
        `Leave request with ID ${leaveRequestId} not found`,
      );
    }

    // Only SUBMITTED requests can be approved
    if (leaveRequest.status !== LeaveRequestStatus.SUBMITTED) {
      throw new BadRequestException(
        'Only SUBMITTED leave requests can be approved',
      );
    }

    // Check leave balance availability
    const currentYear = new Date().getFullYear();
    const balance = await this.leaveBalanceRepository.findOne({
      where: {
        userId: leaveRequest.userId,
        countryCode: leaveRequest.countryCode,
        leaveType: leaveRequest.leaveType,
        year: currentYear,
      },
    });

    if (balance && Number(leaveRequest.totalDays) > Number(balance.availableDays)) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${balance.availableDays} days, Requested: ${leaveRequest.totalDays} days`,
      );
    }

    // Use transaction to update leave request, create approval record, and update balance
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update leave request status
      leaveRequest.status = LeaveRequestStatus.APPROVED;
      await queryRunner.manager.save(leaveRequest);

      // Create approval record
      const approval = queryRunner.manager.create(LeaveApproval, {
        leaveRequestId,
        approverId,
        status: LeaveRequestStatus.APPROVED,
        comments,
        approvedAt: new Date(),
      });
      await queryRunner.manager.save(approval);

      // Update leave balance
      if (balance) {
        balance.usedDays = Number(balance.usedDays) + Number(leaveRequest.totalDays);
        balance.availableDays = Number(balance.totalDays) - Number(balance.usedDays);
        await queryRunner.manager.save(balance);
      }

      await queryRunner.commitTransaction();

      // Invalidate leave balance cache
      const currentYear = new Date().getFullYear();
      this.leaveCalculationService.invalidateUserLeaveBalanceCache(
        leaveRequest.userId,
        leaveRequest.countryCode,
        currentYear,
      );

      // Log audit trail
      await this.auditService.log({
        action: 'LEAVE_REQUEST_APPROVED',
        entityType: 'LeaveRequest',
        entityId: leaveRequestId,
        actorUserId: approverId,
        actorRole: 'approver',
        changes: {
          status: {
            old: LeaveRequestStatus.SUBMITTED,
            new: LeaveRequestStatus.APPROVED,
          },
          comments,
        },
      });

      return await this.leaveRequestRepository.findOne({
        where: { id: leaveRequestId },
        relations: ['user', 'country', 'approvals', 'approvals.approver'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Reject a leave request
   */
  async reject(
    leaveRequestId: string,
    approverId: string,
    comments: string,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id: leaveRequestId },
      relations: ['user'],
    });

    if (!leaveRequest) {
      throw new NotFoundException(
        `Leave request with ID ${leaveRequestId} not found`,
      );
    }

    // Only SUBMITTED requests can be rejected
    if (leaveRequest.status !== LeaveRequestStatus.SUBMITTED) {
      throw new BadRequestException(
        'Only SUBMITTED leave requests can be rejected',
      );
    }

    if (!comments) {
      throw new BadRequestException(
        'Comments are required when rejecting a leave request',
      );
    }

    // Use transaction to update leave request and create approval record
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update leave request status
      leaveRequest.status = LeaveRequestStatus.REJECTED;
      await queryRunner.manager.save(leaveRequest);

      // Create approval record
      const approval = queryRunner.manager.create(LeaveApproval, {
        leaveRequestId,
        approverId,
        status: LeaveRequestStatus.REJECTED,
        comments,
        approvedAt: new Date(),
      });
      await queryRunner.manager.save(approval);

      await queryRunner.commitTransaction();

      // Log audit trail
      await this.auditService.log({
        action: 'LEAVE_REQUEST_REJECTED',
        entityType: 'LeaveRequest',
        entityId: leaveRequestId,
        actorUserId: approverId,
        actorRole: 'approver',
        changes: {
          status: {
            old: LeaveRequestStatus.SUBMITTED,
            new: LeaveRequestStatus.REJECTED,
          },
          comments,
        },
      });

      return await this.leaveRequestRepository.findOne({
        where: { id: leaveRequestId },
        relations: ['user', 'country', 'approvals', 'approvals.approver'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Bulk approve leave requests
   */
  async bulkApprove(
    leaveRequestIds: string[],
    approverId: string,
    comments?: string,
  ): Promise<{ approved: string[]; failed: Array<{ id: string; reason: string }> }> {
    const result = {
      approved: [] as string[],
      failed: [] as Array<{ id: string; reason: string }>,
    };

    for (const leaveRequestId of leaveRequestIds) {
      try {
        await this.approve(leaveRequestId, approverId, comments);
        result.approved.push(leaveRequestId);
      } catch (error) {
        result.failed.push({
          id: leaveRequestId,
          reason: error.message,
        });
      }
    }

    // Log bulk approval audit trail
    await this.auditService.log({
      action: 'LEAVE_REQUESTS_BULK_APPROVED',
      entityType: 'LeaveRequest',
      entityId: 'bulk',
      actorUserId: approverId,
      actorRole: 'approver',
      changes: {
        approved: result.approved.length,
        failed: result.failed.length,
        comments,
      },
    });

    return result;
  }

  /**
   * Get approval history for a leave request
   */
  async getApprovalHistory(leaveRequestId: string): Promise<LeaveApproval[]> {
    return await this.leaveApprovalRepository.find({
      where: { leaveRequestId },
      relations: ['approver'],
      order: { approvedAt: 'DESC' },
    });
  }
}

