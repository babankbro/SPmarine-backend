import { Entity, Column, PrimaryColumn } from 'typeorm';

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
}
