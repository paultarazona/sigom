import { IsEnum, IsOptional, IsUUID, IsString, MaxLength } from 'class-validator';
import { InspectionResult } from '@prisma/client';

export class CreateInspectionDto {
  @IsUUID()
  workOrderId: string;

  @IsString()
  @MaxLength(100)
  inspectionType: string;

  @IsEnum(InspectionResult)
  result: InspectionResult;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observation?: string;

  @IsUUID()
  registeredById: string;
}
