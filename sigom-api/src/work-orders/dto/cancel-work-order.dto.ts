import { IsUUID } from 'class-validator';

export class CancelWorkOrderDto {
  @IsUUID()
  cancelledById: string;
}
