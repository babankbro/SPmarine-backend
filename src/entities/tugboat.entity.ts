import { Entity, Column, PrimaryColumn } from 'typeorm';

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

  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @Column({ type: 'float', nullable: true })
  longitude?: number;

  @Column({ type: 'enum', enum: ['SEA', 'RIVER'], default: 'SEA' })
  waterStatus: 'SEA' | 'RIVER';

  @Column({ type: 'float', nullable: true })
  distanceKm?: number;

  @Column({ type: 'datetime', nullable: true })
  readyDatetime?: Date;
}
