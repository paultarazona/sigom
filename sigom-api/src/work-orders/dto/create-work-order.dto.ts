import { IsEnum, IsOptional, IsUUID, IsString, IsDateString, MaxLength } from 'class-validator';
import { WorkOrderType, WorkOrderPriority } from '@prisma/client';

export class CreateWorkOrderDto {
  @IsEnum(WorkOrderType)
  type: WorkOrderType;

  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @IsUUID()
  zoneId: string;

  @IsOptional()
  @IsUUID()
  supplyId?: string;

  @IsOptional()
  @IsUUID()
  meterId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  initialObservation?: string;

  @IsUUID()
  createdById: string;
}
