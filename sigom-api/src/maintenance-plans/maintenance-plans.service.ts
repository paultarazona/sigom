import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto';
import { QueryMaintenancePlanDto } from './dto/query-maintenance-plan.dto';

const ALLOWED_SORT_FIELDS = ['createdAt', 'name', 'startDate', 'frequencyDays'];

@Injectable()
export class MaintenancePlansService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateCode(): Promise<string> {
    const year = new Date().getFullYear();

    const last = await this.prisma.maintenancePlan.findFirst({
      where: { code: { startsWith: `PM-${year}` } },
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

    return `PM-${year}-${String(sequence).padStart(6, '0')}`;
  }

  async create(dto: CreateMaintenancePlanDto) {
    const code = await this.generateCode();

    const plan = await this.prisma.maintenancePlan.create({
      data: {
        code,
        name: dto.name,
        description: dto.description,
        frequencyDays: dto.frequencyDays,
        startDate: new Date(dto.startDate),
      },
    });

    return {
      data: plan,
      message: 'Plan de mantenimiento creado correctamente.',
    };
  }

  async findAll(query: QueryMaintenancePlanDto) {
    const { page = 1, limit = 20, sortBy, sortOrder, q, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (q) {
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, string> = {};
    if (sortBy && ALLOWED_SORT_FIELDS.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy['createdAt'] = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.maintenancePlan.findMany({
        where: where as never,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.maintenancePlan.count({ where: where as never }),
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
    const plan = await this.prisma.maintenancePlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plan de mantenimiento no encontrado.');
    }

    return { data: plan };
  }

  async update(id: string, dto: UpdateMaintenancePlanDto) {
    const plan = await this.prisma.maintenancePlan.findUnique({ where: { id } });

    if (!plan) {
      throw new NotFoundException('Plan de mantenimiento no encontrado.');
    }

    const updated = await this.prisma.maintenancePlan.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        frequencyDays: dto.frequencyDays,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        isActive: dto.isActive,
      },
    });

    return {
      data: updated,
      message: 'Plan de mantenimiento actualizado correctamente.',
    };
  }
}
