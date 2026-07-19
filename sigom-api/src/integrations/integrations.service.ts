import { BadRequestException, ConflictException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { mapIncidentType } from './integration-mapping';
import { CreateOrderFromIncidentDto } from './dto/create-order-from-incident.dto';

const SOURCE_SYSTEM = 'SISCON';
const OPERATION = 'CREATE_WORK_ORDER';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;
type IntegrationResponse = {
  data: {
    id: string;
    code: string;
    status: string;
    sourceSystem: string;
    sourceIncidentId: string;
    sourceIncidentCode: string;
  };
  message: string;
};

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private async generateCode(client: TransactionClient): Promise<string> {
    const year = new Date().getFullYear();
    const last = await client.workOrder.findFirst({
      where: { code: { startsWith: `OT-${year}` } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });
    const sequence = last?.code.match(/-(\d{6})$/)?.[1];
    return `OT-${year}-${String(sequence ? Number(sequence) + 1 : 1).padStart(6, '0')}`;
  }

  async createOrderFromIncident(
    dto: CreateOrderFromIncidentDto,
    idempotencyKey?: string,
  ): Promise<IntegrationResponse> {
    if (!idempotencyKey) {
      throw new BadRequestException({ code: 'IDEMPOTENCY_KEY_REQUIRED', message: 'Idempotency-Key es obligatorio.' });
    }

    const payloadHash = createHash('sha256').update(JSON.stringify(dto)).digest('hex');
    try {
      return await this.prisma.$transaction(async (client) => {
        const existing = await client.integrationInbox.findUnique({
          where: {
            sourceSystem_operation_idempotencyKey: {
              sourceSystem: SOURCE_SYSTEM,
              operation: OPERATION,
              idempotencyKey,
            },
          },
        });
        if (existing) {
          if (existing.payloadHash !== payloadHash) {
            throw new ConflictException({
              code: 'IDEMPOTENCY_KEY_REUSED',
              message: 'La clave de idempotencia fue usada con otro payload.',
            });
          }
          if (existing.responseBody) return existing.responseBody as unknown as IntegrationResponse;
          throw new ConflictException({
            code: 'INTEGRATION_REQUEST_IN_PROGRESS',
            message: 'La solicitud de integración está siendo procesada.',
          });
        }

        const technicalEmail = this.config.get<string>(
          'SISCON_INTEGRATION_USER_EMAIL',
          'siscon-integration@sigom.internal',
        );
        const actor = await client.user.findUnique({ where: { email: technicalEmail } });
        if (!actor?.isActive) {
          throw new ServiceUnavailableException({
            code: 'INTEGRATION_ACTOR_UNAVAILABLE',
            message: 'El actor técnico de integración no está disponible.',
          });
        }

        const existingOrder = await client.workOrder.findUnique({
          where: {
            sourceSystem_sourceIncidentId: { sourceSystem: SOURCE_SYSTEM, sourceIncidentId: dto.incident.externalId },
          },
        });
        if (existingOrder) {
          const response = this.response(existingOrder);
          await client.integrationInbox.create({
            data: this.inboxData(idempotencyKey, payloadHash, response, existingOrder.id),
          });
          return response;
        }

        const workOrder = await client.workOrder.create({
          data: {
            code: await this.generateCode(client),
            type: mapIncidentType(dto.incident.type),
            priority: dto.incident.level,
            initialObservation: [dto.incident.description, dto.incident.readingObservation].filter(Boolean).join('\n'),
            sourceSystem: SOURCE_SYSTEM,
            sourceIncidentId: dto.incident.externalId,
            sourceIncidentCode: dto.incident.code,
            sourceIncidentType: dto.incident.type,
            detectedAt: new Date(dto.incident.detectedAt),
            sourceZoneId: dto.asset.zone.externalId,
            sourceZoneName: dto.asset.zone.name,
            sourceSupplyId: dto.asset.supply.externalId,
            sourceSupplyCode: dto.asset.supply.code,
            sourceMeterId: dto.asset.meter.externalId,
            sourceMeterCode: dto.asset.meter.code,
            addressSnapshot: dto.asset.addressSnapshot,
            createdById: actor.id,
          },
        });
        const response = this.response(workOrder);
        await client.integrationInbox.create({
          data: this.inboxData(idempotencyKey, payloadHash, response, workOrder.id),
        });
        return response;
      });
    } catch (error: unknown) {
      if ((error as { code?: string }).code !== 'P2002') throw error;
      const existing = await this.prisma.integrationInbox.findUnique({
        where: {
          sourceSystem_operation_idempotencyKey: { sourceSystem: SOURCE_SYSTEM, operation: OPERATION, idempotencyKey },
        },
      });
      if (existing?.payloadHash !== payloadHash) {
        throw new ConflictException({
          code: 'IDEMPOTENCY_KEY_REUSED',
          message: 'La clave de idempotencia fue usada con otro payload.',
        });
      }
      if (existing?.responseBody) return existing.responseBody as unknown as IntegrationResponse;
      throw new ConflictException({ code: 'INTEGRATION_CONFLICT', message: 'La incidencia ya está siendo procesada.' });
    }
  }

  private inboxData(
    idempotencyKey: string,
    payloadHash: string,
    response: IntegrationResponse,
    workOrderId: string,
  ): Prisma.IntegrationInboxCreateInput {
    return {
      sourceSystem: SOURCE_SYSTEM,
      operation: OPERATION,
      idempotencyKey,
      payloadHash,
      statusCode: 201,
      responseBody: response,
      workOrder: { connect: { id: workOrderId } },
    };
  }

  private response(workOrder: {
    id: string;
    code: string;
    status: string;
    sourceSystem: string;
    sourceIncidentId: string | null;
    sourceIncidentCode: string | null;
  }): IntegrationResponse {
    return {
      data: {
        id: workOrder.id,
        code: workOrder.code,
        status: workOrder.status,
        sourceSystem: workOrder.sourceSystem,
        sourceIncidentId: workOrder.sourceIncidentId!,
        sourceIncidentCode: workOrder.sourceIncidentCode!,
      },
      message: 'Orden de trabajo creada desde SISCON correctamente.',
    };
  }
}
