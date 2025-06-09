import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Tugboat } from '@/entities/tugboat.entity';
import { TugboatController } from '@/controllers/tugboat.controller';
import { TugboatRepository } from '@/repositories/tugboat.repository';
import { TugboatService } from '@/services/tugboat.service';
import { Customer } from '@/entities/customer.entity';
import { Station } from '@/entities/station.entity';
import { Customer_Station } from '@/entities/CustomerStation';

@Module({
  imports: [TypeOrmModule.forFeature([Tugboat])],
  controllers: [TugboatController],
  providers: [TugboatService, TugboatRepository],
})
export class TugboatModule {}
