import {
  Controller,
  Get,
  Post,
  HttpStatus,
  HttpException,
  Param,
  Body,
} from '@nestjs/common';

import { StationService } from '@/services/station.service';
import { Station } from '@/entities/station.entity';

@Controller('/v1/stations')
export class StationController {
  constructor(private readonly service: StationService) {}

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

  @Get(':id')
  public getStationById(@Param('id') id: string) {
    try {
      return this.service.getStationById(id);
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

  @Post()
  public async createNewStation(@Body() station: Station) {
    try {
      await this.service.createNewStation(station);
      return { message: 'successfully', status: HttpStatus.OK };
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
