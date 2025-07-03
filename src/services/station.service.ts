// src/services/station.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { Station } from '@/entities/station.entity';
import { StationRepository } from '@/repositories/station.repository';

interface CreateStationData {
  id: string;
  name: string;
  type: 'SEA' | 'RIVER';
  latitude: number;
  longitude: number;
  distanceKm: number;
}

interface UpdateStationData {
  name?: string;
  type?: 'SEA' | 'RIVER';
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

@Injectable()
export class StationService {
  constructor(private readonly repository: StationRepository) {}

  /**
   * Get all stations
   * @returns Promise<Station[]>
   */
  public async getStations(): Promise<Station[]> {
    return await this.repository.getStations();
  }

  /**
   * Get station by ID
   * @param id Station ID
   * @returns Promise<Station>
   */
  public async getStationById(id: string): Promise<Station | null> {
    return await this.repository.getStationById(id);
  }

  /**
   * Get stations by type
   * @param type Station type
   * @returns Promise<Station[]>
   */
  public async getStationsByType(type: 'SEA' | 'RIVER'): Promise<Station[]> {
    return await this.repository.getStationsByType(type);
  }

  /**
   * Create new station
   * @param stationData Station data
   * @returns Promise<Station>
   */
  public async createStation(stationData: CreateStationData): Promise<Station> {
    // Validate required fields
    if (!stationData.id || !stationData.name) {
      throw new Error('ID and name are required');
    }

    // Validate coordinates
    if (!this.isValidLatitude(stationData.latitude)) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }

    if (!this.isValidLongitude(stationData.longitude)) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }

    // Validate distance
    if (stationData.distanceKm < 0) {
      throw new Error('Distance must be non-negative');
    }

    // Check if station with this ID already exists
    const existingStation = await this.repository.getStationById(stationData.id).catch(() => null);
    if (existingStation) {
      throw new ConflictException(`Station with ID ${stationData.id} already exists`);
    }

    // Create station
    const station = await this.repository.createStation({
      id: stationData.id,
      name: stationData.name.trim(),
      type: stationData.type || 'SEA',
      latitude: stationData.latitude,
      longitude: stationData.longitude,
      distanceKm: stationData.distanceKm,
    });

    console.log(`Station created: ${JSON.stringify(station)}`);

    if (!station) {
      throw new Error('Failed to create station');
    }

    return station;
  }

  /**
   * Update station information
   * @param id Station ID
   * @param stationData Station data
   * @returns Promise<Station>
   */
  public async updateStation(id: string, stationData: UpdateStationData): Promise<Station| null> {
    // Check if station exists
    const existingStation = await this.repository.getStationById(id);
    if (!existingStation) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }

    // Validate coordinates if provided
    if (stationData.latitude !== undefined && !this.isValidLatitude(stationData.latitude)) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }

    if (stationData.longitude !== undefined && !this.isValidLongitude(stationData.longitude)) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }

    // Validate distance if provided
    if (stationData.distanceKm !== undefined && stationData.distanceKm < 0) {
      throw new Error('Distance must be non-negative');
    }

    // Update station information
    const updateData: Partial<Station> = {};
    if (stationData.name !== undefined) updateData.name = stationData.name.trim();
    if (stationData.type !== undefined) updateData.type = stationData.type;
    if (stationData.latitude !== undefined) updateData.latitude = stationData.latitude;
    if (stationData.longitude !== undefined) updateData.longitude = stationData.longitude;
    if (stationData.distanceKm !== undefined) updateData.distanceKm = stationData.distanceKm;

    // Update station if there are changes
    if (Object.keys(updateData).length > 0) {
      await this.repository.updateStation(id, updateData);
    }

    // Return updated station
    return await this.repository.getStationById(id);
  }

  /**
   * Delete station
   * @param id Station ID
   */
  public async deleteStation(id: string): Promise<void> {
    // Check if station exists
    const existingStation = await this.repository.getStationById(id);
    if (!existingStation) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }

    // Delete station
    await this.repository.deleteStation(id);
  }

  /**
   * Delete multiple stations by IDs
   * @param ids Array of station IDs
   */
  public async deleteMultipleStations(ids: string[]): Promise<void> {
    if (!ids || !ids.length) {
      throw new Error('No IDs provided');
    }

    // Check if all stations exist
    for (const id of ids) {
      const station = await this.repository.getStationById(id);
      if (!station) {
        throw new NotFoundException(`Station with ID ${id} not found`);
      }
    }

    await this.repository.deleteMultipleStations(ids);
  }

  /**
   * Search stations by name
   * @param searchTerm Search term
   * @returns Promise<Station[]>
   */
  public async searchStationsByName(searchTerm: string): Promise<Station[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.getStations();
    }

    return await this.repository.searchStationsByName(searchTerm.trim());
  }

  /**
   * Get stations within distance range
   * @param maxDistance Maximum distance in km
   * @returns Promise<Station[]>
   */
  public async getStationsWithinDistance(maxDistance: number): Promise<Station[]> {
    if (maxDistance < 0) {
      throw new Error('Maximum distance must be non-negative');
    }

    return await this.repository.getStationsWithinDistance(maxDistance);
  }

  /**
   * Get station statistics
   * @returns Promise<object>
   */
  public async getStationStatistics(): Promise<{
    total: number;
    seaStations: number;
    riverStations: number;
    averageDistance: number;
    maxDistance: number;
    minDistance: number;
  }> {
    const stations = await this.repository.getStations();
    
    const stats = {
      total: stations.length,
      seaStations: stations.filter(s => s.type === 'SEA').length,
      riverStations: stations.filter(s => s.type === 'RIVER').length,
      averageDistance: 0,
      maxDistance: 0,
      minDistance: 0,
    };

    if (stations.length > 0) {
      const distances = stations.map(s => s.distanceKm);
      stats.averageDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
      stats.maxDistance = Math.max(...distances);
      stats.minDistance = Math.min(...distances);
    }

    return stats;
  }

  /**
   * Validate latitude coordinate
   * @param lat Latitude value
   * @returns boolean
   */
  private isValidLatitude(lat: number): boolean {
    return typeof lat === 'number' && lat >= -90 && lat <= 90;
  }

  /**
   * Validate longitude coordinate
   * @param lng Longitude value
   * @returns boolean
   */
  private isValidLongitude(lng: number): boolean {
    return typeof lng === 'number' && lng >= -180 && lng <= 180;
  }

  // Legacy methods for backward compatibility
  public async getOrder(): Promise<Station[]> {
    return this.getStations();
  }

  public async createNewStation(station: Station): Promise<Station> {
    return this.createStation(station);
  }
}