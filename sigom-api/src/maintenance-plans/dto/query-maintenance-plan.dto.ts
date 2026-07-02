import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryMaintenancePlanDto extends PaginationDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
