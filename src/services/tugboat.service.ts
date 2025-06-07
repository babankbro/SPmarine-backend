import { Injectable } from '@nestjs/common';

import { TugboatRepository } from '@/repositories/tugboat.repository';
import { Tugboat } from '@/entities/tugboat.entity';

@Injectable()
export class TugboatService {
  constructor(private readonly repository: TugboatRepository) {}

  public async getTugboats(): Promise<Tugboat[]> {
    return await this.repository.getTugboats();
  }

  public async getTugboatById(id: string): Promise<Tugboat | null> {
    return await this.repository.getTugboatById(id);
  }

  public async createNewTugboat(tugboat: Tugboat) {
    return await this.repository.createNewTugboat(tugboat);
  }

  public async upload(buffer: Buffer): Promise<Tugboat[]> {
    return await this.repository.upload(buffer);
  }

  public async deleteById(id: string): Promise<void> {
    return await this.repository.removeById(id);
  }

  public async updateTugboat(id: string, body: {}) {
    return await this.repository.updateTugboat(id, body);
  }
}
