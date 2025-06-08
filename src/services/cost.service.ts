import { Injectable } from '@nestjs/common';
import { CostRepository } from '../repositories/cost.repository';
import { Cost } from '../entities/cost.entity';

@Injectable()
export class CostService {
  constructor(private readonly costRepository: CostRepository) {}

  async findAll(): Promise<Cost[]> {
    return await this.costRepository.findAll();
  }

  async findById(id: string): Promise<Cost> {
    const cost = await this.costRepository.findById(id);
    if (!cost) {
      throw new Error('Cost not found');
    }
    return cost;
  }

  async findByTugboat(tugboatId: string): Promise<Cost[]> {
    return await this.costRepository.findByTugboat(tugboatId);
  }

  async findByOrder(orderId: string): Promise<Cost[]> {
    return await this.costRepository.findByOrder(orderId);
  }
}