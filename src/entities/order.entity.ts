import { Entity, Column, PrimaryColumn } from 'typeorm';

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
