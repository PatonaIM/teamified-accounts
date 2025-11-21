import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timesheet } from './entities/timesheet.entity';
import { TimesheetApproval } from './entities/timesheet-approval.entity';
import { TimesheetService } from './services/timesheet.service';
import { TimesheetCalculationService } from './services/timesheet-calculation.service';
import { TimesheetController } from './controllers/timesheet.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Timesheet, TimesheetApproval]),
    forwardRef(() => AuthModule), // Required for JWT guards
  ],
  controllers: [TimesheetController],
  providers: [TimesheetService, TimesheetCalculationService],
  exports: [TimesheetService, TimesheetCalculationService],
})
export class TimesheetModule {}

