// src/services/tugboat.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { Tugboat } from '@/entities/tugboat.entity';
import { TugboatRepository } from '@/repositories/tugboat.repository';

interface CreateTugboatData {
  id: string;
  name: string;
  maxCapacity: number;
  maxBarge: number;
  maxFuelCon: number;
  type: 'SEA' | 'RIVER';
  minSpeed: number;
  maxSpeed: number;
  engineRpm: number;
  horsePower: number;
  waterStatus: 'SEA' | 'RIVER';
  readyDatetime: Date | string;
  stationId?: string;
}

interface UpdateTugboatData {
  name?: string;
  maxCapacity?: number;
  maxBarge?: number;
  maxFuelCon?: number;
  type?: 'SEA' | 'RIVER';
  minSpeed?: number;
  maxSpeed?: number;
  engineRpm?: number;
  horsePower?: number;
  waterStatus?: 'SEA' | 'RIVER';
  readyDatetime?: Date | string;
  stationId?: string;
}

@Injectable()
export class TugboatService {
  constructor(private readonly repository: TugboatRepository) {}

  /**
   * Get all tugboats with their stations
   * @returns Promise<Tugboat[]>
   */
  public async getTugboats(): Promise<Tugboat[]> {
    return await this.repository.getTugboats();
  }

  /**
   * Get tugboat by ID with station
   * @param id Tugboat ID
   * @returns Promise<Tugboat>
   */
  public async getTugboatById(id: string): Promise<Tugboat | null> {
    return await this.repository.getTugboatById(id);
  }

  /**
   * Get tugboats by station ID
   * @param stationId Station ID
   * @returns Promise<Tugboat[]>
   */
  public async getTugboatsByStation(stationId: string): Promise<Tugboat[]> {
    return await this.repository.getTugboatsByStation(stationId);
  }

  /**
   * Create new tugboat with optional station association
   * @param tugboatData Tugboat data
   * @returns Promise<Tugboat>
   */
  public async createTugboat(tugboatData: CreateTugboatData): Promise<Tugboat | null> {
    // Validate required fields
    if (!tugboatData.id || !tugboatData.name) {
      throw new Error('ID and name are required');
    }

    // Validate numbers
    const numberFields = ['maxCapacity', 'maxBarge', 'maxFuelCon', 'minSpeed', 'maxSpeed', 'engineRpm', 'horsePower'];
    for (const field of numberFields) {
      const value = tugboatData[field as keyof CreateTugboatData];
      if (value !== undefined && (typeof value !== 'number' || value <= 0)) {
        throw new Error(`${field} must be a positive number`);
      }
    }

    // Speed validation
    if (tugboatData.minSpeed >= tugboatData.maxSpeed) {
      throw new Error('Max speed must be greater than min speed');
    }

    // Check if tugboat with this ID already exists
    const existingTugboat = await this.repository.getTugboatById(tugboatData.id).catch(() => null);
    if (existingTugboat) {
      throw new ConflictException(`Tugboat with ID ${tugboatData.id} already exists`);
    }

    // Create tugboat
    const tugboat = await this.repository.createTugboat({
      id: tugboatData.id,
      name: tugboatData.name.trim(),
      maxCapacity: tugboatData.maxCapacity,
      maxBarge: tugboatData.maxBarge,
      maxFuelCon: tugboatData.maxFuelCon,
      type: tugboatData.type || 'SEA',
      minSpeed: tugboatData.minSpeed,
      maxSpeed: tugboatData.maxSpeed,
      engineRpm: tugboatData.engineRpm,
      horsePower: tugboatData.horsePower,
      waterStatus: tugboatData.waterStatus || 'SEA',
      readyDatetime: tugboatData.readyDatetime ? new Date(tugboatData.readyDatetime) : new Date(),
      stationId: tugboatData.stationId ? tugboatData.stationId.trim() : undefined,
    });

    console.log(`Tugboat created: ${JSON.stringify(tugboat)}`);

    if (!tugboat) {
      throw new Error('Failed to create tugboat');
    }

    return tugboat;
  }

  /**
   * Update tugboat information and station association
   * @param id Tugboat ID
   * @param tugboatData Tugboat data
   * @returns Promise<Tugboat>
   */
  public async updateTugboat(id: string, tugboatData: UpdateTugboatData): Promise<Tugboat | null> {
    // Check if tugboat exists
    const existingTugboat = await this.repository.getTugboatById(id);
    if (!existingTugboat) {
      throw new NotFoundException(`Tugboat with ID ${id} not found`);
    }

    // Validate numbers if provided
    const numberFields = ['maxCapacity', 'maxBarge', 'maxFuelCon', 'minSpeed', 'maxSpeed', 'engineRpm', 'horsePower'];
    for (const field of numberFields) {
      const value = tugboatData[field as keyof UpdateTugboatData];
      if (value !== undefined && (typeof value !== 'number' || value <= 0)) {
        throw new Error(`${field} must be a positive number`);
      }
    }

    // Speed validation
    const minSpeed = tugboatData.minSpeed !== undefined ? tugboatData.minSpeed : existingTugboat.minSpeed;
    const maxSpeed = tugboatData.maxSpeed !== undefined ? tugboatData.maxSpeed : existingTugboat.maxSpeed;
    if (minSpeed !== undefined && maxSpeed !== undefined && minSpeed >= maxSpeed) {
      throw new Error('Max speed must be greater than min speed');
    }

    // Update basic tugboat information
    const updateData: Partial<Tugboat> = {};
    if (tugboatData.name !== undefined) updateData.name = tugboatData.name.trim();
    if (tugboatData.maxCapacity !== undefined) updateData.maxCapacity = tugboatData.maxCapacity;
    if (tugboatData.maxBarge !== undefined) updateData.maxBarge = tugboatData.maxBarge;
    if (tugboatData.maxFuelCon !== undefined) updateData.maxFuelCon = tugboatData.maxFuelCon;
    if (tugboatData.type !== undefined) updateData.type = tugboatData.type;
    if (tugboatData.minSpeed !== undefined) updateData.minSpeed = tugboatData.minSpeed;
    if (tugboatData.maxSpeed !== undefined) updateData.maxSpeed = tugboatData.maxSpeed;
    if (tugboatData.engineRpm !== undefined) updateData.engineRpm = tugboatData.engineRpm;
    if (tugboatData.horsePower !== undefined) updateData.horsePower = tugboatData.horsePower;
    if (tugboatData.waterStatus !== undefined) updateData.waterStatus = tugboatData.waterStatus;
    if (tugboatData.readyDatetime !== undefined) updateData.readyDatetime = new Date(tugboatData.readyDatetime);

    // Update station assignment if provided
    if (tugboatData.stationId !== undefined) {
      updateData.stationId = tugboatData.stationId ? tugboatData.stationId.trim() : undefined;
    }

    // Update tugboat if there are changes
    if (Object.keys(updateData).length > 0) {
      await this.repository.updateTugboat(id, updateData);
    }

    // Return updated tugboat with station
    return await this.repository.getTugboatById(id);
  }

  /**
   * Delete tugboat and station association
   * @param id Tugboat ID
   */
  public async deleteTugboat(id: string): Promise<void> {
    // Check if tugboat exists
    const existingTugboat = await this.repository.getTugboatById(id);
    if (!existingTugboat) {
      throw new NotFoundException(`Tugboat with ID ${id} not found`);
    }

    // Delete tugboat
    await this.repository.deleteTugboat(id);
  }

  /**
   * Delete multiple tugboats by IDs
   * @param ids Array of tugboat IDs
   */
  public async deleteMultipleTugboats(ids: string[]): Promise<void> {
    if (!ids || !ids.length) {
      throw new Error('No IDs provided');
    }

    // Check if all tugboats exist
    for (const id of ids) {
      const tugboat = await this.repository.getTugboatById(id);
      if (!tugboat) {
        throw new NotFoundException(`Tugboat with ID ${id} not found`);
      }
    }

    await this.repository.deleteMultipleTugboats(ids);
  }

  /**
   * Assign station to tugboat
   * @param tugboatId Tugboat ID
   * @param stationId Station ID
   * @returns Promise<Tugboat>
   */
  public async assignStationToTugboat(tugboatId: string, stationId: string): Promise<Tugboat | null> {
    // Verify tugboat exists
    const tugboat = await this.repository.getTugboatById(tugboatId);
    if (!tugboat) {
      throw new NotFoundException(`Tugboat with ID ${tugboatId} not found`);
    }

    // Check if already assigned to this station
    if (tugboat.stationId === stationId) {
      throw new ConflictException(`Tugboat ${tugboatId} is already assigned to station ${stationId}`);
    }

    return await this.repository.assignStationToTugboat(tugboatId, stationId);
  }

  /**
   * Remove station from tugboat
   * @param tugboatId Tugboat ID
   * @returns Promise<Tugboat>
   */
  public async removeStationFromTugboat(tugboatId: string): Promise<Tugboat | null> {
    // Verify tugboat exists
    const tugboat = await this.repository.getTugboatById(tugboatId);
    if (!tugboat) {
      throw new NotFoundException(`Tugboat with ID ${tugboatId} not found`);
    }

    // Check if station is assigned
    if (!tugboat.stationId) {
      throw new NotFoundException(`Tugboat ${tugboatId} has no station assigned`);
    }

    return await this.repository.removeStationFromTugboat(tugboatId);
  }

  /**
   * CSV upload functionality
   * @param buffer CSV buffer
   * @returns Promise<Tugboat[]>
   */
  public async upload(buffer: Buffer): Promise<Tugboat[]> {
    return await this.repository.upload(buffer);
  }

  // Legacy methods for backward compatibility
  // Legacy methods for backward compatibility
  public async createNewTugboat(tugboat: Tugboat): Promise<Tugboat | null> {
    // Convert Tugboat entity to CreateTugboatData format
    const tugboatData: CreateTugboatData = {
      id: tugboat.id,
      name: tugboat.name || '', // Provide default empty string if undefined
      maxCapacity: tugboat.maxCapacity || 0,
      maxBarge: tugboat.maxBarge || 0,
      maxFuelCon: tugboat.maxFuelCon || 0,
      type: tugboat.type || 'SEA',
      minSpeed: tugboat.minSpeed || 0,
      maxSpeed: tugboat.maxSpeed || 0,
      engineRpm: tugboat.engineRpm || 0,
      horsePower: tugboat.horsePower || 0,
      waterStatus: tugboat.waterStatus || 'SEA',
      readyDatetime: tugboat.readyDatetime || new Date(),
      stationId: tugboat.stationId,
    };

    return this.createTugboat(tugboatData);
  }

  public async deleteById(id: string): Promise<void> {
    return this.deleteTugboat(id);
  }
}