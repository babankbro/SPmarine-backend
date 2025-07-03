// src/controllers/tugboat.controller.ts
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

import { TugboatService } from '@/services/tugboat.service';
import { Tugboat } from '@/entities/tugboat.entity';

interface CreateTugboatDto {
  id: string;
  name: string;
  maxCapacity: number;
  maxBarge: number;
  maxFuelCon: number;
  type: 'SEA' | 'RIVER';
  minSpeed: number;
  maxSpeed: number;
  engineRpm: number;
  horsePower: number;
  waterStatus: 'SEA' | 'RIVER';
  readyDatetime: Date | string;
  stationId?: string;
}

interface UpdateTugboatDto {
  name?: string;
  maxCapacity?: number;
  maxBarge?: number;
  maxFuelCon?: number;
  type?: 'SEA' | 'RIVER';
  minSpeed?: number;
  maxSpeed?: number;
  engineRpm?: number;
  horsePower?: number;
  waterStatus?: 'SEA' | 'RIVER';
  readyDatetime?: Date | string;
  stationId?: string;
}

@Controller('/v1/tugboats')
export class TugboatController {
  constructor(private readonly service: TugboatService) {}

  /**
   * Get all tugboats with their stations
   * @param stationId Optional filter by station ID
   */
  @Get('/')
  public async getTugboats(@Query('stationId') stationId?: string) {
    try {
      if (stationId) {
        return this.service.getTugboatsByStation(stationId);
      }
      return this.service.getTugboats();
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
   * Get tugboat by ID with station
   * @param id Tugboat ID
   */
  @Get(':id')
  public async getTugboatById(@Param('id') id: string) {
    try {
      const tugboat = await this.service.getTugboatById(id);
      if (!tugboat) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            response: `Tugboat with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return tugboat;
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
   * Create new tugboat with optional station association
   * @param body Tugboat data with optional station ID
   */
  @Post()
  public async createTugboat(@Body() body: CreateTugboatDto) {
    try {
      // Validate required fields
      if (!body.id || !body.name || !body.maxCapacity || !body.maxBarge || !body.maxFuelCon || !body.minSpeed || !body.maxSpeed || !body.engineRpm || !body.horsePower) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Missing required fields: id, name, maxCapacity, maxBarge, maxFuelCon, minSpeed, maxSpeed, engineRpm, horsePower',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if tugboat ID already exists
      const existingTugboat = await this.service.getTugboatById(body.id).catch(() => null);
      if (existingTugboat) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            response: `Tugboat with ID ${body.id} already exists`,
          },
          HttpStatus.CONFLICT,
        );
      }

      const tugboat = await this.service.createTugboat(body);
      return { 
        message: 'Tugboat created successfully', 
        status: HttpStatus.CREATED,
        data: tugboat 
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
   * Update tugboat information and station assignment
   */
  @Put(':id')
  public async updateTugboat(@Param('id') id: string, @Body() body: UpdateTugboatDto) {
    try {
      console.log(`PUT /tugboats/${id} called with body:`, body);
      
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Invalid tugboat ID format',
            error: 'INVALID_ID_FORMAT'
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const tugboat = await this.service.updateTugboat(id.trim(), body);
      console.log('Tugboat updated successfully:', tugboat);
      
      return { 
        message: 'Tugboat updated successfully', 
        status: HttpStatus.OK,
        data: tugboat 
      };
    } catch (e) {
      console.error(`Error in updateTugboat for ID "${id}":`, e);
      
      if (e instanceof HttpException) {
        throw e;
      }
      
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Bad Request',
          error: 'UPDATE_TUGBOAT_ERROR'
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Delete tugboat and station association
   * @param id Tugboat ID
   */
  @Delete(':id')
  public async deleteTugboat(@Param('id') id: string) {
    try {
      console.log(`DELETE /tugboats/${id} called`);
      await this.service.deleteTugboat(id);
      return { 
        message: 'Tugboat deleted successfully', 
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
   * Delete multiple tugboats by IDs
   * @param body Array of tugboat IDs
   */
  @Delete()
  public async deleteMultipleTugboats(@Body('id') ids: string[]) {
    try {
      await this.service.deleteMultipleTugboats(ids);
      return { 
        message: 'Tugboats deleted successfully', 
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
   * Add station to tugboat
   * @param id Tugboat ID
   * @param body Station assignment data
   */
  @Post(':id/stations')
  public async addStationToTugboat(
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

      const tugboat = await this.service.assignStationToTugboat(id, stationId);
      return { 
        message: 'Station assigned to tugboat successfully', 
        status: HttpStatus.OK,
        data: tugboat 
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
   * Remove station from tugboat
   * @param id Tugboat ID
   */
  @Delete(':id/stations')
  public async removeStationFromTugboat(@Param('id') id: string) {
    try {
      const tugboat = await this.service.removeStationFromTugboat(id);
      return { 
        message: 'Station removed from tugboat successfully', 
        status: HttpStatus.OK,
        data: tugboat 
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
   * Upload CSV file to create multiple tugboats
   * @param csv CSV file
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadCsv(
    @UploadedFile() csv: Express.Multer.File,
  ): Promise<{ success: boolean; data: Tugboat[] }> {
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
}