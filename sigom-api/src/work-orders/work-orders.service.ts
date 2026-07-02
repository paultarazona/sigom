import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { QueryWorkOrderDto } from './dto/query-work-order.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { ResolveWorkOrderDto } from './dto/resolve-work-order.dto';
import { isValidTransition } from './state-machine';
import { buildOrderBy } from '../common/utils/query.utils';

const ALLOWED_SORT_FIELDS = ['createdAt', 'scheduledAt', 'closedAt', 'priority', 'status', 'code'];

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async findWorkOrderOrFail(id: string) {
    const workOrder = await this.prisma.workOrder.findUnique({ where: { id } });
    if (!workOrder) throw new NotFoundException('Orden de trabajo no encontrada.');
    return workOrder;
  }

  private assertValidTransition(current: string, target: string) {
    if (!isValidTransition(current, target)) {
      throw new ConflictException({
        code: 'INVALID_WORK_ORDER_TRANSITION',
        message: `No se puede realizar la transición de ${current} a ${target}.`,
      });
    }
  }

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

  async create(dto: CreateWorkOrderDto) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = await this.generateCode('OT');
      try {
        const workOrder = await this.prisma.workOrder.create({
          data: {
            code,
            type: dto.type,
            priority: dto.priority || 'MEDIUM',
            zoneId: dto.zoneId,
            supplyId: dto.supplyId,
            meterId: dto.meterId,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
            initialObservation: dto.initialObservation,
            createdById: dto.createdById,
          },
          include: {
            createdBy: { select: { id: true, firstName: true, lastName: true } },
            assignedTo: { select: { id: true, firstName: true, lastName: true } },
          },
        });

        return {
          data: workOrder,
          message: 'Orden de trabajo creada correctamente.',
        };
      } catch (err: unknown) {
        if ((err as { code?: string })?.code === 'P2002' && attempt < 2) continue;
        throw err;
      }
    }
    throw new ConflictException({ code: 'CODE_GENERATION_FAILED', message: 'No se pudo generar un código único. Intente nuevamente.' });
  }

  async findAll(query: QueryWorkOrderDto) {
    const { page = 1, limit = 20, sortBy, sortOrder, q, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters.status) {
      const statuses = filters.status.split(',');
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.zoneId) {
      where.zoneId = filters.zoneId;
    }

    if (filters.technicianId) {
      where.assignedToId = filters.technicianId;
    }

    if (filters.scheduledFrom || filters.scheduledTo) {
      where.scheduledAt = {};
      if (filters.scheduledFrom) {
        (where.scheduledAt as Record<string, unknown>).gte = new Date(filters.scheduledFrom);
      }
      if (filters.scheduledTo) {
        (where.scheduledAt as Record<string, unknown>).lte = new Date(filters.scheduledTo);
      }
    }

    if (q) {
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { incidentCode: { contains: q, mode: 'insensitive' } },
        { initialObservation: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy = buildOrderBy(sortBy, sortOrder, ALLOWED_SORT_FIELDS);

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where: where as never,
        skip,
        take: limit,
        orderBy,
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.workOrder.count({ where: where as never }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        closedBy: { select: { id: true, firstName: true, lastName: true } },
        cancelledBy: { select: { id: true, firstName: true, lastName: true } },
        inspections: {
          include: {
            registeredBy: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        evidence: true,
        assignments: {
          include: {
            technician: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Orden de trabajo no encontrada.');
    }

    return { data: workOrder };
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    const workOrder = await this.findWorkOrderOrFail(id);

    if (workOrder.status === 'CLOSED') {
      throw new ConflictException({
        code: 'WORK_ORDER_CLOSED',
        message: 'No se puede editar una orden de trabajo cerrada.',
      });
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        initialObservation: dto.initialObservation,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return {
      data: updated,
      message: 'Orden de trabajo actualizada correctamente.',
    };
  }

  async assign(id: string, dto: AssignWorkOrderDto) {
    const workOrder = await this.findWorkOrderOrFail(id);
    this.assertValidTransition(workOrder.status, 'ASSIGNED');

    const technician = await this.prisma.user.findUnique({
      where: { id: dto.technicianId },
    });

    if (!technician || !technician.isActive) {
      throw new BadRequestException({
        code: 'TECHNICIAN_NOT_ACTIVE',
        message: 'El técnico no está activo.',
      });
    }

    const updated = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: {
          status: 'ASSIGNED',
          assignedToId: dto.technicianId,
        },
      }),
      this.prisma.orderAssignment.create({
        data: {
          workOrderId: id,
          technicianId: dto.technicianId,
          assignedById: dto.assignedById,
        },
      }),
    ]);

    return {
      data: updated[0],
      message: 'Orden de trabajo asignada correctamente.',
    };
  }

  async start(id: string) {
    const workOrder = await this.findWorkOrderOrFail(id);
    this.assertValidTransition(workOrder.status, 'IN_FIELD');

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        status: 'IN_FIELD',
        startedAt: new Date(),
      },
    });

    return {
      data: updated,
      message: 'Atención en campo iniciada.',
    };
  }

  async suspend(id: string) {
    const workOrder = await this.findWorkOrderOrFail(id);
    this.assertValidTransition(workOrder.status, 'SUSPENDED');

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });

    return {
      data: updated,
      message: 'Orden de trabajo suspendida.',
    };
  }

  async resolve(id: string, body: ResolveWorkOrderDto) {
    const workOrder = await this.findWorkOrderOrFail(id);
    this.assertValidTransition(workOrder.status, 'RESOLVED');

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        finalDiagnosis: body.finalDiagnosis,
        solutionApplied: body.solutionApplied,
      },
    });

    return {
      data: updated,
      message: 'Orden de trabajo resuelta.',
    };
  }

  async close(id: string, userId: string) {
    const workOrder = await this.findWorkOrderOrFail(id);
    this.assertValidTransition(workOrder.status, 'CLOSED');

    if (!workOrder.finalDiagnosis || !workOrder.solutionApplied) {
      throw new ConflictException({
        code: 'INSPECTION_REQUIRED',
        message: 'No se puede cerrar la orden sin diagnóstico final y solución aplicada.',
      });
    }

    const inspectionCount = await this.prisma.inspection.count({
      where: { workOrderId: id },
    });

    if (inspectionCount === 0) {
      throw new ConflictException({
        code: 'INSPECTION_REQUIRED',
        message: 'Se requiere al menos una inspección registrada para cerrar la orden.',
      });
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedById: userId,
      },
    });

    return {
      data: updated,
      message: 'Orden de trabajo cerrada correctamente.',
    };
  }

  async cancel(id: string, userId: string) {
    const workOrder = await this.findWorkOrderOrFail(id);
    this.assertValidTransition(workOrder.status, 'CANCELLED');

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledById: userId,
      },
    });

    return {
      data: updated,
      message: 'Orden de trabajo anulada.',
    };
  }
}
