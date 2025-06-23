import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Schedule')
export class Schedule {

  @PrimaryGeneratedColumn()
  fake_id: number;

  @Column({ type: 'varchar', length: 255 })
  ID: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  type?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'datetime', nullable: true })
  enter_datetime?: Date;

  @Column({ type: 'datetime', nullable: true })
  exit_datetime?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distance?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  time?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  speed?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  type_point?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  order_trip?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_load?: number;

  @Column({ type: 'text', nullable: true })
  barge_ids?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  order_distance?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  order_time?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  barge_speed?: number;

  @Column({ type: 'datetime', nullable: true })
  order_arrival_time?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tugboat_id?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  order_id?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  water_type?: string;
} 