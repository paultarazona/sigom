import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { PrismaService } from '../prisma/prisma.service';

// ── Mock factory ──────────────────────────────────────────────────────────────

const mockPrisma = {
  workOrder: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  orderAssignment: {
    create: jest.fn(),
  },
  inspection: {
    count: jest.fn(),
  },
  integrationOutbox: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

// ── Shared fixtures ───────────────────────────────────────────────────────────

const WORK_ORDER_ID = 'wo-uuid-1';
const USER_ID = 'user-uuid-1';
const TECHNICIAN_ID = 'tech-uuid-1';
const ASSIGNED_BY_ID = 'supervisor-uuid-1';

function makeWorkOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: WORK_ORDER_ID,
    code: 'OT-2025-000001',
    status: 'PENDING',
    finalDiagnosis: null,
    solutionApplied: null,
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkOrdersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── assign ────────────────────────────────────────────────────────────────

  describe('assign', () => {
    const dto = { technicianId: TECHNICIAN_ID, assignedById: ASSIGNED_BY_ID };

    it('should throw NotFoundException when work order does not exist', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.assign(WORK_ORDER_ID, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when transition from current status to ASSIGNED is invalid', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'IN_FIELD' }));

      await expect(service.assign(WORK_ORDER_ID, dto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException with code TECHNICIAN_NOT_ACTIVE when technician does not exist', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'PENDING' }));
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.assign(WORK_ORDER_ID, dto)).rejects.toMatchObject(
        expect.objectContaining({
          response: expect.objectContaining({ code: 'TECHNICIAN_NOT_ACTIVE' }),
        }),
      );
    });

    it('should throw BadRequestException with code TECHNICIAN_NOT_ACTIVE when technician is inactive', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'PENDING' }));
      mockPrisma.user.findUnique.mockResolvedValue({ id: TECHNICIAN_ID, isActive: false });

      await expect(service.assign(WORK_ORDER_ID, dto)).rejects.toMatchObject(
        expect.objectContaining({
          response: expect.objectContaining({ code: 'TECHNICIAN_NOT_ACTIVE' }),
        }),
      );
    });

    it('should call $transaction and return success on happy path', async () => {
      const updatedOrder = makeWorkOrder({ status: 'ASSIGNED' });
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'PENDING' }));
      mockPrisma.user.findUnique.mockResolvedValue({ id: TECHNICIAN_ID, isActive: true });
      mockPrisma.$transaction.mockResolvedValue([updatedOrder, {}]);

      const result = await service.assign(WORK_ORDER_ID, dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(updatedOrder);
      expect(result.message).toBeDefined();
    });

    it('should also succeed when current status is SUSPENDED (re-assign path)', async () => {
      const updatedOrder = makeWorkOrder({ status: 'ASSIGNED' });
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'SUSPENDED' }));
      mockPrisma.user.findUnique.mockResolvedValue({ id: TECHNICIAN_ID, isActive: true });
      mockPrisma.$transaction.mockResolvedValue([updatedOrder, {}]);

      const result = await service.assign(WORK_ORDER_ID, dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(updatedOrder);
    });
  });

  // ── start ─────────────────────────────────────────────────────────────────

  describe('start', () => {
    it('should throw NotFoundException when work order does not exist', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.start(WORK_ORDER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when transition to IN_FIELD is invalid', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'PENDING' }));

      await expect(service.start(WORK_ORDER_ID)).rejects.toThrow(ConflictException);
    });

    it('should return updated work order on happy path (ASSIGNED → IN_FIELD)', async () => {
      const updatedOrder = makeWorkOrder({ status: 'IN_FIELD' });
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'ASSIGNED' }));
      mockPrisma.workOrder.update.mockResolvedValue(updatedOrder);

      const result = await service.start(WORK_ORDER_ID);

      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: WORK_ORDER_ID },
          data: expect.objectContaining({ status: 'IN_FIELD' }),
        }),
      );
      expect(result.data).toEqual(updatedOrder);
    });
  });

  // ── suspend ───────────────────────────────────────────────────────────────

  describe('suspend', () => {
    it('should throw NotFoundException when work order does not exist', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.suspend(WORK_ORDER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when transition to SUSPENDED is invalid', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'ASSIGNED' }));

      await expect(service.suspend(WORK_ORDER_ID)).rejects.toThrow(ConflictException);
    });

    it('should return updated work order on happy path (IN_FIELD → SUSPENDED)', async () => {
      const updatedOrder = makeWorkOrder({ status: 'SUSPENDED' });
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'IN_FIELD' }));
      mockPrisma.workOrder.update.mockResolvedValue(updatedOrder);

      const result = await service.suspend(WORK_ORDER_ID);

      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: WORK_ORDER_ID },
          data: expect.objectContaining({ status: 'SUSPENDED' }),
        }),
      );
      expect(result.data).toEqual(updatedOrder);
    });
  });

  // ── resolve ───────────────────────────────────────────────────────────────

  describe('resolve', () => {
    const body = { finalDiagnosis: 'Leak detected', solutionApplied: 'Pipe replaced' };

    it('should throw NotFoundException when work order does not exist', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.resolve(WORK_ORDER_ID, body)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when transition to RESOLVED is invalid', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'ASSIGNED' }));

      await expect(service.resolve(WORK_ORDER_ID, body)).rejects.toThrow(ConflictException);
    });

    it('should return updated work order on happy path (IN_FIELD → RESOLVED)', async () => {
      const updatedOrder = makeWorkOrder({ status: 'RESOLVED', ...body });
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'IN_FIELD' }));
      mockPrisma.workOrder.update.mockResolvedValue(updatedOrder);

      const result = await service.resolve(WORK_ORDER_ID, body);

      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'RESOLVED',
            finalDiagnosis: body.finalDiagnosis,
            solutionApplied: body.solutionApplied,
          }),
        }),
      );
      expect(result.data).toEqual(updatedOrder);
    });
  });

  // ── close ─────────────────────────────────────────────────────────────────

  describe('close', () => {
    it('should throw NotFoundException when work order does not exist', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.close(WORK_ORDER_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when transition to CLOSED is invalid', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'IN_FIELD' }));

      await expect(service.close(WORK_ORDER_ID, USER_ID)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException with code INSPECTION_REQUIRED when finalDiagnosis is missing', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(
        makeWorkOrder({ status: 'RESOLVED', finalDiagnosis: null, solutionApplied: 'Fixed' }),
      );

      await expect(service.close(WORK_ORDER_ID, USER_ID)).rejects.toMatchObject(
        expect.objectContaining({
          response: expect.objectContaining({ code: 'INSPECTION_REQUIRED' }),
        }),
      );
    });

    it('should throw ConflictException with code INSPECTION_REQUIRED when solutionApplied is missing', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(
        makeWorkOrder({
          status: 'RESOLVED',
          finalDiagnosis: 'Leak',
          solutionApplied: null,
        }),
      );

      await expect(service.close(WORK_ORDER_ID, USER_ID)).rejects.toMatchObject(
        expect.objectContaining({
          response: expect.objectContaining({ code: 'INSPECTION_REQUIRED' }),
        }),
      );
    });

    it('should throw ConflictException with code INSPECTION_REQUIRED when there are zero inspections', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(
        makeWorkOrder({
          status: 'RESOLVED',
          finalDiagnosis: 'Leak',
          solutionApplied: 'Fixed',
        }),
      );
      mockPrisma.inspection.count.mockResolvedValue(0);

      await expect(service.close(WORK_ORDER_ID, USER_ID)).rejects.toMatchObject(
        expect.objectContaining({
          response: expect.objectContaining({ code: 'INSPECTION_REQUIRED' }),
        }),
      );
    });

    it('should return updated work order on happy path (RESOLVED → CLOSED)', async () => {
      const updatedOrder = makeWorkOrder({ status: 'CLOSED' });
      mockPrisma.workOrder.findUnique.mockResolvedValue(
        makeWorkOrder({
          status: 'RESOLVED',
          finalDiagnosis: 'Leak',
          solutionApplied: 'Fixed',
        }),
      );
      mockPrisma.inspection.count.mockResolvedValue(2);
      mockPrisma.workOrder.update.mockResolvedValue(updatedOrder);
      mockPrisma.$transaction.mockImplementation(async (callback: (client: typeof mockPrisma) => unknown) =>
        callback(mockPrisma),
      );

      const result = await service.close(WORK_ORDER_ID, USER_ID);

      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'CLOSED', closedById: USER_ID }),
        }),
      );
      expect(result.data).toEqual(updatedOrder);
    });
  });

  // ── cancel ────────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('should throw NotFoundException when work order does not exist', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.cancel(WORK_ORDER_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when transition to CANCELLED is invalid (IN_FIELD)', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'IN_FIELD' }));

      await expect(service.cancel(WORK_ORDER_ID, USER_ID)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when transition to CANCELLED is invalid (RESOLVED)', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'RESOLVED' }));

      await expect(service.cancel(WORK_ORDER_ID, USER_ID)).rejects.toThrow(ConflictException);
    });

    it('should return updated work order when cancelling from PENDING', async () => {
      const updatedOrder = makeWorkOrder({ status: 'CANCELLED' });
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'PENDING' }));
      mockPrisma.workOrder.update.mockResolvedValue(updatedOrder);

      const result = await service.cancel(WORK_ORDER_ID, USER_ID);

      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'CANCELLED',
            cancelledById: USER_ID,
          }),
        }),
      );
      expect(result.data).toEqual(updatedOrder);
    });

    it('should return updated work order when cancelling from ASSIGNED', async () => {
      const updatedOrder = makeWorkOrder({ status: 'CANCELLED' });
      mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder({ status: 'ASSIGNED' }));
      mockPrisma.workOrder.update.mockResolvedValue(updatedOrder);

      const result = await service.cancel(WORK_ORDER_ID, USER_ID);

      expect(result.data).toEqual(updatedOrder);
    });
  });
});
