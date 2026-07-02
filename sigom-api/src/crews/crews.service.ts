import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCrewDto } from './dto/create-crew.dto';
import { UpdateCrewDto } from './dto/update-crew.dto';
import { AddCrewMemberDto } from './dto/add-crew-member.dto';
import { QueryCrewDto } from './dto/query-crew.dto';

const ALLOWED_SORT_FIELDS = ['createdAt', 'name'];

@Injectable()
export class CrewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCrewDto) {
    const leader = await this.prisma.user.findUnique({
      where: { id: dto.leaderId },
    });

    if (!leader || !leader.isActive) {
      throw new BadRequestException({
        code: 'USER_NOT_ACTIVE',
        message: 'El líder de cuadrilla no está activo.',
      });
    }

    const crew = await this.prisma.crew.create({
      data: {
        name: dto.name,
        leaderId: dto.leaderId,
      },
      include: {
        leader: { select: { id: true, firstName: true, lastName: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    return {
      data: crew,
      message: 'Cuadrilla creada correctamente.',
    };
  }

  async findAll(query: QueryCrewDto) {
    const { page = 1, limit = 20, sortBy, sortOrder, q, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (q) {
      where.name = { contains: q, mode: 'insensitive' };
    }

    const orderBy: Record<string, string> = {};
    if (sortBy && ALLOWED_SORT_FIELDS.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy['createdAt'] = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.crew.findMany({
        where: where as never,
        skip,
        take: limit,
        orderBy,
        include: {
          leader: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { members: true } },
        },
      }),
      this.prisma.crew.count({ where: where as never }),
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
    const crew = await this.prisma.crew.findUnique({
      where: { id },
      include: {
        leader: { select: { id: true, firstName: true, lastName: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, role: true, isActive: true } },
          },
        },
      },
    });

    if (!crew) {
      throw new NotFoundException('Cuadrilla no encontrada.');
    }

    return { data: crew };
  }

  async update(id: string, dto: UpdateCrewDto) {
    const crew = await this.prisma.crew.findUnique({ where: { id } });

    if (!crew) {
      throw new NotFoundException('Cuadrilla no encontrada.');
    }

    if (dto.leaderId) {
      const leader = await this.prisma.user.findUnique({
        where: { id: dto.leaderId },
      });

      if (!leader || !leader.isActive) {
        throw new BadRequestException({
          code: 'USER_NOT_ACTIVE',
          message: 'El líder de cuadrilla no está activo.',
        });
      }
    }

    const updated = await this.prisma.crew.update({
      where: { id },
      data: {
        name: dto.name,
        leaderId: dto.leaderId,
        isActive: dto.isActive,
      },
      include: {
        leader: { select: { id: true, firstName: true, lastName: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    return {
      data: updated,
      message: 'Cuadrilla actualizada correctamente.',
    };
  }

  async addMember(id: string, dto: AddCrewMemberDto) {
    const crew = await this.prisma.crew.findUnique({ where: { id } });

    if (!crew) {
      throw new NotFoundException('Cuadrilla no encontrada.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user || !user.isActive) {
      throw new BadRequestException({
        code: 'USER_NOT_ACTIVE',
        message: 'El usuario no está activo.',
      });
    }

    const existing = await this.prisma.crewMember.findUnique({
      where: { crewId_userId: { crewId: id, userId: dto.userId } },
    });

    if (existing) {
      throw new ConflictException({
        code: 'MEMBER_ALREADY_EXISTS',
        message: 'El usuario ya es miembro de esta cuadrilla.',
      });
    }

    await this.prisma.crewMember.create({
      data: {
        crewId: id,
        userId: dto.userId,
      },
    });

    const updated = await this.prisma.crew.findUnique({
      where: { id },
      include: {
        leader: { select: { id: true, firstName: true, lastName: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    return {
      data: updated,
      message: 'Miembro agregado a la cuadrilla.',
    };
  }

  async removeMember(id: string, userId: string) {
    const crew = await this.prisma.crew.findUnique({ where: { id } });

    if (!crew) {
      throw new NotFoundException('Cuadrilla no encontrada.');
    }

    const member = await this.prisma.crewMember.findUnique({
      where: { crewId_userId: { crewId: id, userId } },
    });

    if (!member) {
      throw new NotFoundException('Miembro no encontrado en la cuadrilla.');
    }

    await this.prisma.crewMember.delete({
      where: { id: member.id },
    });

    return {
      data: null,
      message: 'Miembro removido de la cuadrilla.',
    };
  }
}
