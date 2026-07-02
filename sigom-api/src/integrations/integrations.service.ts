import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderFromIncidentDto } from './dto/create-order-from-incident.dto';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateCode(prefix: string): Promise<string> {
    const year = new Date().getFullYear();

    const last = await this.prisma.workOrder.findFirst({
      where: { code: { startsWith: `${prefix}-${year}` } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    let sequence = 1;
    if (last) {
      const match = last.code.match(/-(\d{6})$/);
      if (match) {
        sequence = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}-${year}-${String(sequence).padStart(6, '0')}`;
  }

  async createOrderFromIncident(incidentId: string, dto: CreateOrderFromIncidentDto) {
    const existing = await this.prisma.workOrder.findFirst({
      where: { incidentId },
    });

    if (existing) {
      return {
        data: existing,
        message: 'Ya existe una orden de trabajo para esta incidencia.',
      };
    }

    if (dto.incidentCode) {
      const byCode = await this.prisma.workOrder.findFirst({
        where: { incidentCode: dto.incidentCode },
      });

      if (byCode) {
        throw new ConflictException({
          code: 'INCIDENT_ALREADY_PROCESSED',
          message: 'Ya existe una orden de trabajo con el código de incidencia especificado.',
        });
      }
    }

    const code = await this.generateCode('OT');

    const workOrder = await this.prisma.workOrder.create({
      data: {
        code,
        type: dto.type,
        priority: dto.priority || 'MEDIUM',
        zoneId: dto.zoneId,
        supplyId: dto.supplyId,
        meterId: dto.meterId,
        initialObservation: dto.initialObservation,
        sourceSystem: 'SISCON',
        incidentId,
        incidentCode: dto.incidentCode,
        createdById: incidentId,
      },
    });

    return {
      data: {
        id: workOrder.id,
        code: workOrder.code,
        status: workOrder.status,
        sourceSystem: workOrder.sourceSystem,
        incidentId: workOrder.incidentId,
        incidentCode: workOrder.incidentCode,
      },
      message: 'Orden de trabajo creada desde SISCON correctamente.',
    };
  }
}
