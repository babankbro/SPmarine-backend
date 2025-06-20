import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Customer } from '@/entities/customer.entity';
import { CustomerController } from '@/controllers/customer.controller';
import { CustomerRepository } from '@/repositories/customer.repository';
import { CustomerService } from '@/services/customer.service';
import { Customer_Station } from '@/entities/CustomerStation';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepository],
})
export class CustomerModule {}
