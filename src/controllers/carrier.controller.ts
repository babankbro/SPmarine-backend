import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';

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

  @Put(':id')
  public async updateCarrier(@Param('id') id: string, @Body() body: Carrier) {
    try {
      await this.service.updateCarrier(id, body);

      return { message: '', status: HttpStatus.OK };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
