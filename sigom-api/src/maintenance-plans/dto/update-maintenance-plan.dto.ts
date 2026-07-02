import { IsOptional, IsString, IsInt, IsBoolean, IsDateString, MaxLength, Min } from 'class-validator';

export class UpdateMaintenancePlanDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  frequencyDays?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
