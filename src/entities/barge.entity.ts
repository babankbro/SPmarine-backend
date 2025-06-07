import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'Barge' })
export class Barge {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ type: 'float', nullable: true })
  capacity: number;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ type: 'enum', enum: ['SEA', 'RIVER'], nullable: true })
  waterStatus: 'SEA' | 'RIVER';

  @Column({ type: 'varchar', length: 255, nullable: true })
  stationId: string;

  @Column({ type: 'float', nullable: true })
  distanceKm: number;

  @Column({ type: 'float', nullable: true })
  setupTime: number;

  @Column({ type: 'datetime', nullable: true })
  readyDatetime: Date;
}
