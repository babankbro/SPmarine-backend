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
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { CarrierService } from '@/services/carrier.service';
import { Carrier } from '@/entities/carrier.entity';
import { CreateCarrierDto, UpdateCarrierDto } from '@/repositories/carrier.repository';

@Controller('/v1/carriers')
export class CarrierController {
  constructor(private readonly service: CarrierService) {}

  /**
   * Get all carriers with filtering and pagination
   */
  @Get('/')
  public async getCarriers(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    try {
      const options = {
        search,
        status,
        sortBy,
        sortOrder,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      };

      const result = await this.service.getCarriers(options);
      
      return {
        success: true,
        message: 'Carriers retrieved successfully',
        status: HttpStatus.OK,
        ...result
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
   * Get carrier by ID
   */
  @Get(':id')
  public async getCarrierById(@Param('id') id: string) {
    try {
      const carrier = await this.service.getCarrierById(id);
      return {
        success: true,
        message: 'Carrier retrieved successfully',
        status: HttpStatus.OK,
        data: carrier
      };
    } catch (e) {
      if (e.message.includes('not found')) {
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
   * Create new carrier
   */
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  public async createCarrier(@Body() body: CreateCarrierDto) {
    try {
      const carrier = await this.service.createCarrier(body);
      return {
        success: true,
        message: 'Carrier created successfully',
        status: HttpStatus.CREATED,
        data: carrier
      };
    } catch (e) {
      if (e.message.includes('already exists')) {
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
          response: e.message ?? 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Update carrier
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  public async updateCarrier(@Param('id') id: string, @Body() body: UpdateCarrierDto) {
    try {
      console.log(`PUT /carriers/${id} called with body:`, body);
      
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Invalid carrier ID format',
            error: 'INVALID_ID_FORMAT'
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const carrier = await this.service.updateCarrier(id.trim(), body);
      console.log('Carrier updated successfully:', carrier);
      
      return {
        success: true,
        message: 'Carrier updated successfully',
        status: HttpStatus.OK,
        data: carrier
      };
    } catch (e) {
      console.error(`Error in updateCarrier for ID "${id}":`, e);
      
      if (e.message.includes('not found')) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            response: e.message,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      
      if (e.message.includes('already exists')) {
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
          response: e.message ?? 'Bad Request',
          error: 'UPDATE_CARRIER_ERROR'
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Delete carrier
   */
  @Delete(':id')
  public async deleteCarrier(@Param('id') id: string) {
    try {
      console.log(`DELETE /carriers/${id} called`);
      await this.service.deleteCarrier(id);
      return {
        success: true,
        message: 'Carrier deleted successfully',
        status: HttpStatus.OK
      };
    } catch (e) {
      if (e.message.includes('not found')) {
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
   * Delete multiple carriers
   */
  @Delete()
  public async deleteMultipleCarriers(@Body('ids') ids: string[]) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'No carrier IDs provided',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.service.deleteMultipleCarriers(ids);
      return {
        success: true,
        message: 'Carriers deleted successfully',
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
   * Get carrier statistics
   */
  @Get('statistics')
  public async getCarrierStatistics() {
    try {
      const stats = await this.service.getCarrierStatistics();
      return {
        success: true,
        message: 'Carrier statistics retrieved successfully',
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