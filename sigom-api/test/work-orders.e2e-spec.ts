import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { JwtAuthGuard, RolesGuard } from '../src/auth/guards/jwt-auth.guard';
import { OutboxService } from '../src/integrations/outbox.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Valid UUID v4 format required by class-validator @IsUUID()
const UUIDS = {
  workOrder: '550e8400-e29b-41d4-a716-446655440001',
  zone: '550e8400-e29b-41d4-a716-446655440002',
  user: '550e8400-e29b-41d4-a716-446655440003',
  technician: '550e8400-e29b-41d4-a716-446655440004',
  assigner: '550e8400-e29b-41d4-a716-446655440005',
  closer: '550e8400-e29b-41d4-a716-446655440006',
};

const workOrderFixture = (overrides: Record<string, unknown> = {}) => ({
  id: UUIDS.workOrder,
  code: 'OT-2026-000001',
  type: 'CORRECTIVE_MAINTENANCE',
  status: 'PENDING',
  priority: 'MEDIUM',
  zoneId: UUIDS.zone,
  supplyId: null,
  meterId: null,
  scheduledAt: null,
  initialObservation: null,
  finalDiagnosis: null,
  solutionApplied: null,
  assignedToId: null,
  closedById: null,
  cancelledById: null,
  startedAt: null,
  resolvedAt: null,
  closedAt: null,
  cancelledAt: null,
  createdById: UUIDS.user,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const validCreateBody = () => ({
  type: 'CORRECTIVE_MAINTENANCE',
  zoneId: UUIDS.zone,
  createdById: UUIDS.user,
});

// ---------------------------------------------------------------------------
// Mock PrismaService
// ---------------------------------------------------------------------------

const mockPrisma = {
  workOrder: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  user: { findUnique: jest.fn() },
  orderAssignment: { create: jest.fn() },
  inspection: { count: jest.fn() },
  evidence: { findMany: jest.fn(), count: jest.fn() },
  integrationOutbox: { create: jest.fn() },
  $transaction: jest.fn(),
};

const mockOutboxService = {
  onModuleDestroy: jest.fn(),
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('WorkOrders (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(OutboxService)
      .useValue(mockOutboxService)
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
  });

  afterAll(() => app.close());
  afterEach(() => jest.clearAllMocks());

  // =========================================================================
  // GET /api/v1/work-orders
  // =========================================================================

  it('401 rejects an unauthenticated request in the real application guard', async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(OutboxService)
      .useValue(mockOutboxService)
      .compile();
    const protectedApp = module.createNestApplication();
    protectedApp.setGlobalPrefix('api/v1');
    await protectedApp.init();

    await request(protectedApp.getHttpServer()).get('/api/v1/work-orders').expect(401);
    await protectedApp.close();
  });

  describe('GET /api/v1/work-orders', () => {
    it('200 returns paginated response', async () => {
      const orders = [workOrderFixture()];
      mockPrisma.workOrder.findMany.mockResolvedValue(orders);
      mockPrisma.workOrder.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer()).get('/api/v1/work-orders');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        data: expect.any(Array),
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    });

    it('200 filters by status=PENDING', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([workOrderFixture()]);
      mockPrisma.workOrder.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer()).get('/api/v1/work-orders?status=PENDING');

      expect(res.status).toBe(200);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'PENDING' }) }),
      );
    });

    it('200 filters by priority=HIGH', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([workOrderFixture({ priority: 'HIGH' })]);
      mockPrisma.workOrder.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer()).get('/api/v1/work-orders?priority=HIGH');

      expect(res.status).toBe(200);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ priority: 'HIGH' }) }),
      );
    });
  });

  // =========================================================================
  // GET /api/v1/work-orders/:id
  // =========================================================================

  describe('GET /api/v1/work-orders/:id', () => {
    it('200 returns work order data', async () => {
      const order = workOrderFixture();
      mockPrisma.workOrder.findUnique.mockResolvedValue(order);

      const res = await request(app.getHttpServer()).get(`/api/v1/work-orders/${UUIDS.workOrder}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: UUIDS.workOrder, code: 'OT-2026-000001' });
    });

    it('404 when work order does not exist', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(`/api/v1/work-orders/${UUIDS.workOrder}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ statusCode: 404 });
    });
  });

  // =========================================================================
  // POST /api/v1/work-orders
  // =========================================================================

  describe('POST /api/v1/work-orders', () => {
    it('201 on valid body', async () => {
      const created = workOrderFixture();
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);
      mockPrisma.workOrder.create.mockResolvedValue(created);

      const res = await request(app.getHttpServer()).post('/api/v1/work-orders').send(validCreateBody());

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ id: UUIDS.workOrder });
    });

    it('400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/work-orders').send({});

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ statusCode: 400 });
    });
  });

  // =========================================================================
  // PATCH /api/v1/work-orders/:id/assign
  // =========================================================================

  describe('PATCH /api/v1/work-orders/:id/assign', () => {
    const assignBody = () => ({
      technicianId: UUIDS.technician,
      assignedById: UUIDS.assigner,
    });

    it('200 PENDING → ASSIGNED with active technician', async () => {
      const order = workOrderFixture({ status: 'PENDING' });
      const updatedOrder = workOrderFixture({ status: 'ASSIGNED', assignedToId: UUIDS.technician });
      const assignment = { id: UUIDS.closer, workOrderId: UUIDS.workOrder, technicianId: UUIDS.technician };

      mockPrisma.workOrder.findUnique.mockResolvedValue(order);
      mockPrisma.user.findUnique.mockResolvedValue({ id: UUIDS.technician, isActive: true });
      mockPrisma.$transaction.mockResolvedValue([updatedOrder, assignment]);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/work-orders/${UUIDS.workOrder}/assign`)
        .send(assignBody());

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ status: 'ASSIGNED' });
    });

    it('409 INVALID_WORK_ORDER_TRANSITION when order is IN_FIELD', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(workOrderFixture({ status: 'IN_FIELD' }));

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/work-orders/${UUIDS.workOrder}/assign`)
        .send(assignBody());

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({ code: 'INVALID_WORK_ORDER_TRANSITION' });
    });

    it('400 TECHNICIAN_NOT_ACTIVE when technician is inactive', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(workOrderFixture({ status: 'PENDING' }));
      mockPrisma.user.findUnique.mockResolvedValue({ id: UUIDS.technician, isActive: false });

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/work-orders/${UUIDS.workOrder}/assign`)
        .send(assignBody());

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ code: 'TECHNICIAN_NOT_ACTIVE' });
    });
  });

  // =========================================================================
  // PATCH /api/v1/work-orders/:id/start
  // =========================================================================

  describe('PATCH /api/v1/work-orders/:id/start', () => {
    it('200 ASSIGNED → IN_FIELD', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(workOrderFixture({ status: 'ASSIGNED' }));
      mockPrisma.workOrder.update.mockResolvedValue(workOrderFixture({ status: 'IN_FIELD' }));

      const res = await request(app.getHttpServer()).patch(`/api/v1/work-orders/${UUIDS.workOrder}/start`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ status: 'IN_FIELD' });
    });

    it('409 when order is PENDING (invalid transition)', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(workOrderFixture({ status: 'PENDING' }));

      const res = await request(app.getHttpServer()).patch(`/api/v1/work-orders/${UUIDS.workOrder}/start`);

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({ code: 'INVALID_WORK_ORDER_TRANSITION' });
    });
  });

  // =========================================================================
  // PATCH /api/v1/work-orders/:id/resolve
  // =========================================================================

  describe('PATCH /api/v1/work-orders/:id/resolve', () => {
    const resolveBody = () => ({
      finalDiagnosis: 'Broken valve',
      solutionApplied: 'Replaced valve',
    });

    it('200 IN_FIELD → RESOLVED', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(workOrderFixture({ status: 'IN_FIELD' }));
      mockPrisma.workOrder.update.mockResolvedValue(workOrderFixture({ status: 'RESOLVED', ...resolveBody() }));

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/work-orders/${UUIDS.workOrder}/resolve`)
        .send(resolveBody());

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ status: 'RESOLVED' });
    });

    it('409 when order is PENDING (invalid transition)', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(workOrderFixture({ status: 'PENDING' }));

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/work-orders/${UUIDS.workOrder}/resolve`)
        .send(resolveBody());

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({ code: 'INVALID_WORK_ORDER_TRANSITION' });
    });
  });

  // =========================================================================
  // PATCH /api/v1/work-orders/:id/close
  // =========================================================================

  describe('PATCH /api/v1/work-orders/:id/close', () => {
    const closeBody = () => ({ closedById: UUIDS.closer });

    it('200 RESOLVED → CLOSED with diagnosis, solution, and ≥1 inspection', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(
        workOrderFixture({
          status: 'RESOLVED',
          finalDiagnosis: 'Broken valve',
          solutionApplied: 'Replaced valve',
        }),
      );
      mockPrisma.inspection.count.mockResolvedValue(1);
      mockPrisma.workOrder.update.mockResolvedValue(workOrderFixture({ status: 'CLOSED' }));
      mockPrisma.$transaction.mockImplementation(async (callback: (client: typeof mockPrisma) => unknown) =>
        callback(mockPrisma),
      );

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/work-orders/${UUIDS.workOrder}/close`)
        .send(closeBody());

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ status: 'CLOSED' });
    });

    it('409 INSPECTION_REQUIRED when no inspections recorded', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(
        workOrderFixture({
          status: 'RESOLVED',
          finalDiagnosis: 'Broken valve',
          solutionApplied: 'Replaced valve',
        }),
      );
      mockPrisma.inspection.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/work-orders/${UUIDS.workOrder}/close`)
        .send(closeBody());

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({ code: 'INSPECTION_REQUIRED' });
    });
  });

  // =========================================================================
  // PATCH /api/v1/work-orders/:id/cancel
  // =========================================================================

  describe('PATCH /api/v1/work-orders/:id/cancel', () => {
    const cancelBody = () => ({ cancelledById: UUIDS.closer });

    it('200 from PENDING', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(workOrderFixture({ status: 'PENDING' }));
      mockPrisma.workOrder.update.mockResolvedValue(workOrderFixture({ status: 'CANCELLED' }));

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/work-orders/${UUIDS.workOrder}/cancel`)
        .send(cancelBody());

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ status: 'CANCELLED' });
    });

    it('409 from IN_FIELD (invalid transition)', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(workOrderFixture({ status: 'IN_FIELD' }));

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/work-orders/${UUIDS.workOrder}/cancel`)
        .send(cancelBody());

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({ code: 'INVALID_WORK_ORDER_TRANSITION' });
    });
  });
});
