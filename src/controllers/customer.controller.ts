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

interface CreateCustomerDto {
  id: string;
  name: string;
  email: string;
  address: string;
  stationIds?: string[];
}

interface UpdateCustomerDto {
  name?: string;
  email?: string;
  address?: string;
  stationIds?: string[];
}

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
      const customer = await this.service.getCustomerById(id);
      if (!customer) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            response: `Customer with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return customer;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
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
   * Create new customer with optional station associations
   * @param body Customer data with optional station IDs
   */
  @Post()
  public async createCustomer(@Body() body: CreateCustomerDto) {
    try {
      // Validate required fields
      if (!body.id || !body.name || !body.email || !body.address) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Missing required fields: id, name, email, address',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if customer ID already exists
      const existingCustomer = await this.service.getCustomerById(body.id).catch(() => null);
      if (existingCustomer) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            response: `Customer with ID ${body.id} already exists`,
          },
          HttpStatus.CONFLICT,
        );
      }

      const customer = await this.service.createCustomer(body);
      return { 
        message: 'Customer created successfully', 
        status: HttpStatus.CREATED,
        data: customer 
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
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
   * Update customer information and station associations
   * @param id Customer ID
   * @param body Customer data
   */
  @Put(':id')
  public async updateCustomer(@Param('id') id: string, @Body() body: UpdateCustomerDto) {
    try {
      const customer = await this.service.updateCustomer(id, body);
      return { 
        message: 'Customer updated successfully', 
        status: HttpStatus.OK,
        data: customer 
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
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
   * Delete customer and all station associations
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
      if (e instanceof HttpException) {
        throw e;
      }
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
      if (!stationId) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Station ID is required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const customer = await this.service.addStationToCustomer(id, stationId);
      return { 
        message: 'Station added to customer successfully', 
        status: HttpStatus.OK,
        data: customer 
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
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
      if (e instanceof HttpException) {
        throw e;
      }
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