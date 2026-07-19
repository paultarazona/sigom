import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { WorkOrderPriority } from '@prisma/client';
import { Type } from 'class-transformer';

class SourceIncidentDto {
  @IsString()
  @MaxLength(128)
  externalId: string;

  @IsString()
  @MaxLength(64)
  code: string;

  @IsString()
  @MaxLength(100)
  type: string;

  @IsEnum(WorkOrderPriority)
  level: WorkOrderPriority;

  @IsDateString()
  detectedAt: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  readingObservation?: string;
}

class SourceReferenceDto {
  @IsString()
  @MaxLength(128)
  externalId: string;

  @IsString()
  @MaxLength(200)
  name?: string;

  @IsString()
  @MaxLength(128)
  code?: string;
}

class SourceAssetDto {
  @ValidateNested()
  @Type(() => SourceReferenceDto)
  zone: SourceReferenceDto;

  @ValidateNested()
  @Type(() => SourceReferenceDto)
  supply: SourceReferenceDto;

  @ValidateNested()
  @Type(() => SourceReferenceDto)
  meter: SourceReferenceDto;

  @IsString()
  @MaxLength(500)
  addressSnapshot: string;
}

export class CreateOrderFromIncidentDto {
  @ValidateNested()
  @Type(() => SourceIncidentDto)
  incident: SourceIncidentDto;

  @ValidateNested()
  @Type(() => SourceAssetDto)
  asset: SourceAssetDto;
}
