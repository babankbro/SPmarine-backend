// src/controllers/customer.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  HttpStatus,
  HttpException,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { CustomerService } from '@/services/customer.service';
import { Customer } from '@/entities/customer.entity';

@Controller('/v1/customers')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  /**
   * Get all customers with their stations
   * @param stationId Optional filter by station ID
   */
  @Get('/')
  public async getCustomers(@Query('stationId') stationId?: string) {
    try {
      if (stationId) {
        return this.service.getCustomersByStation(stationId);
      }
      return this.service.getCustomers();
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get customer by ID with stations
   * @param id Customer ID
   */
  @Get(':id')
  public async getCustomerById(@Param('id') id: string) {
    try {
      return this.service.getCustomerById(id);
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Create new customer
   * @param body Customer data
   */
  @Post()
  public async createCustomer(@Body() body: Partial<Customer>) {
    try {
      const customer = await this.service.createCustomer(body);
      return { 
        message: 'Customer created successfully', 
        status: HttpStatus.CREATED,
        data: customer 
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Update customer
   * @param id Customer ID
   * @param body Customer data
   */
  @Put(':id')
  public async updateCustomer(@Param('id') id: string, @Body() body: Partial<Customer>) {
    try {
      const customer = await this.service.updateCustomer(id, body);
      return { 
        message: 'Customer updated successfully', 
        status: HttpStatus.OK,
        data: customer 
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Delete customer
   * @param id Customer ID
   */
  @Delete(':id')
  public async deleteCustomer(@Param('id') id: string) {
    try {
      await this.service.deleteCustomer(id);
      return { 
        message: 'Customer deleted successfully', 
        status: HttpStatus.OK 
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Add station to customer
   * @param id Customer ID
   * @param body Station assignment data
   */
  @Post(':id/stations')
  public async addStationToCustomer(
    @Param('id') id: string, 
    @Body('stationId') stationId: string
  ) {
    try {
      const customer = await this.service.addStationToCustomer(id, stationId);
      return { 
        message: 'Station added to customer successfully', 
        status: HttpStatus.OK,
        data: customer 
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Remove station from customer
   * @param id Customer ID
   * @param stationId Station ID
   */
  @Delete(':id/stations/:stationId')
  public async removeStationFromCustomer(
    @Param('id') id: string,
    @Param('stationId') stationId: string
  ) {
    try {
      const customer = await this.service.removeStationFromCustomer(id, stationId);
      return { 
        message: 'Station removed from customer successfully', 
        status: HttpStatus.OK,
        data: customer 
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}