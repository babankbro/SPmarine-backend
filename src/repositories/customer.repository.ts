// src/repositories/customer.repository.ts
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
   * Get all customers with their associated stations
   * @returns Promise<Customer[]>
   */
  public async getCustomers(): Promise<Customer[]> {
    return this.entities.find({
      relations: {
        stations: true
      },
      order: {
        name: 'ASC',
        stations: {
          name: 'ASC'
        }
      }
    });
  }

  /**
   * Get customer by ID with stations
   * @param id Customer ID
   * @returns Promise<Customer | null>
   */
  public async getCustomerById(id: string): Promise<Customer | null> {
    const customer = await this.entities.findOne({
      where: { id },
      relations: {
        stations: true
      }
    });
    
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  /**
   * Get customers by station ID
   * @param stationId Station ID
   * @returns Promise<Customer[]>
   */
  public async getCustomersByStation(stationId: string): Promise<Customer[]> {
    return this.entities.find({
      relations: {
        stations: true
      },
      where: {
        stations: {
          id: stationId
        }
      }
    });
  }

  /**
   * Update customer information
   * @param id Customer ID
   * @param body Customer data
   */
  public async updateCustomer(id: string, body: Partial<Customer>) {
    const exists = await this.entities.findOneBy({ id });
    if (!exists) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.entities.update(id, body);
    
    // Return updated customer with relations
    return this.getCustomerById(id);
  }

  /**
   * Create new customer
   * @param customer Customer data
   * @returns Promise<Customer>
   */
  public async createCustomer(customer: Partial<Customer>): Promise<Customer | null> {
    const newCustomer = this.entities.create(customer);
    const saved = await this.entities.save(newCustomer);
    
    // Return with relations
    return this.getCustomerById(saved.id);
  }

  /**
   * Delete customer
   * @param id Customer ID
   */
  public async deleteCustomer(id: string): Promise<void> {
    const exists = await this.entities.findOneBy({ id });
    if (!exists) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.entities.delete(id);
  }

  /**
   * Add station to customer
   * @param customerId Customer ID
   * @param stationId Station ID
   */
  public async addStationToCustomer(customerId: string, stationId: string): Promise<Customer| null> {
    const customer = await this.entities.findOne({
      where: { id: customerId },
      relations: { stations: true }
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // Use query builder to add the relationship
    await this.entities
      .createQueryBuilder()
      .relation(Customer, 'stations')
      .of(customerId)
      .add(stationId);

    return this.getCustomerById(customerId);
  }

  /**
   * Remove station from customer
   * @param customerId Customer ID
   * @param stationId Station ID
   */
  public async removeStationFromCustomer(customerId: string, stationId: string): Promise<Customer | null> {
    await this.entities
      .createQueryBuilder()
      .relation(Customer, 'stations')
      .of(customerId)
      .remove(stationId);

    return this.getCustomerById(customerId);
  }
}