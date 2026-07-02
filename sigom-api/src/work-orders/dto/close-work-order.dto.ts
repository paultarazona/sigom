import { IsUUID } from 'class-validator';

export class CloseWorkOrderDto {
  @IsUUID()
  closedById: string;
}
