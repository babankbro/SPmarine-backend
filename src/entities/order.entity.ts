import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Station } from './station.entity';

@Entity({ name: 'Order' })
export class Order {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'enum', enum: ['import', 'export'] })
  type: 'import' | 'export';

  @Column({ type: 'varchar', length: 255 })
  fromPoint: string;

  @Column({ type: 'varchar', length: 255 })
  destPoint: string;

  @Column({ name: 'startStationId', type: 'varchar', length: 255, nullable: true })
  startStationId: string;

  // Column for destination station foreign key
  @Column({ name: 'destStationId', type: 'varchar', length: 255, nullable: true })
  destStationId: string;

  // Relation to start station
  @ManyToOne(() => Station, station => station.start_stations)
  @JoinColumn({ name: 'startStationId', referencedColumnName: 'id' })
  start_station: Station;

  // Relation to destination station
  @ManyToOne(() => Station, station => station.dest_stations)
  @JoinColumn({ name: 'destStationId', referencedColumnName: 'id' })
  dest_station: Station;

  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column('float')
  demand: number;

  @Column({ type: 'datetime' })
  startDateTime: Date;

  @Column({ type: 'datetime' })
  dueDateTime: Date;

  @Column('float')
  loadingRate: number;

  @Column('float')
  cr1: number;

  @Column('float')
  cr2: number;

  @Column('float')
  cr3: number;

  @Column('float')
  cr4: number;

  @Column('float')
  cr5: number;

  @Column('float')
  cr6: number;

  @Column('float')
  cr7: number;

  @Column('float')
  timeReadyCR1: number;

  @Column('float')
  timeReadyCR2: number;

  @Column('float')
  timeReadyCR3: number;

  @Column('float')
  timeReadyCR4: number;

  @Column('float')
  timeReadyCR5: number;

  @Column('float')
  timeReadyCR6: number;

  @Column('float')
  timeReadyCR7: number;
}
