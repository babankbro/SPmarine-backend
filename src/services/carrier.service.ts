import { Injectable } from '@nestjs/common';

import { CarrierRepository } from '@/repositories/carrier.repository';
import { Carrier } from '@/entities/carrier.entity';

@Injectable()
export class CarrierService {
  constructor(private readonly repository: CarrierRepository) {}

  public async getCarriers(): Promise<Carrier[]> {
    return this.repository.getCarriers();
  }

  public async getCarrierById(id: string) {
    return this.repository.getCarrierById(id);
  }

  public async updateCarrier(id: string, body: Carrier) {
    return this.repository.updateCarrier(id, body);
  }
}
