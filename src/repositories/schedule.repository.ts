import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Schedule } from '@/entities/schedule.entity';
import { ViewScheduleTypePoint } from '@/entities/view_schedule_type_point.entity';

@Injectable()
export class ScheduleRepository {
  constructor(
    @InjectRepository(Schedule)
    private readonly entities: Repository<Schedule>,
    @InjectRepository(ViewScheduleTypePoint)
    private readonly viewEntities: Repository<ViewScheduleTypePoint>,
  ) { }

  public async getSchedules(): Promise<Schedule[]> {
    const queryBuilder: SelectQueryBuilder<Schedule> = this.entities.createQueryBuilder('schedule');
    return queryBuilder.getMany();
  }



  public async getSchedulesByTugboatId(tugboatId: string): Promise<Schedule[]> {
    return this.entities.find({
      where: { tugboat_id: tugboatId },
      order: { enter_datetime: 'ASC' },
    });
  }

  public async getSchedulesByOrderId(orderId: string): Promise<Schedule[]> {
    return this.entities.find({
      where: { order_id: orderId },
      order: { enter_datetime: 'ASC' },
    });
  }

  public async getSchedulesByTugboatAndOrderId(
    tugboatId: string,
    orderId: string,
    type_point?:string,
    enter_datetime?: string,
    exit_datetime?: string,
  ): Promise<Schedule[]> {
    const whereCondition: any = {
      tugboat_id: tugboatId,
      order_id: orderId,
    };

console.log(type_point)
    if (type_point) {
      whereCondition.type_point = type_point;
    }


    if (enter_datetime) {
      whereCondition.enter_datetime = new Date(enter_datetime);
    }

    if (exit_datetime) {
      whereCondition.exit_datetime = new Date(exit_datetime);
    }

    return this.entities.find({
      where: whereCondition,
      order: { enter_datetime: 'ASC' },
    });
  }


  public async getTugboatTimeline(tugboatId?: string, orderId?: string) {
    const where: any = { type_point: 'main_point' };
    if (tugboatId) where.tugboat_id = tugboatId;
    if (orderId) where.order_id = orderId;

    return this.entities.find({
      where,
      order: { enter_datetime: 'ASC' },
    });
  }

  public async getViewScheduleTypePoints(): Promise<ViewScheduleTypePoint[]> {
    return this.viewEntities.find();
  }
}




// public async getSchedulesByTugboatAndOrderId(tugboatId: string, orderId: string): Promise<Schedule[]> {
//   return this.entities.find({
//     where: { 
//       tugboat_id: tugboatId,
//       order_id: orderId,
//     },
//     order: { enter_datetime: 'ASC' }
//   });
// }