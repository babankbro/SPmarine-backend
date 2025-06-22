import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Station } from './station.entity'; // Make sure to create this Station entity if it doesn't exist

@Entity('Tugboat')
export class Tugboat {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'int', nullable: true })
  maxCapacity?: number;

  @Column({ type: 'int', nullable: true })
  maxBarge?: number;

  @Column({ type: 'float', nullable: true })
  maxFuelCon?: number;

  @Column({ type: 'enum', enum: ['SEA', 'RIVER'], default: 'SEA' })
  type: 'SEA' | 'RIVER';

  @Column({ type: 'float', nullable: true })
  minSpeed?: number;

  @Column({ type: 'float', nullable: true })
  maxSpeed?: number;

  @Column({ type: 'float', nullable: true })
  engineRpm?: number;

  @Column({ type: 'float', nullable: true })
  horsePower?: number;

  @Column({ type: 'enum', enum: ['SEA', 'RIVER'], default: 'SEA' })
  waterStatus: 'SEA' | 'RIVER';

  @Column({ type: 'datetime', nullable: true })
  readyDatetime?: Date;

  // Add the relation to Station entity
  @ManyToOne(() => Station, station => station.tugboats)
  @JoinColumn({ name: 'stationId' }) // This tells TypeORM which column to use for the join
  station: Station;
  
}
