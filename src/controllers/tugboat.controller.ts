import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpException,
  Param,
  Body,
  Delete,
  Put,
  HttpCode,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { TugboatService } from '@/services/tugboat.service';
import { Tugboat } from '@/entities/tugboat.entity';

@Controller('/v1/tugboats')
export class TugboatController {
  constructor(private readonly service: TugboatService) {}

  @Get('/')
  public async getTugboats() {
    try {
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

  @Get(':id')
  public getTugboatById(@Param('id') id: string) {
    try {
      return this.service.getTugboatById(id);
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
  public async createNewTugboat(
    @Body() tugboat: Tugboat,
  ): Promise<{ message: string; status: number }> {
    try {
      await this.service.createNewTugboat(tugboat);
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

  @Put(':id')
  public async updateTugboat(
    @Param('id') id: string,
    @Body() body: {}
  ) {
    try {

      return { message: "", status: HttpStatus.OK };
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
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteById(@Param('id') id: string): Promise<void> {
    try {
      await this.service.deleteById(id);
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
