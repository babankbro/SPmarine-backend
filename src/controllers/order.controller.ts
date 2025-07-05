import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpException,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { OrderService } from '@/services/order.service';
import { Order } from '@/entities/order.entity';

@Controller('/v1/orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  /**
   * Get all orders with optional filtering
   */
  @Get('/')
  public async getOrders(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('stationId') stationId?: string,
    @Query('search') search?: string
  ) {
    try {
      const filters = {
        type,
        status,
        stationId,
        search
      };
      return await this.service.getOrders(filters);
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
   * Get order by ID
   */
  @Get(':id')
  public async getOrderById(@Param('id') id: string) {
    try {
      const order = await this.service.getOrderById(id);
      if (!order) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            response: `Order with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return order;
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
   * Create new order
   */
  @Post()
  public async createOrder(@Body() orderData: any) {
    try {
      console.log('Creating order with data:', orderData);
      
      // Generate ID if not provided
      if (!orderData.id) {
        orderData.id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      const newOrder = await this.service.createOrder(orderData);
      return {
        message: 'Order created successfully',
        status: HttpStatus.CREATED,
        data: newOrder
      };
    } catch (e) {
      console.error('Error creating order:', e);
      
      if (e.message?.includes('already exists')) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            response: e.message,
          },
          HttpStatus.CONFLICT,
        );
      }
      
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Failed to create order',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Update order
   */
  @Put(':id')
  public async updateOrder(@Param('id') id: string, @Body() body: any) {
    try {
      console.log(`PUT /orders/${id} called with body:`, body);
      
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Invalid order ID format',
            error: 'INVALID_ID_FORMAT'
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedOrder = await this.service.updateOrder(id.trim(), body);
      console.log('Order updated successfully:', updatedOrder);
      
      return { 
        message: 'Order updated successfully', 
        status: HttpStatus.OK,
        data: updatedOrder 
      };
    } catch (e) {
      console.error(`Error in updateOrder for ID "${id}":`, e);
      
      if (e.message?.includes('not found')) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            response: e.message,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Bad Request',
          error: 'UPDATE_ORDER_ERROR'
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Delete order by ID
   */
  @Delete(':id')
  public async deleteById(@Param('id') id: string) {
    try {
      console.log(`DELETE /orders/${id} called`);
      await this.service.deleteById(id);
      return { 
        message: 'Order deleted successfully', 
        status: HttpStatus.OK 
      };
    } catch (e) {
      if (e.message?.includes('not found')) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            response: e.message,
          },
          HttpStatus.NOT_FOUND,
        );
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
   * Delete multiple orders
   */
  @Delete()
  public async deleteMultipleOrders(@Body('ids') ids: string[]) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'No order IDs provided',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.service.deleteMultiId(ids);
      return { 
        message: 'Orders deleted successfully', 
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
   * Check if order exists (HEAD request)
   */
  @Get(':id/exists')
  public async checkOrderExists(@Param('id') id: string) {
    try {
      const exists = await this.service.checkOrderExists(id);
      return { exists };
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
   * Upload CSV file to create multiple orders
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadCsv(
    @UploadedFile() csv: Express.Multer.File,
  ): Promise<{ success: boolean; data: Order[] }> {
    if (!csv)
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);

    try {
      const data = await this.service.upload(csv.buffer);
      return { success: true, data: data };
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
   * Get order statistics
   */
  @Get('statistics')
  public async getOrderStatistics() {
    try {
      const stats = await this.service.getOrderStatistics();
      return {
        success: true,
        message: 'Order statistics retrieved successfully',
        status: HttpStatus.OK,
        data: stats
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