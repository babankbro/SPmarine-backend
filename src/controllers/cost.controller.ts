// SPmarine-backend/src/controllers/cost.controller.ts
import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CostService } from '../services/cost.service';
import { Cost } from '../entities/cost.entity';

@Controller('/v1/costs')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Get()
  async findAll(): Promise<Cost[]> {
    try {
        console.log('Backend findAll called');
        const costs = await this.costService.findAll();
        console.log(`Returning ${costs.length} cost records`);
        return costs;
    } catch (error) {
      console.error('Error in findAll controller:', error); // Add detailed logging
      throw new HttpException(
        `Failed to fetch costs: ${error.message || 'Unknown error'}`, 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Cost> {
    try {
      const cost = await this.costService.findById(id);
      if (!cost) {
        throw new HttpException('Cost not found', HttpStatus.NOT_FOUND);
      }
      return cost;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch cost', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/tugboat/:tugboatId')
  async findByTugboat(@Param('tugboatId') tugboatId: string): Promise<Cost[]> {
    try {
      return await this.costService.findByTugboat(tugboatId);
    } catch (error) {
      throw new HttpException('Failed to fetch costs for tugboat', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/order/:orderId')
  async findByOrder(@Param('orderId') orderId: string): Promise<Cost[]> {
    try {
      return await this.costService.findByOrder(orderId);
    } catch (error) {
      throw new HttpException('Failed to fetch costs for order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}