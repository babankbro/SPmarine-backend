import { Injectable } from '@nestjs/common';

import { CarrierRepository } from '@/repositories/carrier.repository';
import { Carrier } from '@/entities/carrier.entity';

@Injectable()
export class CarrierService {
  constructor(private readonly repository: CarrierRepository) {}

  public async getCarriers(): Promise<Carrier[]> {
    return this.repository.getCarriers();
  }
}
