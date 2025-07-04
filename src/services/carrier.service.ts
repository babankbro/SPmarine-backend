import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CarrierRepository, CreateCarrierDto, UpdateCarrierDto } from '@/repositories/carrier.repository';
import { Carrier } from '@/entities/carrier.entity';

// Define pagination interface
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

// Define response interface
interface CarrierResponse {
  data: Carrier[];
  total: number;
  pagination?: PaginationInfo;
}

@Injectable()
export class CarrierService {
  constructor(private readonly repository: CarrierRepository) {}

  // Get all carriers with filtering and pagination
  public async getCarriers(options?: {
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }): Promise<{ data: Carrier[]; total: number; pagination?: any }> {
    const result = await this.repository.getCarriers(options);
    
    let pagination: PaginationInfo | undefined = undefined;
    if (options?.page && options?.limit) {
      pagination = {
        currentPage: options.page,
        totalPages: Math.ceil(result.total / options.limit),
        pageSize: options.limit,
        totalItems: result.total
      }
    }

    return {
      data: result.data,
      total: result.total,
      pagination
    };
  }

  // Get carrier by ID
  public async getCarrierById(id: string): Promise<Carrier| null> {
    return await this.repository.getCarrierById(id);
  }

  // Create new carrier
  public async createCarrier(createCarrierDto: CreateCarrierDto): Promise<Carrier> {
    // Business logic validation
    if (createCarrierDto.maxCapacity && createCarrierDto.maxCapacity <= 0) {
      throw new Error('Max capacity must be greater than 0');
    }

    if (createCarrierDto.numberOfBulks && createCarrierDto.numberOfBulks <= 0) {
      throw new Error('Number of bulks must be greater than 0');
    }

    if (createCarrierDto.maxCrane && createCarrierDto.maxCrane <= 0) {
      throw new Error('Max crane count must be greater than 0');
    }

    return await this.repository.createCarrier(createCarrierDto);
  }

  // Update carrier
  public async updateCarrier(id: string, updateCarrierDto: UpdateCarrierDto): Promise<Carrier| null> {
    // Business logic validation
    if (updateCarrierDto.maxCapacity && updateCarrierDto.maxCapacity <= 0) {
      throw new Error('Max capacity must be greater than 0');
    }

    if (updateCarrierDto.numberOfBulks && updateCarrierDto.numberOfBulks <= 0) {
      throw new Error('Number of bulks must be greater than 0');
    }

    if (updateCarrierDto.maxCrane && updateCarrierDto.maxCrane <= 0) {
      throw new Error('Max crane count must be greater than 0');
    }

    return await this.repository.updateCarrier(id, updateCarrierDto);
  }

  // Delete carrier
  public async deleteCarrier(id: string): Promise<void> {
    await this.repository.deleteCarrier(id);
  }

  // Delete multiple carriers
  public async deleteMultipleCarriers(ids: string[]): Promise<void> {
    await this.repository.deleteMultipleCarriers(ids);
  }

  // Get carrier statistics
  public async getCarrierStatistics(): Promise<any> {
    return await this.repository.getCarrierStatistics();
  }

  // Check if carrier exists
  public async checkCarrierExists(id: string): Promise<boolean> {
    try {
      await this.repository.getCarrierById(id);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return false;
      }
      throw error;
    }
  }
}