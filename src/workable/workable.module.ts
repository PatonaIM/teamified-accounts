import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkableController } from './controllers/workable.controller';
import { WorkableApiService } from './services/workable-api.service';

@Module({
  imports: [ConfigModule],
  controllers: [WorkableController],
  providers: [WorkableApiService],
  exports: [WorkableApiService],
})
export class WorkableModule {}

