import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  initialObservation?: string;
}
