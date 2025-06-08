// SPmarine-backend/src/entities/cost.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Tugboat } from './tugboat.entity';
import { Order } from './order.entity';


@Entity('Cost')
export class Cost {
  @PrimaryColumn()
  TugboatId: string;

  @PrimaryColumn()
  OrderId: string;

  @Column('float')
  Time: number;

  @Column('float')
  Distance: number;

  @Column('float')
  ConsumptionRate: number;

  @Column('float')
  Cost: number;

  @Column('float')
  TotalLoad: number;
}