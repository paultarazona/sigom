import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ResolveWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  finalDiagnosis: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  solutionApplied: string;
}
