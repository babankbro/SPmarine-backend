import { Entity, PrimaryColumn, Column } from 'typeorm';

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

  @Column({ type: 'float', nullable: true })
  public latitude: number;

  @Column({ type: 'float', nullable: true })
  public longitude: number;

  @Column({ type: 'enum', enum: ['SEA', 'RIVER'], nullable: true })
  public waterStatus: 'SEA' | 'RIVER';

  @Column({ type: 'varchar', length: 255, nullable: true })
  public stationId: string;

  @Column({ type: 'float', nullable: true })
  public distanceKm: number;

  @Column({ type: 'float', nullable: true })
  public setupTime: number;

  @Column({ type: 'datetime', nullable: true })
  public readyDatetime: Date;
}
