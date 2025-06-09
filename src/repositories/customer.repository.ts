import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Customer } from '@/entities/customer.entity';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly entities: Repository<Customer>,
  ) {}

  /**
   *
   * @returns
   */
  public async getCustomers(): Promise<Customer[]> {
    return this.entities.find();
  }

  public async getCustomerById(id: string): Promise<Customer | null> {
    const ret = await this.entities.findOneBy({ id: id });
    if (!ret) throw new NotFoundException();

    return ret;
  }
}
