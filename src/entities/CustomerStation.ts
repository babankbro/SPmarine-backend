import { Entity, ManyToOne } from 'typeorm';

import { Customer } from '@/entities/customer.entity';
import { Station } from '@/entities/station.entity';

@Entity('Customer_Station')
export class Customer_Station {
  // @ManyToOne(() => Customer, (c) => c.stationId)
  // public customer: Customer;
  // @ManyToOne(() => Station, (s) => s.customerId)
  // public station: Station;
}
