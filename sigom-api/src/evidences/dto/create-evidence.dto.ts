import { IsOptional, IsUUID, IsString, MaxLength } from 'class-validator';

export class CreateEvidenceDto {
  @IsUUID()
  workOrderId: string;

  @IsOptional()
  @IsUUID()
  inspectionId?: string;

  @IsString()
  @MaxLength(500)
  filePath: string;

  @IsString()
  @MaxLength(100)
  mimeType: string;

  @IsString()
  @MaxLength(255)
  originalName: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observation?: string;

  @IsUUID()
  registeredById: string;
}
