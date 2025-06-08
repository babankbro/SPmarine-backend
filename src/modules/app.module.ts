import { Module } from '@nestjs/common';

import { BargeModule } from '@/modules/barge.module';
import { CarrierModule } from '@/modules/carrier.module';
import { CustomerModule } from '@/modules/customer.module';
import { DatabaseModule } from '@/modules//database.module';
import { OrderModule } from '@/modules/order.module';
import { StationModule } from '@/modules/station.module';
import { TugboatModule } from '@/modules/tugboat.module';
import { CostModule } from '@/modules/cost.module';

@Module({
  imports: [
    BargeModule,
    CarrierModule,
    CustomerModule,
    DatabaseModule,
    OrderModule,
    StationModule,
    TugboatModule,
    CostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
