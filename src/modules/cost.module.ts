// SPmarine-backend/src/modules/cost.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cost } from '../entities/cost.entity';
import { CostController } from '../controllers/cost.controller';
import { CostService } from '../services/cost.service';
import { CostRepository } from '../repositories/cost.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cost]),
  ],
  controllers: [CostController],
  providers: [CostService, CostRepository],
  exports: [CostService],
})
export class CostModule {}