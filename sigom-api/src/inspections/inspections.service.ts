import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { QueryInspectionDto } from './dto/query-inspection.dto';
import { buildOrderBy } from '../common/utils/query.utils';

const ALLOWED_SORT_FIELDS = ['registeredAt', 'inspectionType', 'result', 'code'];

@Injectable()
export class InspectionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateCode(): Promise<string> {
    const year = new Date().getFullYear();

    const last = await this.prisma.inspection.findFirst({
      where: { code: { startsWith: `INS-${year}` } },
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

    return `INS-${year}-${String(sequence).padStart(6, '0')}`;
  }

  async create(dto: CreateInspectionDto) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: dto.workOrderId },
    });

    if (!workOrder) {
      throw new NotFoundException('Orden de trabajo no encontrada.');
    }

    if (workOrder.status === 'CLOSED' || workOrder.status === 'CANCELLED') {
      throw new ConflictException({
        code: 'WORK_ORDER_CLOSED',
        message: 'No se puede registrar una inspección en una orden cerrada o anulada.',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.registeredById },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado.');
    if (!user.isActive) throw new BadRequestException({ code: 'USER_NOT_ACTIVE', message: 'El usuario no está activo.' });

    for (let attempt = 0; attempt < 3; attempt++) {
      const code = await this.generateCode();
      try {
        const inspection = await this.prisma.inspection.create({
          data: {
            code,
            workOrderId: dto.workOrderId,
            inspectionType: dto.inspectionType,
            result: dto.result,
            observation: dto.observation,
            registeredById: dto.registeredById,
          },
          include: {
            registeredBy: { select: { id: true, firstName: true, lastName: true } },
          },
        });

        return {
          data: inspection,
          message: 'Inspección registrada correctamente.',
        };
      } catch (err: unknown) {
        if ((err as { code?: string })?.code === 'P2002' && attempt < 2) continue;
        throw err;
      }
    }
    throw new ConflictException({ code: 'CODE_GENERATION_FAILED', message: 'No se pudo generar un código único. Intente nuevamente.' });
  }

  async findAll(query: QueryInspectionDto) {
    const { page = 1, limit = 20, sortBy, sortOrder, q, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters.workOrderId) {
      where.workOrderId = filters.workOrderId;
    }

    if (filters.result) {
      where.result = filters.result;
    }

    if (filters.inspectionType) {
      where.inspectionType = filters.inspectionType;
    }

    if (filters.registeredById) {
      where.registeredById = filters.registeredById;
    }

    if (q) {
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { observation: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy = buildOrderBy(sortBy, sortOrder, ALLOWED_SORT_FIELDS, 'registeredAt');

    const [data, total] = await Promise.all([
      this.prisma.inspection.findMany({
        where: where as never,
        skip,
        take: limit,
        orderBy,
        include: {
          registeredBy: { select: { id: true, firstName: true, lastName: true } },
          workOrder: { select: { id: true, code: true } },
        },
      }),
      this.prisma.inspection.count({ where: where as never }),
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
    const inspection = await this.prisma.inspection.findUnique({
      where: { id },
      include: {
        registeredBy: { select: { id: true, firstName: true, lastName: true } },
        workOrder: { select: { id: true, code: true } },
        evidence: {
          include: {
            registeredBy: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!inspection) {
      throw new NotFoundException('Inspección no encontrada.');
    }

    return { data: inspection };
  }

  async update(id: string, dto: UpdateInspectionDto) {
    const inspection = await this.prisma.inspection.findUnique({ where: { id } });

    if (!inspection) {
      throw new NotFoundException('Inspección no encontrada.');
    }

    const updated = await this.prisma.inspection.update({
      where: { id },
      data: {
        inspectionType: dto.inspectionType,
        result: dto.result,
        observation: dto.observation,
      },
      include: {
        registeredBy: { select: { id: true, firstName: true, lastName: true } },
        workOrder: { select: { id: true, code: true } },
      },
    });

    return {
      data: updated,
      message: 'Inspección actualizada correctamente.',
    };
  }
}
