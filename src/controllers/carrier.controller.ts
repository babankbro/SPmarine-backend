import { Controller, Get } from '@nestjs/common';

import { CarrierService } from '@/services/carrier.service';
import { Carrier } from '@/entities/carrier.entity';

@Controller('/v1/carriers')
export class CarrierController {
  constructor(private readonly service: CarrierService) {}

  @Get('')
  public getCarriers() {
    return this.service.getCarriers();
  }
}
