// src/repositories/customer.repository.ts
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Customer } from '@/entities/customer.entity';
import { Station } from '@/entities/station.entity';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly entities: Repository<Customer>,
    @InjectRepository(Station)
    private readonly stationEntities: Repository<Station>,
  ) {}

  /**
   * Get all customers with their associated stations
   * @returns Promise<Customer[]>
   */
  public async getCustomers(): Promise<Customer[]> {
    return this.entities.find({
      relations: {
        station: true
      },
      order: {
        name: 'ASC',
        station: {
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
        station: true
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
        station: true
      },
      where: {
        station: {
          id: stationId
        }
      }
    });
  }

  /**
   * Create new customer
   * @param customer Customer data
   * @returns Promise<Customer>
   */
  public async createCustomer(customer: Partial<Customer>): Promise<Customer | null> {
    // Check if customer ID already exists
    const existingCustomer = await this.entities.findOne({ 
      where: { id: customer.id } 
    }).catch(() => null);
    
    if (existingCustomer) {
      throw new ConflictException(`Customer with ID ${customer.id} already exists`);
    }

    const newCustomer = this.entities.create(customer);
    const saved = await this.entities.save(newCustomer);
    
    // Return with relations
    return this.getCustomerById(saved.id);
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

   public async deleteCustomer(id: string): Promise<void> {
    const exists = await this.entities.findOneBy({ id });
    if (!exists) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Delete the customer (no need to handle junction table)
    await this.entities.delete(id);
  }

  /**
   * Add station to customer
   * @param customerId Customer ID
   * @param stationId Station ID
   */
  public async assignStationToCustomer(customerId: string, stationId: string): Promise<Customer | null> {
    // Verify customer exists
    const customer = await this.entities.findOne({
      where: { id: customerId },
      relations: { station: true }
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // Verify station exists
    const station = await this.stationEntities.findOne({ where: { id: stationId } });
    if (!station) {
      throw new NotFoundException(`Station with ID ${stationId} not found`);
    }

    // Update customer's station
    await this.entities.update(customerId, { stationId });

    return this.getCustomerById(customerId);
  }

  /**
   * Remove station from customer
   */
  public async removeStationFromCustomer(customerId: string): Promise<Customer | null> {
    // Verify customer exists
    const customer = await this.entities.findOne({
      where: { id: customerId },
      relations: { station: true }
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // Remove station assignment
    await this.entities.update(customerId, { stationId: undefined });

    return this.getCustomerById(customerId);
  }

  /**
   * Get all station IDs for a customer
   * @param customerId Customer ID
   * @returns Promise<string[]>
   * @private
   */
  public async getStationIdsForCustomer(customerId: string): Promise<string> {
    const customer = await this.entities.findOne({
      where: { id: customerId },
      relations: { station: true }
    });

    return customer?.station ?.id || "";
  }

  /**
   * Update customer stations (replace all)
   * @param customerId Customer ID
   * @param stationIds Array of station IDs
   */
  public async updateCustomerStation(customerId: string, stationId: string): Promise<void> {
    // Verify customer exists
    const customer = await this.entities.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // Verify all stations exist
   
    const station = await this.stationEntities.findOne({ where: { id: stationId } });
    if (!station) {
      throw new NotFoundException(`Station with ID ${stationId} not found`);
    }
  

    // Get current station IDs
    const currentStationIds = await this.getStationIdsForCustomer(customerId);

    // Remove existing relationships
    if (currentStationIds.length > 0) {
      await this.entities
        .createQueryBuilder()
        .relation(Customer, 'station')
        .of(customerId)
        .remove(currentStationIds);
    }

    // Add new relationships
    if (stationId) {
      await this.entities
        .createQueryBuilder()
        .relation(Customer, 'station')
        .of(customerId)
        .add(stationId);
    }
  }

  /**
   * Remove all stations for a customer
   * @param customerId Customer ID
   */
  public async removeAllStationsForCustomer(customerId: string): Promise<void> {
    const stationIds = await this.getStationIdsForCustomer(customerId);
    if (stationIds.length > 0) {
      await this.entities
        .createQueryBuilder()
        .relation(Customer, 'station')
        .of(customerId)
        .remove(stationIds);
    }
  }

  /**
   * Remove all customers for a station
   * @param stationId Station ID
   */
  public async removeAllCustomersForStation(stationId: string): Promise<void> {
    // Find all customers associated with this station
    const customers = await this.getCustomersByStation(stationId);
    
    // Remove the association for each customer
    for (const customer of customers) {
      await this.entities
        .createQueryBuilder()
        .relation(Customer, 'station')
        .of(customer.id)
        .remove(stationId);
    }
  }
}