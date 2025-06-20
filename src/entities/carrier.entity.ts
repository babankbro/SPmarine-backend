import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'Carrier' })
export class Carrier {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  public id: string;

  @Column({ type: 'varchar', length: 255 })
  public name: string;

<<<<<<< HEAD
=======
  @Column({ type: 'float', default: 0 })
  public latitude: number;

  @Column({ type: 'float', default: 0 })
  public longitude: number;
>>>>>>> b30a392322f66b3adc777beea54c6f69a0f4ffcd
}
