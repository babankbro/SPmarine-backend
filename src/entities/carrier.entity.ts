import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'Carrier' })
export class Carrier {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  public id: string;

  @Column({ type: 'varchar', length: 255 })
  public name: string;

  @Column({ type: 'float', default: 0 })
  public latitude: number;

  @Column({ type: 'float', default: 0 })
  public longitude: number;
}
