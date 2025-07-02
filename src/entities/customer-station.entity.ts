// src/entities/customer-station.entity.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Station } from './station.entity';

@Entity('Customer_Station')
export class CustomerStation {
  @PrimaryColumn({ name: 'CustomerId', type: 'varchar', length: 255 })
  public customerId: string;

  @PrimaryColumn({ name: 'StationId', type: 'varchar', length: 255 })
  public stationId: string;

  // Relations
  @ManyToOne(() => Customer, customer => customer.station, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'CustomerId' })
  public customer: Customer;

  @ManyToOne(() => Station, station => station.customers, {
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'StationId' })
  public station: Station;
}