import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import * as fastcsv from 'fast-csv';
import { Readable } from 'stream';

import { Order, OrderType } from '@/entities/order.entity';
import { Station } from '@/entities/station.entity';

interface OrderFilters {
  type?: string;
  status?: string;
  stationId?: string;
  search?: string;
}

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly entities: Repository<Order>,
    @InjectRepository(Station)
    private readonly stationEntities: Repository<Station>,
  ) {}

  /**
   * Get all orders with optional filtering
   */
  public async getOrders(filters?: OrderFilters): Promise<Order[]> {
    const queryBuilder = this.entities.createQueryBuilder('order')
      .leftJoinAndSelect('order.start_station', 'startStation')
      .leftJoinAndSelect('order.dest_station', 'destStation');

    // Apply filters
    if (filters?.type) {
      queryBuilder.andWhere('order.type = :type', { type: filters.type });
    }

    if (filters?.stationId) {
      queryBuilder.andWhere(
        '(order.startStationId = :stationId OR order.destStationId = :stationId)',
        { stationId: filters.stationId }
      );
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(order.id LIKE :search OR order.productName LIKE :search OR order.fromPoint LIKE :search OR order.destPoint LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Apply status filter based on dates
    if (filters?.status) {
      const now = new Date();
      switch (filters.status) {
        case 'scheduled':
          queryBuilder.andWhere('order.startDateTime > :now', { now });
          break;
        case 'in-progress':
          queryBuilder.andWhere('order.startDateTime <= :now AND order.dueDateTime >= :now', { now });
          break;
        case 'overdue':
          queryBuilder.andWhere('order.dueDateTime < :now', { now });
          break;
      }
    }

    return queryBuilder
      .orderBy('order.startDateTime', 'DESC')
      .getMany();
  }

  /**
   * Get order by ID with relations
   */
  public async getOrderById(id: string): Promise<Order | null> {
    const order = await this.entities.findOne({
      where: { id },
      relations: ['start_station', 'dest_station']
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Create new order
   */
  public async createOrder(orderData: any): Promise<Order | null> {
    // Check if order with this ID already exists
    if (orderData.id) {
      const existingOrder = await this.entities.findOne({
        where: { id: orderData.id }
      });
      if (existingOrder) {
        throw new ConflictException(`Order with ID ${orderData.id} already exists`);
      }
    }

    // Validate stations exist if provided
    if (orderData.startStationId) {
      const startStation = await this.stationEntities.findOne({
        where: { id: orderData.startStationId }
      });
      if (!startStation) {
        throw new NotFoundException(`Start station with ID ${orderData.startStationId} not found`);
      }
    }

    if (orderData.destStationId) {
      const destStation = await this.stationEntities.findOne({
        where: { id: orderData.destStationId }
      });
      if (!destStation) {
        throw new NotFoundException(`Destination station with ID ${orderData.destStationId} not found`);
      }
    }

    // Create the order entity with proper typing
    const orderToCreate: Partial<Order> = {
      id: orderData.id,
      type: this.parseOrderType(orderData.type),
      fromEntityId: orderData.fromEntityId,
      destEntityId: orderData.destEntityId,
      startStationId: orderData.startStationId,
      destStationId: orderData.destStationId,
      productName: orderData.productName,
      demand: Number(orderData.demand),
      startDateTime: orderData.startDateTime ? new Date(orderData.startDateTime) : new Date(),
      dueDateTime: orderData.dueDateTime ? new Date(orderData.dueDateTime) : new Date(),
      loadingRate: Number(orderData.loadingRate),
      cr1: Number(orderData.cr1) || 0,
      cr2: Number(orderData.cr2) || 0,
      cr3: Number(orderData.cr3) || 0,
      cr4: Number(orderData.cr4) || 0,
      cr5: Number(orderData.cr5) || 0,
      cr6: Number(orderData.cr6) || 0,
      cr7: Number(orderData.cr7) || 0,
      timeReadyCR1: Number(orderData.timeReadyCR1) || 0,
      timeReadyCR2: Number(orderData.timeReadyCR2) || 0,
      timeReadyCR3: Number(orderData.timeReadyCR3) || 0,
      timeReadyCR4: Number(orderData.timeReadyCR4) || 0,
      timeReadyCR5: Number(orderData.timeReadyCR5) || 0,
      timeReadyCR6: Number(orderData.timeReadyCR6) || 0,
      timeReadyCR7: Number(orderData.timeReadyCR7) || 0,
    };

    // Create and save the order
    const order = this.entities.create(orderToCreate);
    const savedOrder = await this.entities.save(order);
    
    // Fetch the complete order with relations
    return await this.getOrderById(savedOrder.id);
  }

  /**
   * Update order
   */
  public async updateOrder(id: string, body: any): Promise<Order | null> {
    const exists = await this.entities.findOneBy({ id });
    if (!exists) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Validate stations exist if provided
    if (body.startStationId) {
      const startStation = await this.stationEntities.findOne({
        where: { id: body.startStationId }
      });
      if (!startStation) {
        throw new NotFoundException(`Start station with ID ${body.startStationId} not found`);
      }
    }

    if (body.destStationId) {
      const destStation = await this.stationEntities.findOne({
        where: { id: body.destStationId }
      });
      if (!destStation) {
        throw new NotFoundException(`Destination station with ID ${body.destStationId} not found`);
      }
    }

    // Prepare update data
    const updateData: Partial<Order> = {};
    
    if (body.type !== undefined) updateData.type = this.parseOrderType(body.type);
    if (body.fromEntityId !== undefined) updateData.fromEntityId = body.fromEntityId;
    if (body.destEntityId !== undefined) updateData.destEntityId = body.destEntityId;
    if (body.startStationId !== undefined) updateData.startStationId = body.startStationId;
    if (body.destStationId !== undefined) updateData.destStationId = body.destStationId;
    if (body.productName !== undefined) updateData.productName = body.productName;
    if (body.demand !== undefined) updateData.demand = Number(body.demand);
    if (body.startDateTime !== undefined) updateData.startDateTime = new Date(body.startDateTime);
    if (body.dueDateTime !== undefined) updateData.dueDateTime = new Date(body.dueDateTime);
    if (body.loadingRate !== undefined) updateData.loadingRate = Number(body.loadingRate);
    
     // Update CR values
    for (let i = 1; i <= 7; i++) {
      if (body[`cr${i}`] !== undefined) {
        (updateData as any)[`cr${i}`] = Number(body[`cr${i}`]);
      }
      if (body[`timeReadyCR${i}`] !== undefined) {
        (updateData as any)[`timeReadyCR${i}`] = Number(body[`timeReadyCR${i}`]);
      }
    }
    await this.entities.update(id, updateData);
    
    // Return updated order with relations
    return await this.getOrderById(id);
  }

  /**
   * Delete order by ID
   */
  public async deleteById(id: string): Promise<void> {
    const exists = await this.entities.findOneBy({ id });
    if (!exists) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    await this.entities.delete(id);
  }

  /**
   * Delete multiple orders by IDs
   */
  public async deleteMultiId(ids: string[]): Promise<void> {
    if (!ids || !ids.length) throw new Error('No IDs provided');

    // Check if all orders exist
    for (const id of ids) {
      const exists = await this.entities.findOneBy({ id });
      if (!exists) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
    }

    await this.entities.delete(ids);
  }

  /**
   * Check if order exists
   */
  public async checkOrderExists(id: string): Promise<boolean> {
    try {
      const order = await this.entities.findOne({ where: { id } });
      return !!order;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get order statistics
   */
  public async getOrderStatistics(): Promise<any> {
    const queryBuilder = this.entities.createQueryBuilder('order');
    
    const result = await queryBuilder
      .select([
        'COUNT(*) as total',
        'SUM(CASE WHEN order.type = "IMPORT" THEN 1 ELSE 0 END) as importOrders',
        'SUM(CASE WHEN order.type = "EXPORT" THEN 1 ELSE 0 END) as exportOrders',
        'AVG(order.demand) as averageDemand',
        'SUM(order.demand) as totalDemand',
        'AVG(order.loadingRate) as averageLoadingRate'
      ])
      .getRawOne();

    const now = new Date();
    const statusResult = await queryBuilder
      .select([
        'COUNT(*) as total',
        `SUM(CASE WHEN order.startDateTime > '${now.toISOString()}' THEN 1 ELSE 0 END) as scheduled`,
        `SUM(CASE WHEN order.startDateTime <= '${now.toISOString()}' AND order.dueDateTime >= '${now.toISOString()}' THEN 1 ELSE 0 END) as inProgress`,
        `SUM(CASE WHEN order.dueDateTime < '${now.toISOString()}' THEN 1 ELSE 0 END) as overdue`
      ])
      .getRawOne();

    return {
      total: parseInt(result.total) || 0,
      importOrders: parseInt(result.importOrders) || 0,
      exportOrders: parseInt(result.exportOrders) || 0,
      averageDemand: parseFloat(result.averageDemand) || 0,
      totalDemand: parseInt(result.totalDemand) || 0,
      averageLoadingRate: parseFloat(result.averageLoadingRate) || 0,
      scheduled: parseInt(statusResult.scheduled) || 0,
      inProgress: parseInt(statusResult.inProgress) || 0,
      overdue: parseInt(statusResult.overdue) || 0,
    };
  }

  /**
   * Parses CSV buffer and saves records to database
   */
  public async upload(buffer: Buffer): Promise<Order[]> {
    return new Promise((resolve, reject) => {
      const orders: Order[] = [];

      Readable.from(buffer)
        .pipe(
          fastcsv.parse({
            headers: true,
            ignoreEmpty: true,
            encoding: 'utf-8',
          }),
        )
        .on('data', (row) => {
          const order: Order = this.entities.create({
            id: row.Id,
            type: this.parseOrderType(row.Type),
            fromEntityId: row.fromEntityId,
            destEntityId: row.destEntityId,
            startStationId: row.StartStationId,
            destStationId: row.DestStationId,
            productName: row.ProductName,
            demand: parseFloat(row.Demand),
            startDateTime: new Date(row.StartDateTime),
            dueDateTime: new Date(row.DueDateTime),
            loadingRate: parseFloat(row.LoadingRate),
            cr1: parseFloat(row.CR1),
            cr2: parseFloat(row.CR2),
            cr3: parseFloat(row.CR3),
            cr4: parseFloat(row.CR4),
            cr5: parseFloat(row.CR5),
            cr6: parseFloat(row.CR6),
            cr7: parseFloat(row.CR7),
            timeReadyCR1: parseFloat(row.TimeReadyCR1),
            timeReadyCR2: parseFloat(row.TimeReadyCR2),
            timeReadyCR3: parseFloat(row.TimeReadyCR3),
            timeReadyCR4: parseFloat(row.TimeReadyCR4),
            timeReadyCR5: parseFloat(row.TimeReadyCR5),
            timeReadyCR6: parseFloat(row.TimeReadyCR6),
            timeReadyCR7: parseFloat(row.TimeReadyCR7),
          });

          if (process.env.DEBUG) {
            console.log(order);
            return;
          }

          orders.push(order);
        })
        .on('end', async () => {
          await this.entities.save(orders);
          resolve(orders);
        })
        .on('error', reject);
    });
  }

  /**
   * Parse order type from string
   */
  private parseOrderType(type: string): OrderType {
    if (typeof type === 'string') {
      const upperType = type.toUpperCase();
      return upperType === 'IMPORT' ? OrderType.IMPORT : OrderType.EXPORT;
    }
    return OrderType.EXPORT; // Default
  }

  // Legacy method for backward compatibility
  public async getOrder(): Promise<Order[]> {
    return this.getOrders();
  }
}