import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { Barge } from '@/entities/barge.entity';

@Injectable()
export class BargeRepository {
  constructor(
    @InjectRepository(Barge)
    private readonly entities: Repository<Barge>,
  ) {}

  public async getBarges(): Promise<Barge[]> {
    return this.entities.find({
      relations: ['station']
    });
  }

  public async getBargeById(id: string): Promise<Barge | null> {
    return await this.entities.findOne({
      where: { id: id },
      relations: ['station']
    });
  }

  public async createNewBarge(barge: Barge) {
    const exists = await this.entities.findOneBy({ id: barge.id });
    if (!exists) {
      const newBarge = this.entities.create(barge);
      return this.entities.save(newBarge);
    }

    throw new ConflictException(`${barge.id} already exists.`);
  }

  public async updateBarge(id: string, barge: Barge) {
    const exists = await this.entities.findOneBy({ id: id });
    if (!exists) throw new NotFoundException();

    await this.entities.update(id, barge);
  }

  public async deleteById(id: string): Promise<void> {
    const exists = await this.entities.findOneBy({ id: id });
    if (!exists) throw new NotFoundException();

    await this.entities.delete(id);
  }

  public async deleteMultiId(id: string[]): Promise<void> {
    if (!id || !id.length) throw new Error('no IDs provided');

    await this.entities.delete(id);
  }
}
