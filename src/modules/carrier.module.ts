import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Carrier } from '@/entities/carrier.entity';
import { CarrierController } from '@/controllers/carrier.controller';
import { CarrierRepository } from '@/repositories/carrier.repository';
import { CarrierService } from '@/services/carrier.service';

@Module({
  imports: [TypeOrmModule.forFeature([Carrier])],
  controllers: [CarrierController],
  providers: [CarrierService, CarrierRepository],
})
export class CarrierModule {}
