import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LeaveRequest, LeaveRequestStatus } from './leave-request.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('leave_approvals')
export class LeaveApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'leave_request_id', type: 'uuid' })
  leaveRequestId: string;

  @ManyToOne(() => LeaveRequest, (leaveRequest) => leaveRequest.approvals)
  @JoinColumn({ name: 'leave_request_id' })
  leaveRequest: LeaveRequest;

  @Column({ name: 'approver_id', type: 'uuid' })
  approverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approver_id' })
  approver: User;

  @Column({
    name: 'status',
    type: 'enum',
    enum: LeaveRequestStatus,
    enumName: 'leave_request_status_enum',
  })
  status: LeaveRequestStatus;

  @Column({ type: 'text', nullable: true })
  comments: string | null;

  @Column({ name: 'approved_at', type: 'timestamp' })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

