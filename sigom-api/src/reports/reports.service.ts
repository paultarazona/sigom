import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportDateRangeDto } from './dto/report-date-range.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildDateFilter(from?: string, to?: string) {
    const filter: Record<string, Date> = {};
    if (from) filter.gte = new Date(from);
    if (to) filter.lte = new Date(to);
    return Object.keys(filter).length ? filter : undefined;
  }

  async summary(query: ReportDateRangeDto) {
    const dateFilter = this.buildDateFilter(query.from, query.to);

    const where = dateFilter ? { createdAt: dateFilter } : {};

    const [total, byStatus] = await Promise.all([
      this.prisma.workOrder.count({ where }),
      this.prisma.workOrder.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
    ]);

    const statusCount = Object.fromEntries(byStatus.map((g) => [g.status, g._count.id]));

    return {
      data: {
        total,
        pending: statusCount.PENDING || 0,
        assigned: statusCount.ASSIGNED || 0,
        inField: statusCount.IN_FIELD || 0,
        suspended: statusCount.SUSPENDED || 0,
        resolved: statusCount.RESOLVED || 0,
        closed: statusCount.CLOSED || 0,
        cancelled: statusCount.CANCELLED || 0,
      },
    };
  }

  async workOrdersByZone(query: ReportDateRangeDto) {
    const dateFilter = this.buildDateFilter(query.from, query.to);
    const where = dateFilter ? { createdAt: dateFilter } : {};

    const data = await this.prisma.workOrder.groupBy({
      by: ['zoneId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return { data };
  }

  async averageAttentionTime(query: ReportDateRangeDto) {
    const dateFilter = this.buildDateFilter(query.from, query.to);
    const where = dateFilter ? { createdAt: dateFilter } : {};

    const orders = await this.prisma.workOrder.findMany({
      where: {
        ...where,
        status: 'CLOSED',
        startedAt: { not: null },
        closedAt: { not: null },
      },
      select: { startedAt: true, closedAt: true },
    });

    if (orders.length === 0) {
      return { data: { averageHours: 0, count: 0 } };
    }

    const totalMs = orders.reduce((sum, o) => {
      return sum + (o.closedAt!.getTime() - o.startedAt!.getTime());
    }, 0);

    const averageHours = Math.round((totalMs / orders.length / (1000 * 60 * 60)) * 100) / 100;

    return {
      data: { averageHours, count: orders.length },
    };
  }

  async technicianWorkload(query: ReportDateRangeDto) {
    const dateFilter = this.buildDateFilter(query.from, query.to);
    const where = dateFilter ? { createdAt: dateFilter } : {};

    const data = await this.prisma.user.findMany({
      where: { role: 'TECHNICIAN', isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        _count: {
          select: {
            assignedOrders: {
              where: {
                ...where,
                status: { in: ['ASSIGNED', 'IN_FIELD', 'SUSPENDED'] },
              },
            },
          },
        },
      },
      orderBy: {
        assignedOrders: { _count: 'desc' },
      },
    });

    return {
      data: data.map((t) => ({
        id: t.id,
        firstName: t.firstName,
        lastName: t.lastName,
        activeOrders: t._count.assignedOrders,
      })),
    };
  }

  async commonFailures(query: ReportDateRangeDto) {
    const dateFilter = this.buildDateFilter(query.from, query.to);
    const where = dateFilter ? { registeredAt: dateFilter } : {};

    const data = await this.prisma.inspection.groupBy({
      by: ['result'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return { data };
  }

  async replacedMeters(query: ReportDateRangeDto) {
    const dateFilter = this.buildDateFilter(query.from, query.to);
    const where = dateFilter
      ? { createdAt: dateFilter, type: 'METER_REPLACEMENT' as const }
      : { type: 'METER_REPLACEMENT' as const };

    const count = await this.prisma.workOrder.count({ where });

    return { data: { count } };
  }
}
