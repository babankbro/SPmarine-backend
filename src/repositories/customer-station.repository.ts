// import { InjectRepository } from '@nestjs/typeorm';
// import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
// import { Repository } from 'typeorm';

// import { CustomerStation } from '@/entities/customer-station.entity';
// import { Customer } from '@/entities/customer.entity';
// import { Station } from '@/entities/station.entity';

// @Injectable()
// export class CustomerStationRepository {
//   constructor(
//     @InjectRepository(CustomerStation)
//     private readonly customerStationEntities: Repository<CustomerStation>,
//     @InjectRepository(Customer)
//     private readonly customerEntities: Repository<Customer>,
//     @InjectRepository(Station)
//     private readonly stationEntities: Repository<Station>,
//   ) {}

//   // Get all customer-station relationships
//   public async getCustomerStations(): Promise<CustomerStation[]> {
//     return this.customerStationEntities.find({
//       relations: ['customer', 'station']
//     });
//   }

//   // Get stations for a specific customer
//   public async getStationsByCustomerId(customerId: string): Promise<Station[]> {
//     const customerStations = await this.customerStationEntities.find({
//       where: { customerId },
//       relations: ['station']
//     });
    
//     return customerStations.map(cs => cs.station);
//   }

//   // Get customers for a specific station
//   public async getCustomersByStationId(stationId: string): Promise<Customer[]> {
//     const customerStations = await this.customerStationEntities.find({
//       where: { stationId },
//       relations: ['customer']
//     });
    
//     return customerStations.map(cs => cs.customer);
//   }

//   // Add customer to station
//   public async addCustomerToStation(customerId: string, stationId: string): Promise<CustomerStation> {
//     // Verify customer exists
//     const customer = await this.customerEntities.findOne({ where: { id: customerId } });
//     if (!customer) {
//       throw new NotFoundException(`Customer with ID ${customerId} not found`);
//     }

//     // Verify station exists
//     const station = await this.stationEntities.findOne({ where: { id: stationId } });
//     if (!station) {
//       throw new NotFoundException(`Station with ID ${stationId} not found`);
//     }

//     // Check if relationship already exists
//     const existing = await this.customerStationEntities.findOne({
//       where: { customerId, stationId }
//     });
//     if (existing) {
//       throw new ConflictException(`Customer ${customerId} is already associated with station ${stationId}`);
//     }

//     const customerStation = this.customerStationEntities.create({
//       customerId,
//       stationId
//     });

//     return await this.customerStationEntities.save(customerStation);
//   }

//   // Remove customer from station
//   public async removeCustomerFromStation(customerId: string, stationId: string): Promise<void> {
//     const result = await this.customerStationEntities.delete({
//       customerId,
//       stationId
//     });

//     if (result.affected === 0) {
//       throw new NotFoundException(`Relationship between customer ${customerId} and station ${stationId} not found`);
//     }
//   }

//   // Update customer stations (replace all)
//   public async updateCustomerStations(customerId: string, stationIds: string[]): Promise<void> {
//     // Verify customer exists
//     const customer = await this.customerEntities.findOne({ where: { id: customerId } });
//     if (!customer) {
//       throw new NotFoundException(`Customer with ID ${customerId} not found`);
//     }

//     // Verify all stations exist
//     for (const stationId of stationIds) {
//       const station = await this.stationEntities.findOne({ where: { id: stationId } });
//       if (!station) {
//         throw new NotFoundException(`Station with ID ${stationId} not found`);
//       }
//     }

//     // Remove existing relationships
//     await this.customerStationEntities.delete({ customerId });

//     // Add new relationships
//     const customerStations = stationIds.map(stationId => 
//       this.customerStationEntities.create({ customerId, stationId })
//     );

//     if (customerStations.length > 0) {
//       await this.customerStationEntities.save(customerStations);
//     }
//   }

//   // Remove all stations for a customer
//   public async removeAllStationsForCustomer(customerId: string): Promise<void> {
//     await this.customerStationEntities.delete({ customerId });
//   }

//   // Remove all customers for a station
//   public async removeAllCustomersForStation(stationId: string): Promise<void> {
//     await this.customerStationEntities.delete({ stationId });
//   }
// }