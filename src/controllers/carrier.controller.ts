import { Controller, Get, Param } from '@nestjs/common';

import { CarrierService } from '@/services/carrier.service';
import { Carrier } from '@/entities/carrier.entity';

@Controller('/v1/carriers')
export class CarrierController {
  constructor(private readonly service: CarrierService) {}

  @Get('')
  public getCarriers() {
    return this.service.getCarriers();
  }

  @Get(':id')
  public async getCarrierById(@Param('id') id: string) {
    return this.service.getCarrierById(id);
  }
}
