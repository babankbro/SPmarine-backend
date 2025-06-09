import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('Cost')
export class Cost {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  public tugboatId: string;

  @PrimaryColumn({ type: 'varchar', length: 255 })
  public orderId: string;

  @Column({ type: 'float' })
  public time: number;

  @Column({ type: 'float' })
  public distance: number;

  @Column({ type: 'float' })
  public consumptionRate: number;

  @Column({ type: 'float' })
  public cost: number;

  @Column({ type: 'float' })
  public totalLoad: number;
}
