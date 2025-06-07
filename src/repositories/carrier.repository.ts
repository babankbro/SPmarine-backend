import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
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
}
