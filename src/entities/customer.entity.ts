// src/entities/customer.entity.ts
import { Entity, Column, PrimaryColumn, ManyToOne, JoinTable } from 'typeorm';
import { Station } from './station.entity';

@Entity({ name: 'Customer' })
export class Customer {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  public id: string;

  @Column({ type: 'varchar', length: 255 })
  public name: string;

  @Column({ type: 'varchar', length: 255 })
  public email: string;

  @Column({ type: 'varchar', length: 255 })
  public address: string;

  // // Many-to-many relationship with Station through Customer_Station table
  // @ManyToMany(() => Station, station => station.customers)
  // @JoinTable({
  //   name: 'Customer_Station', // Junction table name
  //   joinColumn: {
  //     name: 'CustomerId',
  //     referencedColumnName: 'id',
  //   },
  //   inverseJoinColumn: {
  //     name: 'StationId', 
  //     referencedColumnName: 'id',
  //   },
  // })
  // public stations: Station[];

  // Add stationId column for single station association
  @Column({ type: 'varchar', length: 255, nullable: true })
  public stationId: string;

  // Many-to-one relationship with Station (single station per customer)
  @ManyToOne(() => Station, station => station.customers, {
    onDelete: 'SET NULL', // When station is deleted, set customer.stationId to null
    onUpdate: 'CASCADE'
  })
  @JoinTable({ name: 'stationId' })
  public station: Station;
}