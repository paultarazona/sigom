import { IsUUID } from 'class-validator';

export class AssignWorkOrderDto {
  @IsUUID()
  technicianId: string;

  @IsUUID()
  assignedById: string;
}
