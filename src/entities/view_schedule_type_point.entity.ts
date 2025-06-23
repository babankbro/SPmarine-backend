import { Entity, ViewEntity, Column, PrimaryColumn } from 'typeorm';

@ViewEntity({ name: 'view_schedule_type_point' })
export class ViewScheduleTypePoint {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  type_point: string;

  // เพิ่ม column อื่น ๆ ตามที่ view นี้มีจริงในฐานข้อมูล
} 