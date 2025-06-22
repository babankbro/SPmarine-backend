import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as fastcsv from 'fast-csv';
import { Readable } from 'stream';

import { Order, OrderType } from '@/entities/order.entity';

//import { ConflictException } from '@/exceptions/conflict.exception';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly entities: Repository<Order>,
  ) {}

   /**
   * Get all orders
   * @returns 
   */
  public async getOrder() {
    return this.entities.find({
      relations: ['start_station', 'dest_station']
    });
  }

  /**
   * Get order by ID
   * @param id 
   * @returns 
   */
  public async getOrderById(id: string): Promise<Order | null> {
    return await this.entities.findOne({
      where: { id: id },
      relations: ['start_station', 'dest_station']
    });
  }

  /**
   * Update order
   * @param id 
   * @param body 
   */
  public async updateOrder(id: string, body: Order) {
    const exists = await this.entities.findOneBy({ id: id });
    if (!exists) throw new NotFoundException();

    await this.entities.update(id, body);
  }

  /**
   * Delete order by ID
   * @param id 
   */
  public async deleteById(id: string): Promise<void> {
    const exists = await this.entities.findOneBy({ id: id });
    if (!exists) throw new NotFoundException(`Order with ID ${id} not found`);

    await this.entities.delete(id);
  }

  /**
   * Delete multiple orders by IDs
   * @param ids 
   */
  public async deleteMultiId(ids: string[]): Promise<void> {
    if (!ids || !ids.length) throw new Error('No IDs provided');

    await this.entities.delete(ids);
  }
  /**
   * Parses a CSV buffer and saves the records to the database.
   *
   * @param buffer The CSV buffer to parse.
   * @returns A promise that resolves to an array of `Order` entities.
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
            type: (row.Type?.toUpperCase() === 'IMPORT' ? OrderType.IMPORT : OrderType.EXPORT),
            fromPoint: row.FromPoint,
            destPoint: row.DestPoint,
            start_station: row.StartStationId ,
            dest_station: row.DestStationId ,  
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

  // Create new order
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

 
  

  // Create the order entity with proper typing - use Partial<Order>
  const orderToCreate: Partial<Order> = {
      id: orderData.id,
      type: (orderData.Type?.toUpperCase() === 'IMPORT' ? OrderType.IMPORT : OrderType.EXPORT) ,
      fromPoint: orderData.fromPoint,
      destPoint: orderData.destPoint,
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
  
}
