import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEvidenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observation?: string;
}
