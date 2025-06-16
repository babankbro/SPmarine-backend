import { Injectable } from '@nestjs/common';

import { Barge } from '@/entities/barge.entity';
import { BargeRepository } from '@/repositories/barge.repository';

@Injectable()
export class BargeService {
  constructor(private readonly repository: BargeRepository) {}

  public async getOrder(): Promise<Barge[]> {
    return await this.repository.getBarges();
  }

  public async getBargeById(id: string): Promise<Barge | null> {
    return await this.repository.getBargeById(id);
  }

  public async createNewBarge(barge: Barge) {
    return await this.repository.createNewBarge(barge);
  }

  public async updateBarge(id: string, barge: Barge) {
    return await this.repository.updateBarge(id, barge);
  }

  public async deleteById(id: string) {
    return await this.repository.deleteById(id);
  }

  public async deleteMultiId(id: string[]) {
    return await this.repository.deleteMultiId(id);
  }

  /* public async upload(buffer: Buffer): Promise<Barge[]> {
    return await this.repository.upload(buffer);
  } */
}
