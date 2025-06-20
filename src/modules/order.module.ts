import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderController } from '@/controllers/order.controller';
import { OrderRepository } from '@/repositories/order.repository';
import { OrderService } from '@/services/order.service';
import { Order } from '@/entities/order.entity';
import { Station } from '@/entities/station.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Station ])],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
})
export class OrderModule {}
