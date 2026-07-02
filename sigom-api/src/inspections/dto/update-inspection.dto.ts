import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { InspectionResult } from '@prisma/client';

export class UpdateInspectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  inspectionType?: string;

  @IsOptional()
  @IsEnum(InspectionResult)
  result?: InspectionResult;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observation?: string;
}
