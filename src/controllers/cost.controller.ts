import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { CostService } from '@/services/cost.service';
import { Cost } from '@/entities/cost.entity';

@Controller('/v1/costs')
export class CostController {
  constructor(private readonly serivce: CostService) {}

  @Get()
  public async findAll(): Promise<Cost[]> {
    try {
      const costs = await this.serivce.findAll();

      return costs;
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

  @Get(':id')
  public async findOne(@Param("id") id: string) {
    try {
        const ret = await this.serivce.findById(id);
    
        return ret;
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

  @Get('/tugboat/:tugboatId')
  public async findByTugboat(
    @Param('tugboatId') tugboatId: string,
  ): Promise<Cost[] | null> {
    try {
      return await this.serivce.findByTugboat(tugboatId);
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

  @Get('/order/:orderId')
  public async findByOrder(@Param('orderId') orderId: string): Promise<Cost[]> {
    try {
      return await this.serivce.findByOrder(orderId);
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
