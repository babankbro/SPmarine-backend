import { Injectable } from '@nestjs/common';

import { Customer } from '@/entities/customer.entity';
import { CustomerRepository } from '@/repositories/customer.repository';

@Injectable()
export class CustomerService {
  constructor(private readonly repository: CustomerRepository) {}

  public async getCustomers(): Promise<Customer[]> {
    return await this.repository.getCustomers();
  }

  public async getCustomerById(id: string) {
    return await this.repository.getCustomerById(id);
  }

  /* public async upload(buffer: Buffer): Promise<Barge[]> {
    return await this.repository.upload(buffer);
  } */
}
