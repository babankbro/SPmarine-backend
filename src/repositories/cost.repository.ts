import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Cost } from '@/entities/cost.entity';

@Injectable()
export class CostRepository {
  constructor(
    @InjectRepository(Cost)
    private readonly entities: Repository<Cost>,
  ) {}

  public async findAll(): Promise<Cost[]> {
    return await this.entities.find();
  }

  public async findById(id: string) {
    const [tugboat, order] = id.split("-");
    const ret = await this.entities.findOne({ where: {
        tugboatId: tugboat,
        orderId: order
    }});
    if (!ret) throw new NotFoundException();

    return ret;
  }

  public async findByTugboat(id: string): Promise<Cost[] | null> {
    const ret = await this.entities.findBy({ tugboatId: id });
    if (!ret) throw new NotFoundException();

    return ret;
  }

  public async findByOrder(id: string): Promise<Cost[]> {
    const ret = await this.entities.findBy({ orderId: id });
    if (!ret) throw new NotFoundException();

    return ret;
  }
}
