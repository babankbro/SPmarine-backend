// src/services/barge.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { Barge } from '@/entities/barge.entity';
import { BargeRepository } from '@/repositories/barge.repository';

interface CreateBargeData {
  id: string;
  name: string;
  weight: number;
  capacity: number;
  waterStatus: 'SEA' | 'RIVER';
  stationId?: string;
  setupTime: number;
  readyDatetime: Date | string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

interface UpdateBargeData {
  name?: string;
  weight?: number;
  capacity?: number;
  waterStatus?: 'SEA' | 'RIVER';
  stationId?: string;
  setupTime?: number;
  readyDatetime?: Date | string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

@Injectable()
export class BargeService {
  constructor(private readonly repository: BargeRepository) {}

  /**
   * Get all barges with their stations
   * @returns Promise<Barge[]>
   */
  public async getBarges(): Promise<Barge[]> {
    return await this.repository.getBarges();
  }

  /**
   * Get barge by ID with station
   * @param id Barge ID
   * @returns Promise<Barge>
   */
  public async getBargeById(id: string): Promise<Barge | null> {
    return await this.repository.getBargeById(id);
  }

  /**
   * Get barges by station ID
   * @param stationId Station ID
   * @returns Promise<Barge[]>
   */
  public async getBargesByStation(stationId: string): Promise<Barge[]> {
    return await this.repository.getBargesByStation(stationId);
  }

  /**
   * Create new barge with optional station association
   * @param bargeData Barge data
   * @returns Promise<Barge>
   */
  public async createBarge(bargeData: CreateBargeData): Promise<Barge | null> {
    // Validate required fields
    if (!bargeData.id || !bargeData.name) {
      throw new Error('ID and name are required');
    }

    // Validate numbers
    if (bargeData.weight <= 0 || bargeData.capacity <= 0 || bargeData.setupTime < 0) {
      throw new Error('Weight, capacity must be greater than 0, setupTime must be non-negative');
    }

    // Check if barge with this ID already exists
    const existingBarge = await this.repository.getBargeById(bargeData.id).catch(() => null);
    if (existingBarge) {
      throw new ConflictException(`Barge with ID ${bargeData.id} already exists`);
    }

    // Create barge
    const barge = await this.repository.createBarge({
      id: bargeData.id,
      name: bargeData.name.trim(),
      weight: bargeData.weight,
      capacity: bargeData.capacity,
      waterStatus: bargeData.waterStatus || 'SEA',
      stationId: bargeData.stationId ? bargeData.stationId.trim() : undefined,
      setupTime: bargeData.setupTime,
      readyDatetime: bargeData.readyDatetime ? new Date(bargeData.readyDatetime) : new Date(),
      // latitude: bargeData.latitude,
      // longitude: bargeData.longitude,
      //distanceKm: bargeData.distanceKm
    });

    console.log(`Barge created: ${JSON.stringify(barge)}`);

    if (!barge) {
      throw new Error('Failed to create barge');
    }

    return barge;
  }

  /**
   * Update barge information and station association
   * @param id Barge ID
   * @param bargeData Barge data
   * @returns Promise<Barge>
   */
  public async updateBarge(id: string, bargeData: UpdateBargeData): Promise<Barge | null> {
    // Check if barge exists
    const existingBarge = await this.repository.getBargeById(id);
    if (!existingBarge) {
      throw new NotFoundException(`Barge with ID ${id} not found`);
    }

    // Validate numbers if provided
    if (bargeData.weight !== undefined && bargeData.weight <= 0) {
      throw new Error('Weight must be greater than 0');
    }
    if (bargeData.capacity !== undefined && bargeData.capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }
    if (bargeData.setupTime !== undefined && bargeData.setupTime < 0) {
      throw new Error('Setup time must be non-negative');
    }

    // Update basic barge information
    const updateData: Partial<Barge> = {};
    if (bargeData.name !== undefined) updateData.name = bargeData.name.trim();
    if (bargeData.weight !== undefined) updateData.weight = bargeData.weight;
    if (bargeData.capacity !== undefined) updateData.capacity = bargeData.capacity;
    if (bargeData.waterStatus !== undefined) updateData.waterStatus = bargeData.waterStatus;
    if (bargeData.setupTime !== undefined) updateData.setupTime = bargeData.setupTime;
    if (bargeData.readyDatetime !== undefined) updateData.readyDatetime = new Date(bargeData.readyDatetime);
    // if (bargeData.latitude !== undefined) updateData.latitude = bargeData.latitude;
    // if (bargeData.longitude !== undefined) updateData.longitude = bargeData.longitude;
    // if (bargeData.distanceKm !== undefined) updateData.distanceKm = bargeData.distanceKm;

    // Update station assignment if provided
    if (bargeData.stationId !== undefined) {
      updateData.stationId = bargeData.stationId ? bargeData.stationId.trim() : undefined;
    }

    // Update barge if there are changes
    if (Object.keys(updateData).length > 0) {
      await this.repository.updateBarge(id, updateData);
    }

    // Return updated barge with station
    return await this.repository.getBargeById(id);
  }

  /**
   * Delete barge and station association
   * @param id Barge ID
   */
  public async deleteBarge(id: string): Promise<void> {
    // Check if barge exists
    const existingBarge = await this.repository.getBargeById(id);
    if (!existingBarge) {
      throw new NotFoundException(`Barge with ID ${id} not found`);
    }

    // Delete barge
    await this.repository.deleteBarge(id);
  }

  /**
   * Delete multiple barges by IDs
   * @param ids Array of barge IDs
   */
  public async deleteMultipleBarges(ids: string[]): Promise<void> {
    if (!ids || !ids.length) {
      throw new Error('No IDs provided');
    }

    // Check if all barges exist
    for (const id of ids) {
      const barge = await this.repository.getBargeById(id);
      if (!barge) {
        throw new NotFoundException(`Barge with ID ${id} not found`);
      }
    }

    await this.repository.deleteMultipleBarges(ids);
  }

  /**
   * Assign station to barge
   * @param bargeId Barge ID
   * @param stationId Station ID
   * @returns Promise<Barge>
   */
  public async assignStationToBarge(bargeId: string, stationId: string): Promise<Barge | null> {
    // Verify barge exists
    const barge = await this.repository.getBargeById(bargeId);
    if (!barge) {
      throw new NotFoundException(`Barge with ID ${bargeId} not found`);
    }

    // Check if already assigned to this station
    if (barge.stationId === stationId) {
      throw new ConflictException(`Barge ${bargeId} is already assigned to station ${stationId}`);
    }

    return await this.repository.assignStationToBarge(bargeId, stationId);
  }

  /**
   * Remove station from barge
   * @param bargeId Barge ID
   * @returns Promise<Barge>
   */
  public async removeStationFromBarge(bargeId: string): Promise<Barge | null> {
    // Verify barge exists
    const barge = await this.repository.getBargeById(bargeId);
    if (!barge) {
      throw new NotFoundException(`Barge with ID ${bargeId} not found`);
    }

    // Check if station is assigned
    if (!barge.stationId) {
      throw new NotFoundException(`Barge ${bargeId} has no station assigned`);
    }

    return await this.repository.removeStationFromBarge(bargeId);
  }

  // Legacy methods for backward compatibility
  public async getOrder(): Promise<Barge[]> {
    return this.getBarges();
  }

  public async createNewBarge(barge: Barge) {
    return this.createBarge(barge);
  }

  public async deleteById(id: string) {
    return this.deleteBarge(id);
  }

  public async deleteMultiId(ids: string[]) {
    return this.deleteMultipleBarges(ids);
  }
}