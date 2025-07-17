import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { OrderRepository } from '@/repositories/order.repository';
import { Order } from '@/entities/order.entity';

interface OrderFilters {
  type?: string;
  status?: string;
  stationId?: string;
  search?: string;
}

interface CreateOrderData {
  id?: string;
  type: string;
  fromEntityId?: string;
  destEntityId?: string;
  startStationId?: string;
  destStationId?: string;
  productName: string;
  demand: number;
  startDateTime: Date | string;
  dueDateTime: Date | string;
  loadingRate: number;
  cr1?: number;
  cr2?: number;
  cr3?: number;
  cr4?: number;
  cr5?: number;
  cr6?: number;
  cr7?: number;
  cr8?: number;
  cr9?: number;
  timeReadyCR1?: number;
  timeReadyCR2?: number;
  timeReadyCR3?: number;
  timeReadyCR4?: number;
  timeReadyCR5?: number;
  timeReadyCR6?: number;
  timeReadyCR7?: number;
  timeReadyCR8?: number;
  timeReadyCR9?: number;
}

interface UpdateOrderData {
  type?: string;
  fromEntityId?: string;
  destEntityId?: string;
  startStationId?: string;
  destStationId?: string;
  productName?: string;
  demand?: number;
  startDateTime?: Date | string;
  dueDateTime?: Date | string;
  loadingRate?: number;
  cr1?: number;
  cr2?: number;
  cr3?: number;
  cr4?: number;
  cr5?: number;
  cr6?: number;
  cr7?: number;
  cr8?: number;
  cr9?: number;
  timeReadyCR1?: number;
  timeReadyCR2?: number;
  timeReadyCR3?: number;
  timeReadyCR4?: number;
  timeReadyCR5?: number;
  timeReadyCR6?: number;
  timeReadyCR7?: number;
  timeReadyCR8?: number;
  timeReadyCR9?: number;
}

@Injectable()
export class OrderService {
  constructor(private readonly repository: OrderRepository) {}

  /**
   * Get all orders with optional filtering
   */
  public async getOrders(filters?: OrderFilters): Promise<Order[]> {
    return await this.repository.getOrders(filters);
  }

  /**
   * Get order by ID
   */
  public async getOrderById(id: string): Promise<Order | null> {
    return await this.repository.getOrderById(id);
  }

  /**
   * Create new order
   */
  public async createOrder(orderData: CreateOrderData): Promise<Order | null> {
    // Validate required fields
    if (!orderData.productName || !orderData.fromEntityId || !orderData.destEntityId) {
      throw new Error('Product name, from point, and destination point are required');
    }

    // Validate numbers
    if (orderData.demand <= 0) {
      throw new Error('Demand must be greater than 0');
    }

    if (orderData.loadingRate <= 0) {
      throw new Error('Loading rate must be greater than 0');
    }

    // Validate dates
    const startDate = new Date(orderData.startDateTime);
    const dueDate = new Date(orderData.dueDateTime);
    
    if (dueDate <= startDate) {
      throw new Error('Due date must be after start date');
    }

    // Generate ID if not provided
    if (!orderData.id) {
      orderData.id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Check if order with this ID already exists
    const existingOrder = await this.repository.checkOrderExists(orderData.id);
    if (existingOrder) {
      throw new ConflictException(`Order with ID ${orderData.id} already exists`);
    }

    const order = await this.repository.createOrder({
      id: orderData.id,
      type: orderData.type.toUpperCase(),
      fromEntityId: orderData.fromEntityId.trim(),
      destEntityId: orderData.destEntityId.trim(),
      startStationId: orderData.startStationId?.trim(),
      destStationId: orderData.destStationId?.trim(),
      productName: orderData.productName.trim(),
      demand: orderData.demand,
      startDateTime: orderData.startDateTime,
      dueDateTime: orderData.dueDateTime,
      loadingRate: orderData.loadingRate,
      cr1: orderData.cr1 || 0,
      cr2: orderData.cr2 || 0,
      cr3: orderData.cr3 || 0,
      cr4: orderData.cr4 || 0,
      cr5: orderData.cr5 || 0,
      cr6: orderData.cr6 || 0,
      cr7: orderData.cr7 || 0,
      timeReadyCR1: orderData.timeReadyCR1 || 0,
      timeReadyCR2: orderData.timeReadyCR2 || 0,
      timeReadyCR3: orderData.timeReadyCR3 || 0,
      timeReadyCR4: orderData.timeReadyCR4 || 0,
      timeReadyCR5: orderData.timeReadyCR5 || 0,
      timeReadyCR6: orderData.timeReadyCR6 || 0,
      timeReadyCR7: orderData.timeReadyCR7 || 0,
    });

    console.log(`Order created: ${JSON.stringify(order)}`);

    if (!order) {
      throw new Error('Failed to create order');
    }

    return order;
  }

  /**
   * Update order
   */
  public async updateOrder(id: string, orderData: UpdateOrderData): Promise<Order | null> {
    // Check if order exists
    const existingOrder = await this.repository.getOrderById(id);
    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Validate numbers if provided
    if (orderData.demand !== undefined && orderData.demand <= 0) {
      throw new Error('Demand must be greater than 0');
    }

    if (orderData.loadingRate !== undefined && orderData.loadingRate <= 0) {
      throw new Error('Loading rate must be greater than 0');
    }

    // Validate dates if provided
    if (orderData.startDateTime && orderData.dueDateTime) {
      const startDate = new Date(orderData.startDateTime);
      const dueDate = new Date(orderData.dueDateTime);
      
      if (dueDate <= startDate) {
        throw new Error('Due date must be after start date');
      }
    }

    // Update order
    const updatedOrder = await this.repository.updateOrder(id, {
      type: orderData.type?.toUpperCase(),
      fromEntityId: orderData.fromEntityId?.trim(),
      destEntityId: orderData.destEntityId?.trim(),
      startStationId: orderData.startStationId?.trim(),
      destStationId: orderData.destStationId?.trim(),
      productName: orderData.productName?.trim(),
      demand: orderData.demand,
      startDateTime: orderData.startDateTime,
      dueDateTime: orderData.dueDateTime,
      loadingRate: orderData.loadingRate,
      cr1: orderData.cr1,
      cr2: orderData.cr2,
      cr3: orderData.cr3,
      cr4: orderData.cr4,
      cr5: orderData.cr5,
      cr6: orderData.cr6,
      cr7: orderData.cr7,
      cr8: orderData.cr8,
      cr9: orderData.cr9,
      timeReadyCR1: orderData.timeReadyCR1,
      timeReadyCR2: orderData.timeReadyCR2,
      timeReadyCR3: orderData.timeReadyCR3,
      timeReadyCR4: orderData.timeReadyCR4,
      timeReadyCR5: orderData.timeReadyCR5,
      timeReadyCR6: orderData.timeReadyCR6,
      timeReadyCR7: orderData.timeReadyCR7,
      timeReadyCR8: orderData.timeReadyCR8,
      timeReadyCR9: orderData.timeReadyCR9
    });

    console.log(`Order updated: ${JSON.stringify(updatedOrder)}`);
    return updatedOrder;
  }

  /**
   * Delete order by ID
   */
  public async deleteById(id: string): Promise<void> {
    // Check if order exists
    const existingOrder = await this.repository.getOrderById(id);
    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    await this.repository.deleteById(id);
  }

  /**
   * Delete multiple orders by IDs
   */
  public async deleteMultiId(ids: string[]): Promise<void> {
    if (!ids || !ids.length) {
      throw new Error('No IDs provided');
    }

    // Check if all orders exist
    for (const id of ids) {
      const order = await this.repository.getOrderById(id);
      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
    }

    await this.repository.deleteMultiId(ids);
  }

  /**
   * Check if order exists
   */
  public async checkOrderExists(id: string): Promise<boolean> {
    return await this.repository.checkOrderExists(id);
  }

  /**
   * Get order statistics
   */
  public async getOrderStatistics(): Promise<any> {
    return await this.repository.getOrderStatistics();
  }

  /**
   * Upload CSV file to create multiple orders
   */
  public async upload(buffer: Buffer): Promise<Order[]> {
    return await this.repository.upload(buffer);
  }

  // Legacy method for backward compatibility
  public async getOrder(): Promise<Order[]> {
    return this.getOrders();
  }
}
