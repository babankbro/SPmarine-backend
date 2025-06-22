import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpException,
  Put,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { OrderService } from '@/services/order.service';
import { Order } from '@/entities/order.entity';

@Controller('/v1/orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Get('/')
  public async getOrder() {
    try {
      return this.service.getOrder();
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

    // CREATE new order - ADD THIS METHOD
  @Post()
  public async createOrder(@Body() orderData: any) {
    try {
      console.log('Creating order with data:', orderData);
      
      // Generate ID if not provided
      if (!orderData.id) {
        orderData.id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      const newOrder = await this.service.createOrder(orderData);
      return newOrder;
    } catch (e) {
      console.error('Error creating order:', e);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Failed to create order',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }


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

  @Put(':id')
  public async updateOrder(@Param('id') id: string, @Body() body: Order) {
    try {
      await this.service.updateOrder(id, body);

      return { message: '', status: HttpStatus.OK };
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

  @Delete(':id')
  public async deleteById(@Param('id') id: string) {
    try {
      await this.service.deleteById(id);

      return { message: 'Successfully deleted', status: HttpStatus.OK };
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

  @Delete()
  public async deleteMultiId(@Body('id') id: string[]) {
    try {
      await this.service.deleteMultiId(id);

      return { message: 'Successfully deleted', status: HttpStatus.OK };
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
