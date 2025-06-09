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
      console.log('Backend findAll called');
      const costs = await this.serivce.findAll();
      console.log(`Returning ${costs.length} cost records`);

      return costs;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch costs: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/tugboat/:tugboatId')
  public async findByTugboat(
    @Param('tugboatId') tugboatId: string,
  ): Promise<Cost[] | null> {
    try {
      return await this.serivce.findByTugboat(tugboatId);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch costs for tugboat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/order/:orderId')
  public async findByOrder(@Param('orderId') orderId: string): Promise<Cost[]> {
    try {
      return await this.serivce.findByOrder(orderId);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch costs for order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
