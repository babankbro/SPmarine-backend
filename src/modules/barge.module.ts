import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Barge } from '@/entities/barge.entity';
import { Station } from '@/entities/station.entity';
import { BargeController } from '@/controllers/barge.controller';
import { BargeRepository } from '@/repositories/barge.repository';
import { BargeService } from '@/services/barge.service';

@Module({
  imports: [TypeOrmModule.forFeature([Barge, Station])],
  controllers: [BargeController],
  providers: [BargeService, BargeRepository],
})
export class BargeModule {}
