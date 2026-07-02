import { IsOptional, IsString, IsUUID, IsBoolean, MaxLength } from 'class-validator';

export class UpdateCrewDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUUID()
  leaderId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
