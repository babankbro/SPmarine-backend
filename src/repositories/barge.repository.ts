import { InjectRepository } from '@nestjs/typeorm';
import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Barge } from '@/entities/barge.entity';

@Injectable()
export class BargeRepository {
  constructor(
    @InjectRepository(Barge)
    private readonly entities: Repository<Barge>,
  ) {}

  public async getBarges(): Promise<Barge[]> {
    return this.entities.find();
  }

  public async getBargeById(id: string): Promise<Barge | null> {
    return await this.entities.findOneBy({ id: id });
  }

  public async createNewBarge(barge: Barge) {
    const exists = await this.entities.findOneBy({ id: barge.id });
    if (!exists) {
      const newBarge = this.entities.create(barge);
      return this.entities.save(newBarge);
    }

    throw new ConflictException(`${barge.id} already exists.`);
  }
}
