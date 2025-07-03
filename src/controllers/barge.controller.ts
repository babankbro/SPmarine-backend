// src/controllers/barge.controller.ts
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

import { BargeService } from '@/services/barge.service';
import { Barge } from '@/entities/barge.entity';

interface CreateBargeDto {
  id: string;
  name: string;
  weight: number;
  capacity: number;
  waterStatus: 'SEA' | 'RIVER';
  stationId?: string;
  setupTime: number;
  readyDatetime: Date | string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

interface UpdateBargeDto {
  name?: string;
  weight?: number;
  capacity?: number;
  waterStatus?: 'SEA' | 'RIVER';
  stationId?: string;
  setupTime?: number;
  readyDatetime?: Date | string;
  // latitude?: number;
  // longitude?: number;
  distanceKm?: number;
}

@Controller('/v1/barges')
export class BargeController {
  constructor(private readonly service: BargeService) {}

  /**
   * Get all barges with their stations
   * @param stationId Optional filter by station ID
   */
  @Get('/')
  public async getBarges(@Query('stationId') stationId?: string) {
    try {
      if (stationId) {
        return this.service.getBargesByStation(stationId);
      }
      return this.service.getBarges();
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
   * Get barge by ID with station
   * @param id Barge ID
   */
  @Get(':id')
  public async getBargeById(@Param('id') id: string) {
    try {
      const barge = await this.service.getBargeById(id);
      if (!barge) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            response: `Barge with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return barge;
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
   * Create new barge with optional station association
   * @param body Barge data with optional station ID
   */
  @Post()
  public async createBarge(@Body() body: CreateBargeDto) {
    try {
      // Validate required fields
      if (!body.id || !body.name || !body.weight || !body.capacity || !body.setupTime) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Missing required fields: id, name, weight, capacity, setupTime',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if barge ID already exists
      const existingBarge = await this.service.getBargeById(body.id).catch(() => null);
      if (existingBarge) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            response: `Barge with ID ${body.id} already exists`,
          },
          HttpStatus.CONFLICT,
        );
      }

      const barge = await this.service.createBarge(body);
      return { 
        message: 'Barge created successfully', 
        status: HttpStatus.CREATED,
        data: barge 
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
   * Update barge information and station assignment
   */
  @Put(':id')
  public async updateBarge(@Param('id') id: string, @Body() body: UpdateBargeDto) {
    try {
      console.log(`PUT /barges/${id} called with body:`, body);
      
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Invalid barge ID format',
            error: 'INVALID_ID_FORMAT'
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const barge = await this.service.updateBarge(id.trim(), body);
      console.log('Barge updated successfully:', barge);
      
      return { 
        message: 'Barge updated successfully', 
        status: HttpStatus.OK,
        data: barge 
      };
    } catch (e) {
      console.error(`Error in updateBarge for ID "${id}":`, e);
      
      if (e instanceof HttpException) {
        throw e;
      }
      
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Bad Request',
          error: 'UPDATE_BARGE_ERROR'
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Delete barge and station association
   * @param id Barge ID
   */
  @Delete(':id')
  public async deleteBarge(@Param('id') id: string) {
    try {
      console.log(`DELETE /barges/${id} called`);
      await this.service.deleteBarge(id);
      return { 
        message: 'Barge deleted successfully', 
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
   * Delete multiple barges by IDs
   * @param body Array of barge IDs
   */
  @Delete()
  public async deleteMultipleBarges(@Body('id') ids: string[]) {
    try {
      await this.service.deleteMultipleBarges(ids);
      return { 
        message: 'Barges deleted successfully', 
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
   * Add station to barge
   * @param id Barge ID
   * @param body Station assignment data
   */
  @Post(':id/stations')
  public async addStationToBarge(
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

      const barge = await this.service.assignStationToBarge(id, stationId);
      return { 
        message: 'Station assigned to barge successfully', 
        status: HttpStatus.OK,
        data: barge 
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
   * Remove station from barge
   * @param id Barge ID
   */
  @Delete(':id/stations')
  public async removeStationFromBarge(@Param('id') id: string) {
    try {
      const barge = await this.service.removeStationFromBarge(id);
      return { 
        message: 'Station removed from barge successfully', 
        status: HttpStatus.OK,
        data: barge 
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