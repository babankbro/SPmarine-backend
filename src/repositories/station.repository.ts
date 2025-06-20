import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { Station } from '@/entities/station.entity';

@Injectable()
export class StationRepository {
  constructor(
    @InjectRepository(Station)
    private readonly entities: Repository<Station>,
  ) {}

  public async getStations(): Promise<Station[]> {
    return this.entities.find();
  }

  public async getStationById(id: string): Promise<Station | null> {
    return await this.entities.findOneBy({ id: id });
  }

  public async createNewStation(station: Station) {
    const exists = await this.entities.findOneBy({ id: station.id });
    if (!exists) {
      const newStation = this.entities.create(station);
      return this.entities.save(newStation);
    }

    throw new ConflictException(`${station.id} already exists.`);
  }

  public async updateStation(id: string, body: Station) {
    const exists = await this.entities.findOneBy({ id: id });
    if (!exists) throw new NotFoundException();

    await this.entities.update(id, body);
  }
}
