import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { Carrier } from '@/entities/carrier.entity';



 export class CreateCarrierDto {
  id: string;
  name: string;
  maxCapacity?: number;
  holder?: string;
  numberOfBulks?: number;
  maxCrane?: number;
}

 export class UpdateCarrierDto {
  name?: string;
  maxCapacity?: number;
  holder?: string;
  numberOfBulks?: number;
  maxCrane?: number;

}

@Injectable()
export class CarrierRepository {
  constructor(
    @InjectRepository(Carrier)
    private readonly entities: Repository<Carrier>,
  ) {}

  // Get all carriers with filtering and sorting
  public async getCarriers(options?: {
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }): Promise<{ data: Carrier[]; total: number }> {
    const queryBuilder = this.entities.createQueryBuilder('carrier');

    // Apply search filter
    if (options?.search) {
      queryBuilder.where(
        'carrier.name LIKE :search OR carrier.holder LIKE :search OR carrier.id LIKE :search',
        { search: `%${options.search}%` }
      );
    }

    // Apply status filter
    if (options?.status && options.status !== 'ALL') {
      queryBuilder.andWhere('carrier.status = :status', { status: options.status });
    }

    // Apply sorting
    const sortBy = options?.sortBy || 'name';
    const sortOrder = options?.sortOrder || 'ASC';
    queryBuilder.orderBy(`carrier.${sortBy}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    if (options?.page && options?.limit) {
      const skip = (options.page - 1) * options.limit;
      queryBuilder.skip(skip).take(options.limit);
    }

    const data = await queryBuilder.getMany();
    return { data, total };
  }

  // Get carrier by ID
  public async getCarrierById(id: string): Promise<Carrier | null> {
    const carrier = await this.entities.findOne({ where: { id } });
    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${id} not found`);
    }
    return carrier;
  }

  // Create new carrier
  public async createCarrier(createCarrierDto: CreateCarrierDto): Promise<Carrier> {
    // Check if ID already exists
    const existingCarrier = await this.entities.findOne({ 
      where: { id: createCarrierDto.id } 
    });
    if (existingCarrier) {
      throw new ConflictException(`Carrier with ID ${createCarrierDto.id} already exists`);
    }

    // Check if name already exists
    const existingName = await this.entities.findOne({ 
      where: { name: createCarrierDto.name } 
    });
    if (existingName) {
      throw new ConflictException(`Carrier with name ${createCarrierDto.name} already exists`);
    }

    const carrier = this.entities.create(createCarrierDto);
    return await this.entities.save(carrier);
  }

  // Update carrier
  public async updateCarrier(id: string, updateCarrierDto: UpdateCarrierDto): Promise<Carrier| null> {
    const carrier = await this.getCarrierById(id);

    // Check if name already exists for another carrier
    if (updateCarrierDto.name) {
      const existingName = await this.entities.findOne({ 
        where: { name: updateCarrierDto.name } 
      });
      if (existingName && existingName.id !== id) {
        throw new ConflictException(`Carrier with name ${updateCarrierDto.name} already exists`);
      }
    }

    await this.entities.update(id, updateCarrierDto);
    return await this.getCarrierById(id);
  }

  // Delete carrier
  public async deleteCarrier(id: string): Promise<void> {
    const carrier = await this.getCarrierById(id);
    await this.entities.delete(id);
  }

  // Delete multiple carriers
  public async deleteMultipleCarriers(ids: string[]): Promise<void> {
    if (!ids || !ids.length) {
      throw new Error('No IDs provided');
    }

    // Check if all carriers exist
    for (const id of ids) {
      await this.getCarrierById(id);
    }

    await this.entities.delete(ids);
  }

  // Get carrier statistics
  public async getCarrierStatistics(): Promise<any> {
    const result = await this.entities
      .createQueryBuilder('carrier')
      .select([
        'COUNT(*) as total',
        'SUM(CASE WHEN carrier.status = "ACTIVE" THEN 1 ELSE 0 END) as active',
        'SUM(CASE WHEN carrier.status = "INACTIVE" THEN 1 ELSE 0 END) as inactive',
        'SUM(CASE WHEN carrier.status = "MAINTENANCE" THEN 1 ELSE 0 END) as maintenance',
        'AVG(carrier.maxCapacity) as averageCapacity',
        'SUM(carrier.maxCapacity) as totalCapacity'
      ])
      .getRawOne();

    return {
      total: parseInt(result.total) || 0,
      active: parseInt(result.active) || 0,
      inactive: parseInt(result.inactive) || 0,
      maintenance: parseInt(result.maintenance) || 0,
      averageCapacity: parseFloat(result.averageCapacity) || 0,
      totalCapacity: parseInt(result.totalCapacity) || 0,
    };
  }
}