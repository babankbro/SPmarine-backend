// SPmarine-backend/src/repositories/cost.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cost } from '../entities/cost.entity';

@Injectable()
export class CostRepository {
  constructor(
    @InjectRepository(Cost)
    private costRepository: Repository<Cost>,
  ) {}

  async findAll(): Promise<Cost[]> {
    // return await this.costRepository.find({
    //   relations: ['tugboat', 'order'],
    // });

    return await this.costRepository.find();

  }

  async findById(id: string): Promise<Cost | null> {
    // Since you're using a composite primary key (TugboatId, OrderId),
    // You can't look up a record by a single "id" field anymore.
    // Instead, you need to parse the id or use a different approach:
  
    // Option 1: If your ID is in the format "tugboatId-orderId"
    const [tugboatId, orderId] = id.split('-');
    return await this.costRepository.findOne({
      where: { 
        TugboatId: tugboatId,
        OrderId: orderId
      }
    });
  }

  async findByTugboat(tugboatId: string): Promise<Cost[]> {
    return await this.costRepository.find({
      where: { TugboatId: tugboatId },
      relations: ['order'],
    });
  }

  async findByOrder(orderId: string): Promise<Cost[]> {
    return await this.costRepository.find({
      where: { OrderId: orderId },
      relations: ['tugboat'],
    });
  }
}