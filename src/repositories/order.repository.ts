import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as fastcsv from 'fast-csv';
import { Readable } from 'stream';

import { Order } from '@/entities/order.entity';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly entities: Repository<Order>,
  ) {}

  /**
   *
   * @returns
   */
  public async getOrder() {
    return this.entities.find();
  }

  public async updateOrder(id: string, body: Order) {
    const exists = await this.entities.findOneBy({ id: id });
    if (!exists) throw new NotFoundException();

    await this.entities.update(id, body);
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
            type: row.Type as 'import' | 'export',
            fromPoint: row.FromPoint,
            destPoint: row.DestPoint,
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
}
