import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Station } from './station.entity'; // Make sure to create this Station entity if it doesn't exist

@Entity({ name: 'Barge' })
export class Barge {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  public id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public name: string;

  @Column({ type: 'float', nullable: true })
  public weight: number;

  @Column({ type: 'float', nullable: true })
  public capacity: number;

  @Column({ type: 'enum', enum: ['SEA', 'RIVER'], nullable: true })
  public waterStatus: 'SEA' | 'RIVER';

  // Keep the original column for database compatibility
  @Column({ type: 'varchar', length: 255, nullable: true })
  public stationId: string;

  // Add the relation to Station entity
  @ManyToOne(() => Station, station => station.barges)
  @JoinColumn({ name: 'stationId' }) // This tells TypeORM which column to use for the join
  station: Station;



  @Column({ type: 'float', nullable: true })
  public setupTime: number;

  @Column({ type: 'datetime', nullable: true })
  public readyDatetime: Date; // Adding this as it was in the database schema
}
