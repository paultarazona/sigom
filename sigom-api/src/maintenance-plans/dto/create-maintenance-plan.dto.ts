import { IsString, IsInt, IsDateString, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateMaintenancePlanDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsInt()
  @Min(1)
  frequencyDays: number;

  @IsDateString()
  startDate: string;
}
