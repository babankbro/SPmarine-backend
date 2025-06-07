import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'Carrier' })
export class Carrier {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'float', default: 0 })
  latitude: number;

  @Column({ type: 'float', default: 0 })
  longitude: number;
}
