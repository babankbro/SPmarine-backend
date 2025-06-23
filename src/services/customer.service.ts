// src/services/customer.service.ts
import { Injectable } from '@nestjs/common';

import { Customer } from '@/entities/customer.entity';
import { CustomerRepository } from '@/repositories/customer.repository';

@Injectable()
export class CustomerService {
  constructor(private readonly repository: CustomerRepository) {}

  /**
   * Get all customers with their stations
   * @returns Promise<Customer[]>
   */
  public async getCustomers(): Promise<Customer[]> {
    return await this.repository.getCustomers();
  }

  /**
   * Get customer by ID with stations
   * @param id Customer ID
   * @returns Promise<Customer>
   */
  public async getCustomerById(id: string): Promise<Customer| null> {
    return await this.repository.getCustomerById(id);
  }

  /**
   * Get customers by station ID
   * @param stationId Station ID
   * @returns Promise<Customer[]>
   */
  public async getCustomersByStation(stationId: string): Promise<Customer[]> {
    return await this.repository.getCustomersByStation(stationId);
  }

  /**
   * Create new customer
   * @param customer Customer data
   * @returns Promise<Customer>
   */
  public async createCustomer(customer: Partial<Customer>): Promise<Customer| null> {
    return await this.repository.createCustomer(customer);
  }

  /**
   * Update customer
   * @param id Customer ID
   * @param body Customer data
   * @returns Promise<Customer>
   */
  public async updateCustomer(id: string, body: Partial<Customer>): Promise<Customer| null> {
    return await this.repository.updateCustomer(id, body);
  }

  /**
   * Delete customer
   * @param id Customer ID
   */
  public async deleteCustomer(id: string): Promise<void> {
    return await this.repository.deleteCustomer(id);
  }

  /**
   * Add station to customer
   * @param customerId Customer ID
   * @param stationId Station ID
   * @returns Promise<Customer>
   */
  public async addStationToCustomer(customerId: string, stationId: string): Promise<Customer| null> {
    return await this.repository.addStationToCustomer(customerId, stationId);
  }

  /**
   * Remove station from customer
   * @param customerId Customer ID
   * @param stationId Station ID
   * @returns Promise<Customer>
   */
  public async removeStationFromCustomer(customerId: string, stationId: string): Promise<Customer| null> {
    return await this.repository.removeStationFromCustomer(customerId, stationId);
  }
}