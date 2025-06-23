// src/modules/customer.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Customer } from '@/entities/customer.entity';
import { Station } from '@/entities/station.entity';
import { CustomerStation } from '@/entities/customer-station.entity';
import { CustomerController } from '@/controllers/customer.controller';
import { CustomerRepository } from '@/repositories/customer.repository';
import { CustomerService } from '@/services/customer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Station, CustomerStation])],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepository],
  exports: [CustomerService, CustomerRepository],
})
export class CustomerModule {}