import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'Carrier' })
export class Carrier {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

}
