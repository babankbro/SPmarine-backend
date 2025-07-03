// src/repositories/barge.repository.ts
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { Barge } from '@/entities/barge.entity';
import { Station } from '@/entities/station.entity';

@Injectable()
export class BargeRepository {
  constructor(
    @InjectRepository(Barge)
    private readonly entities: Repository<Barge>,
    @InjectRepository(Station)
    private readonly stationEntities: Repository<Station>,
  ) {}

  /**
   * Get all barges with their associated stations
   * @returns Promise<Barge[]>
   */
  public async getBarges(): Promise<Barge[]> {
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
   * Get barge by ID with station
   * @param id Barge ID
   * @returns Promise<Barge | null>
   */
  public async getBargeById(id: string): Promise<Barge | null> {
    const barge = await this.entities.findOne({
      where: { id },
      relations: {
        station: true
      }
    });
    
    if (!barge) {
      throw new NotFoundException(`Barge with ID ${id} not found`);
    }

    return barge;
  }

  /**
   * Get barges by station ID
   * @param stationId Station ID
   * @returns Promise<Barge[]>
   */
  public async getBargesByStation(stationId: string): Promise<Barge[]> {
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
   * Create new barge
   * @param barge Barge data
   * @returns Promise<Barge>
   */
  public async createBarge(barge: Partial<Barge>): Promise<Barge | null> {
    // Check if barge ID already exists
    const existingBarge = await this.entities.findOne({ 
      where: { id: barge.id } 
    }).catch(() => null);
    
    if (existingBarge) {
      throw new ConflictException(`Barge with ID ${barge.id} already exists`);
    }

    const newBarge = this.entities.create(barge);
    const saved = await this.entities.save(newBarge);
    
    // Return with relations
    return this.getBargeById(saved.id);
  }

  /**
   * Update barge information
   * @param id Barge ID
   * @param body Barge data
   */
  public async updateBarge(id: string, body: Partial<Barge>) {
    const exists = await this.entities.findOneBy({ id });
    if (!exists) {
      throw new NotFoundException(`Barge with ID ${id} not found`);
    }

    await this.entities.update(id, body);
    
    // Return updated barge with relations
    return this.getBargeById(id);
  }

  /**
   * Delete barge by ID
   * @param id Barge ID
   */
  public async deleteBarge(id: string): Promise<void> {
    const exists = await this.entities.findOneBy({ id });
    if (!exists) {
      throw new NotFoundException(`Barge with ID ${id} not found`);
    }

    // Delete the barge
    await this.entities.delete(id);
  }

  /**
   * Delete multiple barges by IDs
   * @param ids Array of barge IDs
   */
  public async deleteMultipleBarges(ids: string[]): Promise<void> {
    if (!ids || !ids.length) throw new Error('No IDs provided');

    // Check if all barges exist
    for (const id of ids) {
      const exists = await this.entities.findOneBy({ id });
      if (!exists) {
        throw new NotFoundException(`Barge with ID ${id} not found`);
      }
    }

    await this.entities.delete(ids);
  }

  /**
   * Assign station to barge
   * @param bargeId Barge ID
   * @param stationId Station ID
   */
  public async assignStationToBarge(bargeId: string, stationId: string): Promise<Barge | null> {
    // Verify barge exists
    const barge = await this.entities.findOne({
      where: { id: bargeId },
      relations: { station: true }
    });

    if (!barge) {
      throw new NotFoundException(`Barge with ID ${bargeId} not found`);
    }

    // Verify station exists
    const station = await this.stationEntities.findOne({ where: { id: stationId } });
    if (!station) {
      throw new NotFoundException(`Station with ID ${stationId} not found`);
    }

    // Update barge's station
    await this.entities.update(bargeId, { stationId });

    return this.getBargeById(bargeId);
  }

  /**
   * Remove station from barge
   */
  public async removeStationFromBarge(bargeId: string): Promise<Barge | null> {
    // Verify barge exists
    const barge = await this.entities.findOne({
      where: { id: bargeId },
      relations: { station: true }
    });

    if (!barge) {
      throw new NotFoundException(`Barge with ID ${bargeId} not found`);
    }

    // Remove station assignment
    await this.entities.update(bargeId, { stationId: undefined });

    return this.getBargeById(bargeId);
  }

  // Legacy methods for backward compatibility
  public async createNewBarge(barge: Barge) {
    return this.createBarge(barge);
  }

  public async deleteById(id: string): Promise<void> {
    return this.deleteBarge(id);
  }

  public async deleteMultiId(ids: string[]): Promise<void> {
    return this.deleteMultipleBarges(ids);
  }
}