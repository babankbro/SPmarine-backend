// src/repositories/tugboat.repository.ts
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as fastcsv from 'fast-csv';
import { Readable } from 'stream';

import { Tugboat } from '@/entities/tugboat.entity';
import { Station } from '@/entities/station.entity';

@Injectable()
export class TugboatRepository {
  constructor(
    @InjectRepository(Tugboat)
    private readonly entities: Repository<Tugboat>,
    @InjectRepository(Station)
    private readonly stationEntities: Repository<Station>,
  ) {}

  /**
   * Get all tugboats with their associated stations
   * @returns Promise<Tugboat[]>
   */
  public async getTugboats(): Promise<Tugboat[]> {
    return this.entities.find({
      relations: {
        station: true
      },
      order: {
        name: 'ASC',
        station: {
          name: 'ASC'
        }
      }
    });
  }

  /**
   * Get tugboat by ID with station
   * @param id Tugboat ID
   * @returns Promise<Tugboat | null>
   */
  public async getTugboatById(id: string): Promise<Tugboat | null> {
    const tugboat = await this.entities.findOne({
      where: { id },
      relations: {
        station: true
      }
    });
    
    if (!tugboat) {
      throw new NotFoundException(`Tugboat with ID ${id} not found`);
    }

    return tugboat;
  }

  /**
   * Get tugboats by station ID
   * @param stationId Station ID
   * @returns Promise<Tugboat[]>
   */
  public async getTugboatsByStation(stationId: string): Promise<Tugboat[]> {
    return this.entities.find({
      relations: {
        station: true
      },
      where: {
        station: {
          id: stationId
        }
      }
    });
  }

  /**
   * Create new tugboat
   * @param tugboat Tugboat data
   * @returns Promise<Tugboat>
   */
  public async createTugboat(tugboat: Partial<Tugboat>): Promise<Tugboat | null> {
    // Check if tugboat ID already exists
    const existingTugboat = await this.entities.findOne({ 
      where: { id: tugboat.id } 
    }).catch(() => null);
    
    if (existingTugboat) {
      throw new ConflictException(`Tugboat with ID ${tugboat.id} already exists`);
    }

    const newTugboat = this.entities.create(tugboat);
    const saved = await this.entities.save(newTugboat);
    
    // Return with relations
    return this.getTugboatById(saved.id);
  }

  /**
   * Update tugboat information
   * @param id Tugboat ID
   * @param body Tugboat data
   */
  public async updateTugboat(id: string, body: Partial<Tugboat>) {
    const exists = await this.entities.findOneBy({ id });
    if (!exists) {
      throw new NotFoundException(`Tugboat with ID ${id} not found`);
    }

    await this.entities.update(id, body);
    
    // Return updated tugboat with relations
    return this.getTugboatById(id);
  }

  /**
   * Delete tugboat by ID
   * @param id Tugboat ID
   */
  public async deleteTugboat(id: string): Promise<void> {
    const exists = await this.entities.findOneBy({ id });
    if (!exists) {
      throw new NotFoundException(`Tugboat with ID ${id} not found`);
    }

    // Delete the tugboat
    await this.entities.delete(id);
  }

  /**
   * Delete multiple tugboats by IDs
   * @param ids Array of tugboat IDs
   */
  public async deleteMultipleTugboats(ids: string[]): Promise<void> {
    if (!ids || !ids.length) throw new Error('No IDs provided');

    // Check if all tugboats exist
    for (const id of ids) {
      const exists = await this.entities.findOneBy({ id });
      if (!exists) {
        throw new NotFoundException(`Tugboat with ID ${id} not found`);
      }
    }

    await this.entities.delete(ids);
  }

  /**
   * Assign station to tugboat
   * @param tugboatId Tugboat ID
   * @param stationId Station ID
   */
  public async assignStationToTugboat(tugboatId: string, stationId: string): Promise<Tugboat | null> {
    // Verify tugboat exists
    const tugboat = await this.entities.findOne({
      where: { id: tugboatId },
      relations: { station: true }
    });

    if (!tugboat) {
      throw new NotFoundException(`Tugboat with ID ${tugboatId} not found`);
    }

    // Verify station exists
    const station = await this.stationEntities.findOne({ where: { id: stationId } });
    if (!station) {
      throw new NotFoundException(`Station with ID ${stationId} not found`);
    }

    // Update tugboat's station
    await this.entities.update(tugboatId, { stationId });

    return this.getTugboatById(tugboatId);
  }

  /**
   * Remove station from tugboat
   */
  public async removeStationFromTugboat(tugboatId: string): Promise<Tugboat | null> {
    // Verify tugboat exists
    const tugboat = await this.entities.findOne({
      where: { id: tugboatId },
      relations: { station: true }
    });

    if (!tugboat) {
      throw new NotFoundException(`Tugboat with ID ${tugboatId} not found`);
    }

    // Remove station assignment
    await this.entities.update(tugboatId, { stationId: undefined });

    return this.getTugboatById(tugboatId);
  }

  /**
   * CSV upload functionality
   * @param buffer CSV buffer
   * @returns Promise<Tugboat[]>
   */
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
            waterStatus: row.WaterStatus as 'SEA' | 'RIVER',
            readyDatetime: new Date(row.ReadyDateTime),
            stationId: row.StationId,
          });

          if (process.env.DEBUG) {
            console.log(tugboat);
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

  // Legacy methods for backward compatibility
  public async createNewTugboat(tugboat: Tugboat) {
    return this.createTugboat(tugboat);
  }

  public async removeById(id: string): Promise<void> {
    return this.deleteTugboat(id);
  }
}