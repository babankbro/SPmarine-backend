import { Injectable } from '@nestjs/common';


import { Schedule } from '@/entities/schedule.entity';
import { ViewScheduleTypePoint } from '@/entities/view_schedule_type_point.entity';
import { ScheduleRepository } from '@/repositories/schedule.repository';

@Injectable()
export class ScheduleService {
  constructor(private readonly repository: ScheduleRepository) { }

  public async getSchedules(): Promise<Schedule[]> {
    return await this.repository.getSchedules();
  }




  public async getSchedulesByTugboatId(tugboatId: string): Promise<Schedule[]> {
    return await this.repository.getSchedulesByTugboatId(tugboatId);
  }

  public async getSchedulesByOrderId(orderId: string): Promise<Schedule[]> {
    return await this.repository.getSchedulesByOrderId(orderId);
  }

  public async getSchedulesByTugboatAndOrderId(
    tugboatId: string,
    orderId: string,
    type_point?:string,
    enter_datetime?: string,
    exit_datetime?: string,
  ): Promise<Schedule[]> {
    return await this.repository.getSchedulesByTugboatAndOrderId(
      tugboatId,
      orderId,
      type_point,
      enter_datetime,
      exit_datetime,
    );
  }
  

  
  async getTugboatTimeline(tugboatId: string,
    orderId: string) {
    return await this.repository.getTugboatTimeline(
      tugboatId,
      orderId,
    )
  }

  public async getViewScheduleTypePoints(): Promise<ViewScheduleTypePoint[]> {
    return await this.repository.getViewScheduleTypePoints();
  }
}