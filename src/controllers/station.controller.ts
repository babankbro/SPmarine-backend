// src/controllers/station.controller.ts
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

import { StationService } from '@/services/station.service';
import { Station } from '@/entities/station.entity';

interface CreateStationDto {
  id: string;
  name: string;
  type: 'SEA' | 'RIVER';
  latitude: number;
  longitude: number;
  distanceKm: number;
}

interface UpdateStationDto {
  name?: string;
  type?: 'SEA' | 'RIVER';
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

@Controller('/v1/stations')
export class StationController {
  constructor(private readonly service: StationService) {}

  /**
   * Get all stations with optional filtering
   * @param type Optional filter by station type
   * @param search Optional search by name
   * @param maxDistance Optional filter by maximum distance
   */
  @Get('/')
  public async getStations(
    @Query('type') type?: 'SEA' | 'RIVER',
    @Query('search') search?: string,
    @Query('maxDistance') maxDistance?: string
  ) {
    try {
      if (search) {
        return this.service.searchStationsByName(search);
      }
      
      if (maxDistance) {
        const distance = parseFloat(maxDistance);
        if (isNaN(distance) || distance < 0) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              response: 'Invalid maxDistance parameter',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        return this.service.getStationsWithinDistance(distance);
      }
      
      if (type) {
        return this.service.getStationsByType(type);
      }
      
      return this.service.getStations();
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
   * Get station by ID
   * @param id Station ID
   */
  @Get('statistics')
  public async getStationStatistics() {
    try {
      return this.service.getStationStatistics();
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
   * Get station by ID
   * @param id Station ID
   */
  @Get(':id')
  public async getStationById(@Param('id') id: string) {
    try {
      const station = await this.service.getStationById(id);
      if (!station) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            response: `Station with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return station;
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
   * Create new station
   * @param body Station data
   */
  @Post()
  public async createStation(@Body() body: CreateStationDto) {
    try {
      // Validate required fields
      if (!body.id || !body.name || body.latitude === undefined || body.longitude === undefined || body.distanceKm === undefined) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Missing required fields: id, name, latitude, longitude, distanceKm',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate data types
      if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number' || typeof body.distanceKm !== 'number') {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Latitude, longitude, and distanceKm must be numbers',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if station ID already exists
      const existingStation = await this.service.getStationById(body.id).catch(() => null);
      if (existingStation) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            response: `Station with ID ${body.id} already exists`,
          },
          HttpStatus.CONFLICT,
        );
      }

      const station = await this.service.createStation(body);
      return { 
        message: 'Station created successfully', 
        status: HttpStatus.CREATED,
        data: station 
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
   * Update station information
   * @param id Station ID
   * @param body Station data
   */
  @Put(':id')
  public async updateStation(@Param('id') id: string, @Body() body: UpdateStationDto) {
    try {
      console.log(`PUT /stations/${id} called with body:`, body);
      
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Invalid station ID format',
            error: 'INVALID_ID_FORMAT'
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate data types if provided
      if (body.latitude !== undefined && typeof body.latitude !== 'number') {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Latitude must be a number',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (body.longitude !== undefined && typeof body.longitude !== 'number') {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Longitude must be a number',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (body.distanceKm !== undefined && typeof body.distanceKm !== 'number') {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'DistanceKm must be a number',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const station = await this.service.updateStation(id.trim(), body);
      console.log('Station updated successfully:', station);
      
      return { 
        message: 'Station updated successfully', 
        status: HttpStatus.OK,
        data: station 
      };
    } catch (e) {
      console.error(`Error in updateStation for ID "${id}":`, e);
      
      if (e instanceof HttpException) {
        throw e;
      }
      
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: e.message ?? 'Bad Request',
          error: 'UPDATE_STATION_ERROR'
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Delete station
   * @param id Station ID
   */
  @Delete(':id')
  public async deleteStation(@Param('id') id: string) {
    try {
      console.log(`DELETE /stations/${id} called`);
      await this.service.deleteStation(id);
      return { 
        message: 'Station deleted successfully', 
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
   * Delete multiple stations by IDs
   * @param body Array of station IDs
   */
  @Delete()
  public async deleteMultipleStations(@Body('id') ids: string[]) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'No station IDs provided',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.service.deleteMultipleStations(ids);
      return { 
        message: 'Stations deleted successfully', 
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
   * Get stations by type
   * @param type Station type
   */
  @Get('type/:type')
  public async getStationsByType(@Param('type') type: string) {
    try {
      if (type !== 'SEA' && type !== 'RIVER') {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            response: 'Invalid station type. Must be SEA or RIVER',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return this.service.getStationsByType(type as 'SEA' | 'RIVER');
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

  // Legacy methods for backward compatibility
  @Get('/')
  public async getOrder() {
    return this.getStations();
  }

  @Post()
  public async createNewStation(@Body() station: Station) {
    return this.createStation(station);
  }
}