import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryTechnicianDto } from './dto/query-technician.dto';

const ALLOWED_SORT_FIELDS = ['firstName', 'lastName', 'createdAt'];

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryTechnicianDto) {
    const { page = 1, limit = 20, sortBy, sortOrder, q, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      role: 'TECHNICIAN',
    };

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, string> = {};
    if (sortBy && ALLOWED_SORT_FIELDS.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy['lastName'] = 'asc';
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: where as never,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              assignedOrders: {
                where: { status: { in: ['ASSIGNED', 'IN_FIELD', 'SUSPENDED'] } },
              },
            },
          },
        },
      }),
      this.prisma.user.count({ where: where as never }),
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
    const technician = await this.prisma.user.findFirst({
      where: { id, role: 'TECHNICIAN' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            assignedOrders: {
              where: { status: { in: ['ASSIGNED', 'IN_FIELD', 'SUSPENDED'] } },
            },
          },
        },
        assignedOrders: {
          where: { status: { in: ['ASSIGNED', 'IN_FIELD', 'SUSPENDED'] } },
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            code: true,
            type: true,
            priority: true,
            status: true,
            scheduledAt: true,
          },
        },
      },
    });

    if (!technician) {
      throw new NotFoundException('Técnico no encontrado.');
    }

    return { data: technician };
  }
}
