import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'Carrier' })
export class Carrier {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  public id: string;

  @Column({ type: 'varchar', length: 255 })
  public name: string;


}
