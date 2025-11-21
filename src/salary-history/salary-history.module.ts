import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryHistory } from './entities/salary-history.entity';
import { EmploymentRecord } from '../employment-records/entities/employment-record.entity';
import { SalaryHistoryService } from './services/salary-history.service';
import { SalaryHistoryController } from './controllers/salary-history.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalaryHistory, EmploymentRecord]),
    forwardRef(() => AuthModule),
  ],
  controllers: [SalaryHistoryController],
  providers: [SalaryHistoryService],
  exports: [SalaryHistoryService],
})
export class SalaryHistoryModule {}
