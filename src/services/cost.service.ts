import { Injectable } from '@nestjs/common';

import { CostRepository } from '@/repositories/cost.repository';

@Injectable()
export class CostService {
  constructor(private readonly repository: CostRepository) {}

  public async findAll(): Promise<ReturnType<CostRepository['findAll']>> {
    return await this.repository.findAll();
  }

  public async findById(id: string) {
    return await this.repository.findById(id);
  }

  public async findByTugboat(
    id: string,
  ): Promise<ReturnType<CostRepository['findByTugboat']>> {
    return await this.repository.findByTugboat(id);
  }

  public async findByOrder(
    id: string,
  ): Promise<ReturnType<CostRepository['findByOrder']>> {
    return await this.repository.findByOrder(id);
  }
}
