import { Entity, Column, PrimaryColumn, OneToMany, ManyToMany } from 'typeorm';
import { Barge } from './barge.entity';
import { Tugboat } from './tugboat.entity';
import { Order } from './order.entity';
import { Customer } from './customer.entity';

@Entity({ name: 'Station' })
export class Station {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  public id: string;

  @Column({ type: 'varchar', length: 255 })
  public name: string;

  @Column({
    type: 'enum',
    enum: ['SEA', 'RIVER'],
    default: 'SEA',
    nullable: true,
  })
  public type: 'SEA' | 'RIVER';

  @Column({ type: 'float' })
  public latitude: number;

  @Column({ type: 'float' })
  public longitude: number;

  @Column({ type: 'float' })
  public distanceKm: number;

  // @Column({ type: 'varchar', length: 255 })
  // public customerId: string;
  
  @OneToMany(() => Barge, barge => barge.station)
  barges: Barge[];
  
  @OneToMany(() => Tugboat, tugboat => tugboat.station)
  tugboats: Tugboat[];

  @OneToMany(() => Order, order => order.start_station)
  start_stations: Order[];

  @OneToMany(() => Order, order => order.dest_station)
  dest_stations: Order[];

  // New relationship with customers
  @OneToMany(() => Customer, customer => customer.station)
  public customers: Customer[];
}
