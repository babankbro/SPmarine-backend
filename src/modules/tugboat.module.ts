// src/modules/tugboat.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Tugboat } from '@/entities/tugboat.entity';
import { Station } from '@/entities/station.entity';
import { TugboatController } from '@/controllers/tugboat.controller';
import { TugboatRepository } from '@/repositories/tugboat.repository';
import { TugboatService } from '@/services/tugboat.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tugboat, Station])],
  controllers: [TugboatController],
  providers: [TugboatService, TugboatRepository],
  exports: [TugboatService, TugboatRepository],
})
export class TugboatModule {}