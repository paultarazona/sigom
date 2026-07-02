import { IsEnum, IsOptional, IsUUID, IsString, MaxLength } from 'class-validator';
import { WorkOrderType, WorkOrderPriority } from '@prisma/client';

export class CreateOrderFromIncidentDto {
  @IsString()
  @MaxLength(20)
  incidentCode: string;

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
  @IsString()
  @MaxLength(2000)
  initialObservation?: string;
}
