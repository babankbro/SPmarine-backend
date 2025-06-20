import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Carrier } from '@/entities/carrier.entity';

@Injectable()
export class CarrierRepository {
  constructor(
    @InjectRepository(Carrier)
    private readonly entities: Repository<Carrier>,
  ) {}

  public async getCarriers(): Promise<Carrier[]> {
    return this.entities.find();
  }

  public async getCarrierById(id: string): Promise<Carrier | null> {
    const ret = this.entities.findOneBy({ id: id });
    if (!ret) throw new NotFoundException();

    return ret;
  }

  public async updateCarrier(id: string, body: Carrier) {
    const exists = await this.entities.findOneBy({ id: id });
    if (!exists) throw new NotFoundException();

    await this.entities.update(id, body);
  }
}
