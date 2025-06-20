import {
  Controller,
  Get,
  Post,
  Put,
  HttpStatus,
  HttpException,
  Param,
  Body,
  Delete,
} from '@nestjs/common';

import { BargeService } from '@/services/barge.service';
import { Barge } from '@/entities/barge.entity';

@Controller('/v1/barges')
export class BargeController {
  constructor(private readonly service: BargeService) {}

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
  public getBargeById(@Param('id') id: string) {
    try {
      return this.service.getBargeById(id);
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
  public async createNewBarge(@Body() barge: Barge) {
    try {
      await this.service.createNewBarge(barge);
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

  @Put('id')
  public async updateBarge(@Param('id') id: string, @Body() barge: Barge) {
    try {
      await this.service.updateBarge(id, barge);

      return { message: 'Successfully updated', status: HttpStatus.OK };
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

  @Delete()
  public async deleteMultiId(@Body('id') id: string[]) {
    try {
      await this.service.deleteMultiId(id);

      return { message: 'successfully deleted', status: HttpStatus.OK };
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
