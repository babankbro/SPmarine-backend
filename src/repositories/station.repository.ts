// src/repositories/station.repository.ts
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

  /**
   * Get all stations
   * @returns Promise<Station[]>
   */
  public async getStations(): Promise<Station[]> {
    return this.entities.find({
      relations: {
        barges: true,
        tugboats: true,
        customers: true
      },
      order: {
        name: 'ASC'
      }
    });
  }

  /**
   * Get station by ID
   * @param id Station ID
   * @returns Promise<Station | null>
   */
  public async getStationById(id: string): Promise<Station | null> {
    const station = await this.entities.findOne({
      where: { id },
      relations: {
        barges: true,
        tugboats: true,
        customers: true,
        start_stations: true,
        dest_stations: true
      }
    });
    
    if (!station) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }

    return station;
  }

  /**
   * Create new station
   * @param station Station data
   * @returns Promise<Station>
   */
  public async createStation(station: Partial<Station>): Promise<Station | null> {
    // Check if station ID already exists
    const existingStation = await this.entities.findOne({ 
      where: { id: station.id } 
    }).catch(() => null);
    
    if (existingStation) {
      throw new ConflictException(`Station with ID ${station.id} already exists`);
    }

    const newStation = this.entities.create(station);
    const saved = await this.entities.save(newStation);
    
    // Return with relations
    return this.getStationById(saved.id);
  }

  /**
   * Update station information
   * @param id Station ID
   * @param body Station data
   */
  public async updateStation(id: string, body: Partial<Station>): Promise<Station | null> {
    const exists = await this.entities.findOneBy({ id });
    if (!exists) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }

    await this.entities.update(id, body);
    
    // Return updated station with relations
    return this.getStationById(id);
  }

  /**
   * Delete station by ID
   * @param id Station ID
   */
  public async deleteStation(id: string): Promise<void> {
    const exists = await this.entities.findOneBy({ id });
    if (!exists) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }

    // Check if station has any associated entities
    const stationWithRelations = await this.entities.findOne({
      where: { id },
      relations: {
        barges: true,
        tugboats: true,
        customers: true,
        start_stations: true,
        dest_stations: true
      }
    });

    if (stationWithRelations) {
      const hasAssociations = 
        (stationWithRelations.barges && stationWithRelations.barges.length > 0) ||
        (stationWithRelations.tugboats && stationWithRelations.tugboats.length > 0) ||
        (stationWithRelations.customers && stationWithRelations.customers.length > 0) ||
        (stationWithRelations.start_stations && stationWithRelations.start_stations.length > 0) ||
        (stationWithRelations.dest_stations && stationWithRelations.dest_stations.length > 0);

      if (hasAssociations) {
        throw new ConflictException(
          `Cannot delete station ${id} as it has associated barges, tugboats, customers, or orders`
        );
      }
    }

    // Delete the station
    await this.entities.delete(id);
  }

  /**
   * Delete multiple stations by IDs
   * @param ids Array of station IDs
   */
  public async deleteMultipleStations(ids: string[]): Promise<void> {
    if (!ids || !ids.length) throw new Error('No IDs provided');

    // Check if all stations exist and can be deleted
    for (const id of ids) {
      const exists = await this.entities.findOneBy({ id });
      if (!exists) {
        throw new NotFoundException(`Station with ID ${id} not found`);
      }

      // Check for associations
      const stationWithRelations = await this.entities.findOne({
        where: { id },
        relations: {
          barges: true,
          tugboats: true,
          customers: true,
          start_stations: true,
          dest_stations: true
        }
      });

      if (stationWithRelations) {
        const hasAssociations = 
          (stationWithRelations.barges && stationWithRelations.barges.length > 0) ||
          (stationWithRelations.tugboats && stationWithRelations.tugboats.length > 0) ||
          (stationWithRelations.customers && stationWithRelations.customers.length > 0) ||
          (stationWithRelations.start_stations && stationWithRelations.start_stations.length > 0) ||
          (stationWithRelations.dest_stations && stationWithRelations.dest_stations.length > 0);

        if (hasAssociations) {
          throw new ConflictException(
            `Cannot delete station ${id} as it has associated entities`
          );
        }
      }
    }

    await this.entities.delete(ids);
  }

  /**
   * Get stations by type
   * @param type Station type ('SEA' | 'RIVER')
   * @returns Promise<Station[]>
   */
  public async getStationsByType(type: 'SEA' | 'RIVER'): Promise<Station[]> {
    return this.entities.find({
      where: { type },
      relations: {
        barges: true,
        tugboats: true,
        customers: true
      },
      order: {
        name: 'ASC'
      }
    });
  }

  /**
   * Get stations within distance range
   * @param maxDistance Maximum distance in km
   * @returns Promise<Station[]>
   */
  public async getStationsWithinDistance(maxDistance: number): Promise<Station[]> {
    return this.entities
      .createQueryBuilder('station')
      .leftJoinAndSelect('station.barges', 'barges')
      .leftJoinAndSelect('station.tugboats', 'tugboats')
      .leftJoinAndSelect('station.customers', 'customers')
      .where('station.distanceKm <= :maxDistance', { maxDistance })
      .orderBy('station.distanceKm', 'ASC')
      .getMany();
  }
  public async searchStationsByName(searchTerm: string): Promise<Station[]> {
    return this.entities
      .createQueryBuilder('station')
      .leftJoinAndSelect('station.barges', 'barges')
      .leftJoinAndSelect('station.tugboats', 'tugboats')
      .leftJoinAndSelect('station.customers', 'customers')
      .where('station.name LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orderBy('station.name', 'ASC')
      .getMany();
  }

  /**
   * Get station statistics
   * @returns Promise<any>
   */
  public async getStationStatistics(): Promise<any> {
    const queryBuilder = this.entities.createQueryBuilder('station');
    
    const result = await queryBuilder
      .select([
        'COUNT(*) as total',
        'SUM(CASE WHEN station.type = "SEA" THEN 1 ELSE 0 END) as seaStations',
        'SUM(CASE WHEN station.type = "RIVER" THEN 1 ELSE 0 END) as riverStations',
        'AVG(station.distanceKm) as averageDistance',
        'MAX(station.distanceKm) as maxDistance',
        'MIN(station.distanceKm) as minDistance'
      ])
      .getRawOne();

    return {
      total: parseInt(result.total) || 0,
      seaStations: parseInt(result.seaStations) || 0,
      riverStations: parseInt(result.riverStations) || 0,
      averageDistance: parseFloat(result.averageDistance) || 0,
      maxDistance: parseFloat(result.maxDistance) || 0,
      minDistance: parseFloat(result.minDistance) || 0,
    };
  }

  // Legacy method names for backward compatibility
  public async createNewStation(station: Station): Promise<Station | null> {
    return this.createStation(station);
  }

  public async getOrder(): Promise<Station[]> {
    return this.getStations();
  }
}