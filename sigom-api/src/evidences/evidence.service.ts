import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';
import { QueryEvidenceDto } from './dto/query-evidence.dto';
import { buildOrderBy } from '../common/utils/query.utils';

const ALLOWED_SORT_FIELDS = ['registeredAt', 'mimeType', 'code'];

@Injectable()
export class EvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateCode(): Promise<string> {
    const year = new Date().getFullYear();

    const last = await this.prisma.evidence.findFirst({
      where: { code: { startsWith: `EVI-${year}` } },
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

    return `EVI-${year}-${String(sequence).padStart(6, '0')}`;
  }

  async create(dto: CreateEvidenceDto) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: dto.workOrderId },
    });

    if (!workOrder) {
      throw new NotFoundException('Orden de trabajo no encontrada.');
    }

    if (workOrder.status === 'CLOSED' || workOrder.status === 'CANCELLED') {
      throw new ConflictException({
        code: 'WORK_ORDER_CLOSED',
        message: 'No se puede registrar evidencia en una orden cerrada o anulada.',
      });
    }

    if (dto.inspectionId) {
      const inspection = await this.prisma.inspection.findUnique({
        where: { id: dto.inspectionId },
      });

      if (!inspection) {
        throw new NotFoundException('Inspección no encontrada.');
      }

      if (inspection.workOrderId !== dto.workOrderId) {
        throw new ConflictException({
          code: 'INSPECTION_MISMATCH',
          message: 'La inspección no pertenece a la orden de trabajo especificada.',
        });
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.registeredById },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado.');
    if (!user.isActive)
      throw new BadRequestException({ code: 'USER_NOT_ACTIVE', message: 'El usuario no está activo.' });

    for (let attempt = 0; attempt < 3; attempt++) {
      const code = await this.generateCode();
      try {
        const evidence = await this.prisma.evidence.create({
          data: {
            code,
            workOrderId: dto.workOrderId,
            inspectionId: dto.inspectionId,
            filePath: dto.filePath,
            mimeType: dto.mimeType,
            originalName: dto.originalName,
            observation: dto.observation,
            registeredById: dto.registeredById,
          },
          include: {
            registeredBy: { select: { id: true, firstName: true, lastName: true } },
            workOrder: { select: { id: true, code: true } },
            inspection: { select: { id: true, code: true } },
          },
        });

        return {
          data: evidence,
          message: 'Evidencia registrada correctamente.',
        };
      } catch (err: unknown) {
        if ((err as { code?: string })?.code === 'P2002' && attempt < 2) continue;
        throw err;
      }
    }
    throw new ConflictException({
      code: 'CODE_GENERATION_FAILED',
      message: 'No se pudo generar un código único. Intente nuevamente.',
    });
  }

  async findAll(query: QueryEvidenceDto) {
    const { page = 1, limit = 20, sortBy, sortOrder, q, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters.workOrderId) {
      where.workOrderId = filters.workOrderId;
    }

    if (filters.inspectionId) {
      where.inspectionId = filters.inspectionId;
    }

    if (filters.mimeType) {
      where.mimeType = filters.mimeType;
    }

    if (filters.registeredById) {
      where.registeredById = filters.registeredById;
    }

    if (q) {
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { originalName: { contains: q, mode: 'insensitive' } },
        { observation: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy = buildOrderBy(sortBy, sortOrder, ALLOWED_SORT_FIELDS, 'registeredAt');

    const [data, total] = await Promise.all([
      this.prisma.evidence.findMany({
        where: where as never,
        skip,
        take: limit,
        orderBy,
        include: {
          registeredBy: { select: { id: true, firstName: true, lastName: true } },
          workOrder: { select: { id: true, code: true } },
        },
      }),
      this.prisma.evidence.count({ where: where as never }),
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
    const evidence = await this.prisma.evidence.findUnique({
      where: { id },
      include: {
        registeredBy: { select: { id: true, firstName: true, lastName: true } },
        workOrder: { select: { id: true, code: true } },
        inspection: { select: { id: true, code: true } },
      },
    });

    if (!evidence) {
      throw new NotFoundException('Evidencia no encontrada.');
    }

    return { data: evidence };
  }

  async update(id: string, dto: UpdateEvidenceDto) {
    const evidence = await this.prisma.evidence.findUnique({ where: { id } });

    if (!evidence) {
      throw new NotFoundException('Evidencia no encontrada.');
    }

    const updated = await this.prisma.evidence.update({
      where: { id },
      data: { observation: dto.observation },
      include: {
        registeredBy: { select: { id: true, firstName: true, lastName: true } },
        workOrder: { select: { id: true, code: true } },
      },
    });

    return {
      data: updated,
      message: 'Evidencia actualizada correctamente.',
    };
  }
}
