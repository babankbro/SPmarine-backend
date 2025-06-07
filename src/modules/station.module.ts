import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Station } from '@/entities/station.entity';
import { StationController } from '@/controllers/station.controller';
import { StationRepository } from '@/repositories/station.repository';
import { StationService } from '@/services/station.service';

@Module({
  imports: [TypeOrmModule.forFeature([Station])],
  controllers: [StationController],
  providers: [StationService, StationRepository],
})
export class StationModule {}
