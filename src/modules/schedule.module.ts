import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Schedule } from '@/entities/schedule.entity';
import { ScheduleController } from '@/controllers/schedule.controller';
import { ViewScheduleTypePoint } from '@/entities/view_schedule_type_point.entity';
import { ScheduleService } from '@/services/schedule.service';
import { ScheduleRepository } from '@/repositories/schedule.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, ViewScheduleTypePoint]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleRepository],
  // exports: [ScheduleService, ScheduleRepository],
})
export class ScheduleModule {}