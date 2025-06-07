import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Barge } from '@/entities/barge.entity';
import { BargeController } from '@/controllers/barge.controller';
import { BargeRepository } from '@/repositories/barge.repository';
import { BargeService } from '@/services/barge.service';

@Module({
  imports: [TypeOrmModule.forFeature([Barge])],
  controllers: [BargeController],
  providers: [BargeService, BargeRepository],
})
export class BargeModule {}
