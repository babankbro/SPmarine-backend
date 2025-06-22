import { Injectable } from '@nestjs/common';

import { OrderRepository } from '@/repositories/order.repository';
import { Order } from '@/entities/order.entity';

@Injectable()
export class OrderService {
  constructor(private readonly repository: OrderRepository) {}

  public async getOrder(): Promise<Order[]> {
    return await this.repository.getOrder();
  }

  public async getOrderById(id: string): Promise<Order | null> {
    return await this.repository.getOrderById(id);
  }

   // Create new order
  public async createOrder(orderData: Partial<Order>): Promise<Order | null> {
    return await this.repository.createOrder(orderData);
  }


  public async upload(buffer: Buffer): Promise<Order[]> {
    return await this.repository.upload(buffer);
  }

  public async updateOrder(id: string, body: Order) {
    return await this.repository.updateOrder(id, body);
  }

  public async deleteById(id: string) {
    return await this.repository.deleteById(id);
  }

  public async deleteMultiId(id: string[]) {
    return await this.repository.deleteMultiId(id);
  }
}
