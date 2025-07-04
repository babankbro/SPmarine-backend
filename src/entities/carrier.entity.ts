import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Carrier' })
export class Carrier {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  public id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  public name: string;

  @Column({ 
    type: 'int', 
    nullable: true,
    comment: 'ความจุสูงสุด (ตัน)'
  })
  public maxCapacity?: number;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    comment: 'ชื่อบริษัท'
  })
  public holder?: string;

  @Column({ 
    type: 'int', 
    nullable: true,
    comment: 'จำนวนระวาง'
  })
  public numberOfBulks?: number;

  @Column({ 
    type: 'int', 
    nullable: true,
    comment: 'จำนวนเครนสูงสุด'
  })
  public maxCrane?: number;

}