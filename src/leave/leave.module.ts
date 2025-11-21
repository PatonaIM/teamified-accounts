import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveApproval } from './entities/leave-approval.entity';
import { LeaveBalance } from './entities/leave-balance.entity';
import { LeaveService } from './services/leave.service';
import { LeaveApprovalService } from './services/leave-approval.service';
import { LeaveCalculationService } from './services/leave-calculation.service';
import { LeaveController } from './controllers/leave.controller';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { PayrollModule } from '../payroll/payroll.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest, LeaveApproval, LeaveBalance]),
    forwardRef(() => AuthModule),
    AuditModule,
    forwardRef(() => PayrollModule),
  ],
  controllers: [LeaveController],
  providers: [LeaveService, LeaveApprovalService, LeaveCalculationService],
  exports: [LeaveService, LeaveApprovalService, LeaveCalculationService],
})
export class LeaveModule {}

