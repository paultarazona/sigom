import { PrismaClient, UserRole, WorkOrderType, WorkOrderPriority, WorkOrderStatus, InspectionResult } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de SIGOM-ENOSA...');

  // ─── USERS ────────────────────────────────────────
  const users = [
    { id: uuidv4(), email: 'admin@sigom.pe', password: 'admin123', firstName: 'Admin', lastName: 'SIGOM', role: UserRole.ADMIN },
    { id: uuidv4(), email: 'supervisor@sigom.pe', password: 'super123', firstName: 'Carlos', lastName: 'Reyes', role: UserRole.SUPERVISOR },
    { id: uuidv4(), email: 'maria.lopez@sigom.pe', password: 'super123', firstName: 'María', lastName: 'López', role: UserRole.SUPERVISOR },
    { id: uuidv4(), email: 'juan.perez@sigom.pe', password: 'tech123', firstName: 'Juan', lastName: 'Pérez', role: UserRole.TECHNICIAN },
    { id: uuidv4(), email: 'luis.garcia@sigom.pe', password: 'tech123', firstName: 'Luis', lastName: 'García', role: UserRole.TECHNICIAN },
    { id: uuidv4(), email: 'pedro.torres@sigom.pe', password: 'tech123', firstName: 'Pedro', lastName: 'Torres', role: UserRole.TECHNICIAN },
    { id: uuidv4(), email: 'rosa.diaz@sigom.pe', password: 'tech123', firstName: 'Rosa', lastName: 'Díaz', role: UserRole.TECHNICIAN },
    { id: uuidv4(), email: 'visor@sigom.pe', password: 'viewer123', firstName: 'Ana', lastName: 'Visor', role: UserRole.VIEWER },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
      },
    });
  }
  console.log(`✅ ${users.length} usuarios creados.`);

  const admin = users[0];
  const supervisor1 = users[1];
  const supervisor2 = users[2];
  const tech1 = users[3];
  const tech2 = users[4];
  const tech3 = users[5];
  const tech4 = users[6];

  // ─── CREWS ────────────────────────────────────────
  const crew1Id = uuidv4();
  const crew2Id = uuidv4();

  await prisma.crew.createMany({
    data: [
      { id: crew1Id, name: 'Cuadrilla Norte', leaderId: tech1.id },
      { id: crew2Id, name: 'Cuadrilla Sur', leaderId: tech3.id },
    ],
  });

  await prisma.crewMember.createMany({
    data: [
      { crewId: crew1Id, userId: tech1.id },
      { crewId: crew1Id, userId: tech2.id },
      { crewId: crew2Id, userId: tech3.id },
      { crewId: crew2Id, userId: tech4.id },
    ],
  });
  console.log('✅ 2 cuadrillas creadas con miembros.');

  // ─── MAINTENANCE PLANS ────────────────────────────
  await prisma.maintenancePlan.createMany({
    data: [
      { code: 'PM-2026-000001', name: 'Inspección trimestral de medidores', description: 'Revisión preventiva de medidores en zonas urbanas.', frequencyDays: 90, startDate: new Date('2026-01-01') },
      { code: 'PM-2026-000002', name: 'Mantenimiento semestral de conexiones', description: 'Verificación de conexiones domiciliarias.', frequencyDays: 180, startDate: new Date('2026-02-15') },
      { code: 'PM-2026-000003', name: 'Revisión anual de transformadores', description: 'Inspección de transformadores de distribución.', frequencyDays: 365, startDate: new Date('2026-03-01'), isActive: false },
    ],
  });
  console.log('✅ 3 planes de mantenimiento creados.');

  // ─── ZONE IDS (simulados, vienen de SISCON) ─────
  const zones = [uuidv4(), uuidv4(), uuidv4()];

  // ─── WORK ORDERS ─────────────────────────────────
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const workOrders = [
    // CLOSED
    {
      id: uuidv4(), code: 'OT-2026-000001', type: WorkOrderType.METER_INSPECTION, priority: WorkOrderPriority.HIGH, status: WorkOrderStatus.CLOSED,
      initialObservation: 'Consumo irregular detectado en suministro.', finalDiagnosis: 'Medidor con alteración en conexiones internas.', solutionApplied: 'Reemplazo de medidor y sellado de conexiones.',
      scheduledAt: twoWeeksAgo, startedAt: twoWeeksAgo, resolvedAt: new Date(twoWeeksAgo.getTime() + 2 * 60 * 60 * 1000),
      closedAt: new Date(twoWeeksAgo.getTime() + 4 * 60 * 60 * 1000), zoneId: zones[0],
      createdById: supervisor1.id, assignedToId: tech1.id, closedById: supervisor1.id,
    },
    {
      id: uuidv4(), code: 'OT-2026-000002', type: WorkOrderType.CONSUMPTION_VERIFICATION, priority: WorkOrderPriority.CRITICAL, status: WorkOrderStatus.CLOSED,
      initialObservation: 'Cliente reporta consumo excesivo.', finalDiagnosis: 'Fuga interna en instalación del cliente.', solutionApplied: 'Notificación al cliente para reparación interna.',
      scheduledAt: twoWeeksAgo, startedAt: twoWeeksAgo, resolvedAt: twoWeeksAgo, closedAt: twoWeeksAgo,
      zoneId: zones[1], createdById: supervisor1.id, assignedToId: tech2.id, closedById: supervisor1.id,
    },
    // RESOLVED
    {
      id: uuidv4(), code: 'OT-2026-000003', type: WorkOrderType.METER_REPLACEMENT, priority: WorkOrderPriority.MEDIUM, status: WorkOrderStatus.RESOLVED,
      initialObservation: 'Medidor reportado como dañado por lectura.', finalDiagnosis: 'Pantalla LCD del medidor no funciona.', solutionApplied: 'Medidor reemplazado por unidad nueva.',
      scheduledAt: lastWeek, startedAt: lastWeek, resolvedAt: new Date(lastWeek.getTime() + 3 * 60 * 60 * 1000),
      zoneId: zones[2], createdById: supervisor2.id, assignedToId: tech3.id,
    },
    // IN_FIELD
    {
      id: uuidv4(), code: 'OT-2026-000004', type: WorkOrderType.CLAIM_ATTENTION, priority: WorkOrderPriority.HIGH, status: WorkOrderStatus.IN_FIELD,
      initialObservation: 'Cliente reclama corte indebido del servicio.',
      scheduledAt: yesterday, startedAt: yesterday, zoneId: zones[0],
      createdById: supervisor1.id, assignedToId: tech4.id,
    },
    {
      id: uuidv4(), code: 'OT-2026-000005', type: WorkOrderType.CONNECTION_VERIFICATION, priority: WorkOrderPriority.MEDIUM, status: WorkOrderStatus.IN_FIELD,
      initialObservation: 'Verificación de nueva conexión residencial.',
      scheduledAt: now, startedAt: now, zoneId: zones[1],
      createdById: supervisor2.id, assignedToId: tech1.id,
    },
    // ASSIGNED
    {
      id: uuidv4(), code: 'OT-2026-000006', type: WorkOrderType.CORRECTIVE_MAINTENANCE, priority: WorkOrderPriority.HIGH, status: WorkOrderStatus.ASSIGNED,
      initialObservation: 'Poste con cable suelto reportado por vecinos.',
      scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), zoneId: zones[2],
      createdById: supervisor1.id, assignedToId: tech2.id,
    },
    {
      id: uuidv4(), code: 'OT-2026-000007', type: WorkOrderType.METER_INSPECTION, priority: WorkOrderPriority.LOW, status: WorkOrderStatus.ASSIGNED,
      initialObservation: 'Inspección rutinaria de medidor.',
      scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), zoneId: zones[0],
      createdById: supervisor2.id, assignedToId: tech1.id,
    },
    // PENDING (sin asignar)
    {
      id: uuidv4(), code: 'OT-2026-000008', type: WorkOrderType.DISCONNECTION_RECONNECTION, priority: WorkOrderPriority.CRITICAL, status: WorkOrderStatus.PENDING,
      initialObservation: 'Reconexión urgente solicitada por área comercial.',
      scheduledAt: now, zoneId: zones[1], createdById: supervisor1.id,
    },
    {
      id: uuidv4(), code: 'OT-2026-000009', type: WorkOrderType.PREVENTIVE_MAINTENANCE, priority: WorkOrderPriority.LOW, status: WorkOrderStatus.PENDING,
      initialObservation: 'Mantenimiento preventivo programado trimestral.',
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), zoneId: zones[2],
      createdById: supervisor2.id,
    },
    // SUSPENDED
    {
      id: uuidv4(), code: 'OT-2026-000010', type: WorkOrderType.METER_INSPECTION, priority: WorkOrderPriority.MEDIUM, status: WorkOrderStatus.SUSPENDED,
      initialObservation: 'Inspección de medidor en zona de difícil acceso.',
      scheduledAt: yesterday, startedAt: yesterday, zoneId: zones[0],
      createdById: supervisor1.id, assignedToId: tech3.id,
    },
    // CANCELLED
    {
      id: uuidv4(), code: 'OT-2026-000011', type: WorkOrderType.CLAIM_ATTENTION, priority: WorkOrderPriority.LOW, status: WorkOrderStatus.CANCELLED,
      initialObservation: 'Reclamo duplicado, ya fue atendido.',
      zoneId: zones[1], createdById: supervisor2.id, cancelledById: supervisor2.id, cancelledAt: yesterday,
    },
    // Incident-linked
    {
      id: uuidv4(), code: 'OT-2026-000012', type: WorkOrderType.CONSUMPTION_VERIFICATION, priority: WorkOrderPriority.HIGH, status: WorkOrderStatus.ASSIGNED,
      initialObservation: 'Consumo anómalo detectado por SISCON.',
      sourceSystem: 'SISCON', incidentId: uuidv4(), incidentCode: 'INC-2026-00456',
      zoneId: zones[2], createdById: supervisor1.id, assignedToId: tech4.id,
    },
  ];

  for (const wo of workOrders) {
    await prisma.workOrder.create({ data: wo });
  }
  console.log(`✅ ${workOrders.length} órdenes de trabajo creadas.`);

  // ─── ORDER ASSIGNMENTS ────────────────────────────
  // Para las órdenes ASSIGNED, crear registros de asignación
  const assignedOrders = workOrders.filter(wo => wo.assignedToId);
  const assignmentData = assignedOrders.map(wo => ({
    id: uuidv4(),
    workOrderId: wo.id,
    technicianId: wo.assignedToId!,
    assignedById: wo.createdById,
    assignedAt: now,
  }));

  await prisma.orderAssignment.createMany({ data: assignmentData });
  console.log(`✅ ${assignmentData.length} asignaciones creadas.`);

  // ─── INSPECTIONS ─────────────────────────────────
  const closedOrders = workOrders.filter(wo => wo.status === 'CLOSED' || wo.status === 'RESOLVED');
  const inspections = [
    { id: uuidv4(), code: 'INS-2026-000001', workOrderId: closedOrders[0].id, inspectionType: 'Inspección visual de medidor', result: InspectionResult.METER_TAMPERED, observation: 'Sellos de seguridad rotos, conexiones alteradas.', registeredById: tech1.id },
    { id: uuidv4(), code: 'INS-2026-000002', workOrderId: closedOrders[1].id, inspectionType: 'Verificación de consumo', result: InspectionResult.INTERNAL_LEAK, observation: 'Fuga detectada después del medidor, responsabilidad del cliente.', registeredById: tech2.id },
    { id: uuidv4(), code: 'INS-2026-000003', workOrderId: closedOrders[2].id, inspectionType: 'Revisión de medidor', result: InspectionResult.METER_DAMAGED, observation: 'Pantalla LCD con falla de visualización.', registeredById: tech3.id },
    { id: uuidv4(), code: 'INS-2026-000004', workOrderId: workOrders[3].id, inspectionType: 'Verificación de corte de servicio', result: InspectionResult.NO_ISSUE_FOUND, observation: 'Suministro activo, posible confusión del cliente.', registeredById: tech4.id },
    { id: uuidv4(), code: 'INS-2026-000005', workOrderId: workOrders[5].id, inspectionType: 'Inspección de poste', result: InspectionResult.IRREGULAR_CONNECTION, observation: 'Cable flojo en conexión aérea.', registeredById: tech2.id },
    { id: uuidv4(), code: 'INS-2026-000006', workOrderId: workOrders[9].id, inspectionType: 'Inspección de acceso', result: InspectionResult.ADDITIONAL_VISIT_REQUIRED, observation: 'Zona inaccesible por condiciones climáticas.', registeredById: tech3.id },
  ];

  for (const insp of inspections) {
    await prisma.inspection.create({ data: insp });
  }
  console.log(`✅ ${inspections.length} inspecciones creadas.`);

  // ─── EVIDENCE ─────────────────────────────────────
  const evidence = [
    { id: uuidv4(), code: 'EVI-2026-000001', workOrderId: closedOrders[0].id, inspectionId: inspections[0].id, filePath: '/uploads/evidences/foto-medidor-001.jpg', mimeType: 'image/jpeg', originalName: 'foto-medidor-001.jpg', observation: 'Sellos de seguridad rotos.', registeredById: tech1.id },
    { id: uuidv4(), code: 'EVI-2026-000002', workOrderId: closedOrders[0].id, inspectionId: inspections[0].id, filePath: '/uploads/evidences/foto-medidor-002.jpg', mimeType: 'image/jpeg', originalName: 'foto-medidor-002.jpg', observation: 'Conexiones alteradas visibles.', registeredById: tech1.id },
    { id: uuidv4(), code: 'EVI-2026-000003', workOrderId: closedOrders[1].id, inspectionId: inspections[1].id, filePath: '/uploads/evidences/informe-fuga.pdf', mimeType: 'application/pdf', originalName: 'informe-fuga.pdf', observation: 'Informe técnico de fuga interna.', registeredById: tech2.id },
    { id: uuidv4(), code: 'EVI-2026-000004', workOrderId: closedOrders[2].id, inspectionId: inspections[2].id, filePath: '/uploads/evidences/medidor-danado.png', mimeType: 'image/png', originalName: 'medidor-danado.png', observation: 'Pantalla del medidor sin funcionar.', registeredById: tech3.id },
  ];

  for (const ev of evidence) {
    await prisma.evidence.create({ data: ev });
  }
  console.log(`✅ ${evidence.length} evidencias creadas.`);

  console.log('\n🎉 Seed completado exitosamente.');
  console.log('Usuarios de prueba:');
  console.log('  admin@sigom.pe / admin123 (ADMIN)');
  console.log('  supervisor@sigom.pe / super123 (SUPERVISOR)');
  console.log('  juan.perez@sigom.pe / tech123 (TECHNICIAN)');
  console.log('  visor@sigom.pe / viewer123 (VIEWER)');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
