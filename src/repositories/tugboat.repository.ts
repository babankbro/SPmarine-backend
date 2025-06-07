import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as fastcsv from 'fast-csv';
import { Readable } from 'stream';

import { Tugboat } from '@/entities/tugboat.entity';

@Injectable()
export class TugboatRepository {
  constructor(
    @InjectRepository(Tugboat)
    private readonly entities: Repository<Tugboat>,
  ) {}

  public async getTugboats() {
    return this.entities.find();
  }

  public async getTugboatById(id: string): Promise<Tugboat | null> {
    return this.entities.findOneBy({ id: id });
  }

  public async createNewTugboat(tugboat: Tugboat) {
    const exists = await this.entities.findOneBy({ id: tugboat.id });
    if (!exists) {
      const newTugboat = this.entities.create(tugboat);
      return this.entities.save(newTugboat);
    }

    throw new ConflictException(`${tugboat.id} already exists.`);
  }

  public async upload(buffer: Buffer): Promise<Tugboat[]> {
    return new Promise((resolve, reject) => {
      const tugboats: Tugboat[] = [];

      Readable.from(buffer)
        .pipe(
          fastcsv.parse({
            headers: true,
            ignoreEmpty: true,
            encoding: 'utf-8',
          }),
        )
        .on('data', (row) => {
          const tugboat: Tugboat = this.entities.create({
            id: row.Id,
            name: row.Name,
            maxCapacity: parseInt(row.MaxCapacity),
            maxBarge: parseInt(row.MaxBarge),
            maxFuelCon: parseFloat(row.MaxFuelCon),
            type: row.Type as 'SEA' | 'RIVER',
            minSpeed: parseFloat(row.MinSpeed),
            maxSpeed: parseFloat(row.MaxSpeed),
            engineRpm: parseFloat(row.EngineRpm),
            horsePower: parseFloat(row.HorsePower),
            latitude: parseFloat(row.Latitude),
            longitude: parseFloat(row.Longitude),
            waterStatus: row.WaterStatus as 'SEA' | 'RIVER',
            distanceKm: parseFloat(row.DistanceKm),
            readyDatetime: new Date(row.ReadyDateTime),
          });

          if (process.env.DEBUG) {
            console.log(tugboats);
            return;
          }

          tugboats.push(tugboat);
        })
        .on('end', async () => {
          await this.entities.save(tugboats);
          resolve(tugboats);
        })
        .on('error', reject);
    });
  }

  public async updateTugboat(id: string, body: {}) {
  }

  public async removeById(id: string): Promise<void> {
    if (!(await this.entities.findOneBy({ id: id })))
      throw new ConflictException('Not Found');

    await this.entities.delete({ id: id });
  }
}
