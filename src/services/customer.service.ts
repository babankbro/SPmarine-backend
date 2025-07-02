// src/services/customer.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { Customer } from '@/entities/customer.entity';
import { CustomerRepository } from '@/repositories/customer.repository';

interface CreateCustomerData {
  id: string;
  name: string;
  email: string;
  address: string;
  stationId?: string;
}

interface UpdateCustomerData {
  name?: string;
  email?: string;
  address?: string;
  stationId?: string;
}

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
  public async getCustomerById(id: string): Promise<Customer | null> {
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
   * Create new customer with optional station associations
   * @param customerData Customer data
   * @returns Promise<Customer>
   */
  public async createCustomer(customerData: CreateCustomerData): Promise<Customer | null> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      throw new Error('Invalid email format');
    }

    // Check if customer with this ID already exists
    const existingCustomer = await this.repository.getCustomerById(customerData.id).catch(() => null);
    if (existingCustomer) {
      throw new ConflictException(`Customer with ID ${customerData.id} already exists`);
    }

    // Check if email is already in use
    const customers = await this.repository.getCustomers();
    const emailExists = customers.some(c => c.email.toLowerCase() === customerData.email.toLowerCase());
    if (emailExists) {
      throw new ConflictException(`Email ${customerData.email} is already in use`);
    }

    // Create customer
    const customer = await this.repository.createCustomer({
      id: customerData.id,
      name: customerData.name.trim(),
      email: customerData.email.toLowerCase().trim(),
      address: customerData.address.trim(),
      stationId: customerData.stationId ? customerData.stationId.trim() : undefined
    });

    console.log(`Customer created: ${JSON.stringify(customer)}`);

    if (!customer) {
      throw new Error('Failed to create customer');
    }

    // Add station associations if provided
    // Update station associations if provided
    if (customerData.stationId !== undefined) {
      await this.updateCustomerStation(customerData.id, customerData.stationId);
    
      // Return updated customer with stations
      return await this.repository.getCustomerById(customer.id);
    }

    return customer;
  }

  /**
   * Update customer information and station associations
   * @param id Customer ID
   * @param customerData Customer data
   * @returns Promise<Customer>
   */
  public async updateCustomer(id: string, customerData: UpdateCustomerData): Promise<Customer | null> {
    // Check if customer exists
    const existingCustomer = await this.repository.getCustomerById(id);
    if (!existingCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Validate email format if provided
    if (customerData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerData.email)) {
        throw new Error('Invalid email format');
      }

      // Check if email is already in use by another customer
      const customers = await this.repository.getCustomers();
      const emailExists = customers.some(c => 
        c.id !== id && c.email.toLowerCase() === customerData.email!.toLowerCase()
      );
      if (emailExists) {
        throw new ConflictException(`Email ${customerData.email} is already in use`);
      }
    }

    // Update basic customer information
    const updateData: Partial<Customer> = {};
    if (customerData.name !== undefined) updateData.name = customerData.name.trim();
    if (customerData.email !== undefined) updateData.email = customerData.email.toLowerCase().trim();
    if (customerData.address !== undefined) updateData.address = customerData.address.trim();

    // Update station associations if provided
    if (customerData.stationId !== undefined) {
      await this.updateCustomerStation(id, customerData.stationId);
    }


    // Update customer basic info if there are changes
    if (Object.keys(updateData).length > 0) {
      await this.repository.updateCustomer(id, updateData);
    }

    

    // Return updated customer with stations
    return await this.repository.getCustomerById(id);
  }

  /**
   * Delete customer and all station associations
   * @param id Customer ID
   */
  public async deleteCustomer(id: string): Promise<void> {
    // Check if customer exists
    const existingCustomer = await this.repository.getCustomerById(id);
    if (!existingCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Delete customer (this will cascade delete station associations due to foreign key constraints)
    await this.repository.deleteCustomer(id);
  }

  /**
   * Add station to customer
   * @param customerId Customer ID
   * @param stationId Station ID
   * @returns Promise<Customer>
   */
  public async addStationToCustomer(customerId: string, stationId: string): Promise<Customer | null> {
    // Verify customer exists
    const customer = await this.repository.getCustomerById(customerId);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // Check if association already exists
    const isAlreadyAssociated = customer.station != null;
    if (isAlreadyAssociated) {
      throw new ConflictException(`Customer ${customerId} is already associated with station ${stationId}`);
    }

    return await this.repository.assignStationToCustomer(customerId, stationId);
  }

  /**
   * Remove station from customer
   * @param customerId Customer ID
   * @param stationId Station ID
   * @returns Promise<Customer>
   */
  public async removeStationFromCustomer(customerId: string, stationId: string): Promise<Customer | null> {
    // Verify customer exists
    const customer = await this.repository.getCustomerById(customerId);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // Check if association exists
    const isAssociated = customer.station != null;
    if (!isAssociated) {
      throw new NotFoundException(`Customer ${customerId} is not associated with station ${stationId}`);
    }

    return await this.repository.removeStationFromCustomer(customerId);
  }

  /**
   * Update all station associations for a customer
   * @param customerId Customer ID
   * @param stationId Array of station IDs
   * @private
   */
  private async updateCustomerStation(customerId: string, stationId: string): Promise<void> {
    const customer = await this.repository.getCustomerById(customerId);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    console.log(`Updating stations for customer ${customerId} with station ${stationId}`);
    const currentStationIds = await this.repository.getStationIdsForCustomer(customerId);
    
    // Remove stations that are no longer in the list
    for (const currentStationId of currentStationIds) {
      if (!stationId.includes(currentStationId)) {
        try {
          await this.repository.removeStationFromCustomer(customerId);
        } catch (error) {
          console.warn(`Failed to remove station ${currentStationId} from customer ${customerId}:`, error);
        }
      }
    }

    // Add new stations
   
    if (!currentStationIds.includes(stationId)) {
      try {
        await this.repository.assignStationToCustomer(customerId, stationId);
      } catch (error) {
        console.warn(`Failed to add station ${stationId} to customer ${customerId}:`, error);
      }
    }
    
  }
}