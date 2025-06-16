import { Injectable } from '@nestjs/common';

import { OrderRepository } from '@/repositories/order.repository';
import { Order } from '@/entities/order.entity';

@Injectable()
export class OrderService {
  constructor(private readonly repository: OrderRepository) {}

  public async getOrder(): Promise<Order[]> {
    return await this.repository.getOrder();
  }

  public async upload(buffer: Buffer): Promise<Order[]> {
    return await this.repository.upload(buffer);
  }

  public async updateOrder(id: string, body: Order) {
    return await this.repository.updateOrder(id, body);
  }
}
