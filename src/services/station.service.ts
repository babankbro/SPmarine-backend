import { Injectable } from '@nestjs/common';

import { Station } from '@/entities/station.entity';
import { StationRepository } from '@/repositories/station.repository';

@Injectable()
export class StationService {
  constructor(private readonly repository: StationRepository) {}

  public async getOrder(): Promise<Station[]> {
    return await this.repository.getStations();
  }

  public async getStationById(id: string): Promise<Station | null> {
    return await this.repository.getStationById(id);
  }

  public async createNewStation(station: Station) {
    return await this.repository.createNewStation(station);
  }
}
