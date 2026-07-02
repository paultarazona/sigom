import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCrewDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsUUID()
  leaderId: string;
}
