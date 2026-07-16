# Auditoría inicial SIGOM-ENOSA (Fase 0)

Fecha: 2026-07-04
Rama: `feat/sigom-operational-stabilization`
Alcance: `sigom-api`, `sigom-web`, `docs/`. No se tocó ningún repositorio SISCON ni se ejecutó código contra bases SISCON.

## 1. Resumen ejecutivo

El dominio (Work Order → Assignment → Inspection → Evidence → Resolution → Closure) está bien
modelado en Prisma y la máquina de estados del backend es correcta y está testeada. El sistema
**no está listo para producción** por tres motivos concretos, no cosméticos:

1. **No hay autorización real.** `JwtAuthGuard` y `RolesGuard` existen pero no están aplicados a
   ningún controller. Toda la API es efectivamente pública.
2. **El frontend no envía lo que el backend espera.** El modal "Nueva orden" postea
   `{title, description, priority, status, zoneId}`; el backend espera
   `{type, initialObservation, priority, zoneId, createdById}`. Ninguna orden creada desde la UI
   actual llenaría `type` ni `initialObservation`.
3. **Un ID externo de SISCON se escribe como si fuera un actor interno.** El endpoint de
   integración usa el `incidentId` (UUID de SISCON) como `createdById` (FK a `User`), lo que viola
   la integridad referencial y el principio de auditoría por usuario autenticado.

A esto se suma documentación contradictoria (dos vocabularios de estados, dos definiciones
distintas del endpoint de integración) que hay que reconciliar antes de que sirva como fuente de
verdad.

Ninguno de estos hallazgos requirió modificar código todavía — esta fase es solo diagnóstico.

## 2. Metodología

Se delegó la exploración en tres agentes de solo lectura (sin permisos de escritura):
uno sobre `docs/`, uno sobre `sigom-api`, uno sobre `sigom-web`. Los hallazgos fueron
verificados por grep/lectura directa donde se cita ruta y nombre exacto.

## 3. Documentación (`docs/`)

| Archivo | Estado |
|---|---|
| `convenciones-api.md` | Fuente de verdad más completa y consistente; usa inglés y UPPER_SNAKE_CASE correctamente. |
| `reglas-de-negocio.md` | Usa estados en español (`CERRADA`, `CRÍTICA`) — inconsistente con `convenciones-api.md`. |
| `flujo-estados-orden.md` | Segundo vocabulario de estados en español (`PENDIENTE/ASIGNADA/EN_CAMPO/...`), mismas transiciones, distinto nombre. Bloque Mermaid sin cerrar. |
| `entidades-y-relaciones.md` | Nombres de entidades en español (`OrdenTrabajo`, `Cuadrilla`) — contradice la regla de nombrar en inglés. Mermaid sin cerrar. |
| `integracion-siscon.md` | Documenta `POST /api/v1/ordenes-trabajo` (español, sin `Idempotency-Key`) — **no coincide** con el endpoint real ni con el documentado en `convenciones-api.md` (`/integrations/siscon/incidents/:incidentId/work-orders`). Parece un borrador temprano nunca reconciliado. |
| `README.md` | Vacío, sin índice. |
| Varios (`convenciones-frontend.md`, ADR-001) | Encabezados internos apuntan a rutas de archivo que no coinciden con la ubicación real (residuo de generación, no afecta funcionalidad). |

**Recomendación:** `convenciones-api.md` y `design-system.md` (que sí usa el enum en inglés)
se toman como fuente de verdad canónica. `flujo-estados-orden.md`, `reglas-de-negocio.md` y
`entidades-y-relaciones.md` deben reescribirse para usar los mismos nombres en inglés, o al
menos anotar explícitamente el mapeo ES↔EN sin introducir un segundo vocabulario de estados.

## 4. Backend (`sigom-api`)

### 4.1 Esquema Prisma

- 9 modelos, todos con `id String @id @default(uuid()) @db.Uuid` — correcto.
- **No existe modelo `Technician`**: `TECHNICIAN` es un valor del enum `UserRole`; los "técnicos"
  son filas de `User`. Correcto según el punto 5.5 del brief (no duplicar entidad).
- `MaintenancePlan` existe pero **no tiene relación con `WorkOrder`** — módulo huérfano, no genera
  órdenes.
- **Problema de tipos en referencias externas**: `zoneId`, `supplyId`, `meterId`, `incidentId`
  están tipados `@db.Uuid` en vez de `String`. Si SISCON usa IDs numéricos (como indica el brief),
  cualquier valor no-UUID rompe el insert. `sourceSystem` e `incidentCode` sí están bien como
  `String`/`VarChar`, o sea el diseño está a mitad de camino.
- Enums confirmados: `UserRole{ADMIN,SUPERVISOR,TECHNICIAN,VIEWER}`,
  `WorkOrderStatus{PENDING,ASSIGNED,IN_FIELD,SUSPENDED,RESOLVED,CLOSED,CANCELLED}`,
  `WorkOrderPriority{LOW,MEDIUM,HIGH,CRITICAL}`,
  `WorkOrderType{METER_INSPECTION,METER_REPLACEMENT,CONSUMPTION_VERIFICATION,PREVENTIVE_MAINTENANCE,CORRECTIVE_MAINTENANCE,CONNECTION_VERIFICATION,CLAIM_ATTENTION,DISCONNECTION_RECONNECTION}`,
  `InspectionResult{METER_DAMAGED,METER_TAMPERED,READING_CORRECT,IRREGULAR_CONNECTION,INTERNAL_LEAK,CUSTOMER_ABSENT,NO_ISSUE_FOUND,ADDITIONAL_VISIT_REQUIRED}`.
  **No existe `EvidenceType`** — `Evidence` solo tiene `mimeType`, no un tipo de negocio
  (`BEFORE_ATTENTION`, `METER_PHOTO`, etc. del punto 7 del brief).
- Una sola migración (`20260702013804_init`) — sin drift, porque no hay historial todavía.

### 4.2 Autorización — hallazgo crítico

`grep -rn "UseGuards|@Roles(" src` → **cero resultados**. `JwtAuthGuard`, `RolesGuard` y el
decorador `@Roles()` existen en `src/auth/` pero no están aplicados a ningún controller. La
`JwtStrategy` deriva `req.user` correctamente desde `payload.sub`, pero como no hay guard, nunca
se ejecuta en una request real. **Toda la API es de acceso público hoy.**

### 4.3 IDs de auditoría enviados por el cliente

Confirmado en DTOs, contradice el punto 4 del brief ("frontend must never send audit fields"):

| DTO | Campo | Archivo |
|---|---|---|
| `CreateWorkOrderDto` | `createdById` (`@IsUUID()`, requerido) | `dto/create-work-order.dto.ts:33` |
| `AssignWorkOrderDto` | `assignedById` | `dto/assign-work-order.dto.ts:8` |
| `CloseWorkOrderDto` | `closedById` | `dto/close-work-order.dto.ts:5` |
| `CancelWorkOrderDto` | `cancelledById` | `dto/cancel-work-order.dto.ts:5` |
| `CreateEvidenceDto` | `registeredById` | evidence DTO / upload body |

El controller pasa estos valores directo al service (`work-orders.controller.ts:59,64`).

### 4.4 Máquina de estados

`state-machine.ts` + `work-orders.service.ts` validan transición antes de cada mutación —
correcto y testeado (`state-machine.spec.ts`, `work-orders.service.spec.ts`). `close()` valida
`finalDiagnosis`, `solutionApplied` e `inspectionCount > 0` (código `INSPECTION_REQUIRED`) —
cumple las reglas de negocio del punto 2 del brief. **`resolve()` no valida cantidad de
inspecciones**, solo que el DTO no esté vacío — a definir si es intencional o falta.

### 4.5 Carga de evidencia

Multipart real vía `multer` (`diskStorage`), MIME permitido `image/jpeg, image/png,
application/pdf` — correcto. El tamaño máximo está **hardcodeado en 10MB**; las variables de
entorno `MAX_FILE_SIZE`/`MAX_FILE_SIZE_MB` existen en `.env`/`.env.example` pero **nunca se leen**
en código. `filePath` se expone en las respuestas de `GET /evidences` — filtra la convención de
nombre de archivo en disco.

### 4.6 Configuración

- Prefijo global confirmado: `api/v1` (`main.ts`), Swagger en `api/docs` — correcto.
- **CORS hardcodeado**: `app.enableCors({ origin: 'http://localhost:5173' })` — no configurable
  por entorno, rompe en cualquier despliegue real.
- `.env.example` y `.env` reales están desalineados: `.env.example` define `UPLOAD_DIR`,
  `MAX_FILE_SIZE`; `.env` real usa `MAX_FILE_SIZE_MB` y agrega `JWT_EXPIRATION` no documentado.

### 4.7 Tests

Cobertura real solo en `work-orders` (máquina de estados + service). **Sin ningún test** para
`auth`, `evidences`, `inspections`, `crews`, `integrations`, `maintenance-plans`, `technicians`,
`reports`.

### 4.8 Integración SISCON — hallazgo crítico

`POST /integrations/siscon/incidents/:incidentId/work-orders` valida `incidentId` con
`ParseUUIDPipe` y luego, en `integrations.service.ts:71`, hace:

```ts
createdById: incidentId
```

Esto escribe el UUID del incidente de SISCON directamente en `WorkOrder.createdById`, un FK a
`User.id`. Rompe la constraint de FK en Postgres, o en el peor caso corrompe la auditoría si
algún usuario real comparte ese UUID por casualidad. Es exactamente el anti-patrón que el punto 8
del brief pide evitar. Además el endpoint no tiene guard (sin auth) y el header
`Idempotency-Key` se acepta pero no se usa — la deduplicación real es solo por
`incidentId`/`incidentCode` existente.

## 5. Frontend (`sigom-web`)

### 5.1 Cliente API y configuración

- `src/api/client.ts`: `baseURL: 'http://localhost:3000/api/v1'` **hardcodeado**. Cero usos de
  `import.meta.env` en todo `src/`.
- No existe `.env`/`.env.example` en `sigom-web`.
- `vite.config.ts` no fija puerto — Vite usa el 5173 por defecto (coincide por casualidad con el
  CORS hardcodeado del backend, no por configuración explícita).
- Parámetro de búsqueda: el frontend usa `search`, el backend documenta `q` — **mismatch**.

### 5.2 Contrato WorkOrder — bug funcional, no solo de nombres

`CreateWorkOrderModal.tsx` mantiene estado local `{title, description, priority, status,
zoneId}` y lo postea tal cual. El backend espera `type` e `initialObservation`. Resultado: **hoy
es imposible crear una orden completa y correcta desde la UI** — el campo `type` (obligatorio en
el enum `WorkOrderType`) nunca se envía.

`src/types/index.ts` sí usa los nombres correctos (`type`, `initialObservation`) a nivel de tipo,
pero le faltan campos que el backend ya devuelve: `supplyId, meterId, incidentId, incidentCode,
sourceSystem, closedById, cancelledById, startedAt, resolvedAt, closedAt, cancelledAt`.

### 5.3 Módulos sin creación

Confirmado contra el punto 3 del brief: `TechniciansPage`, `CrewsPage`, `MaintenancePlansPage`
son de solo lectura. No existe ni botón "+" ni modal. `useCreateTechnician`/`useUpdateTechnician`
existen como hooks pero no los llama ningún componente (código muerto).

`InspectionsPage` y `EvidencesPage` tampoco tienen ninguna forma de registrar/subir — son listas
puras. No existe ninguna llamada a `evidencesApi.upload` en toda la UI.

### 5.4 Autenticación — no existe

No hay login, `AuthContext`, almacenamiento de token, ni interceptor que agregue
`Authorization`. `AppHeader.tsx` muestra un usuario hardcodeado ("Supervisor" / "ENOSA" / "SU").
Esto es coherente con que el backend tampoco exige auth hoy (sección 4.2), pero significa que
**no hay ningún punto en el sistema que hoy derive un `req.user` real**.

### 5.5 Campos de ID en texto libre

- `CreateWorkOrderModal.tsx`: input `placeholder="ID de zona"` — texto libre en vez de selector.
- `WorkOrderDetailPage.tsx` (asignar/reasignar técnico): input `placeholder="ej. tech-001"` en
  vez de un dropdown, a pesar de que `useTechnicians` ya existe y podría alimentar un `<select>`.

### 5.6 Tests

No existe ningún test en `sigom-web` (sin vitest/jest, sin archivos `*.test.ts*`).

## 6. Tabla de discrepancias contrato Frontend↔Backend

| Campo/parámetro | Backend espera | Frontend envía/usa | Impacto |
|---|---|---|---|
| Búsqueda de listado | `q` | `search` | Filtro de búsqueda no funciona vía API real |
| Crear orden — tipo | `type` (enum, requerido) | no se envía | Orden creada queda inválida/incompleta |
| Crear orden — observación | `initialObservation` | `description` (campo inexistente en backend) | Se pierde el dato |
| Auditoría (`createdById`, etc.) | Debería derivarse del JWT | Backend lo exige en el body; frontend no lo envía (bien, pero por ausencia de campo, no por diseño) | Crear orden probablemente falla por DTO inválido (falta `createdById` requerido) |
| Asignar técnico | Debería ser un ID válido de un técnico activo | Input de texto libre | Alto riesgo de error humano / IDs inválidos |
| Referencias SISCON (`zoneId`, `supplyId`, `meterId`, `incidentId`) | `@db.Uuid` en Prisma | Se documenta como referencia externa string | Incompatible con IDs numéricos reales de SISCON |

## 7. Riesgos de breaking change identificados para fases siguientes

1. Cambiar `zoneId/supplyId/meterId/incidentId` de `Uuid` a `String` requiere migración Prisma y
   revisar cualquier índice/constraint existente sobre esas columnas.
2. Sacar `createdById`/`assignedById`/`closedById`/`cancelledById`/`registeredById` de los DTOs de
   entrada implica cambiar la firma de los métodos de servicio para recibir el `userId` autenticado
   como parámetro explícito, no como parte del DTO — toca controllers y services de work-orders,
   evidences.
3. Aplicar `JwtAuthGuard`/`RolesGuard` globalmente romperá cualquier request actual que no mande
   token — la migración de frontend (login real) debe ir en el mismo lote o el sistema queda
   inutilizable entre commits.
4. Arreglar el bug de `incidentId` como `createdById` requiere decidir el usuario de integración
   técnico (`integration@siscon-enosa.internal`) y crearlo como seed/migración de datos.

## 8. Archivos identificados para cambio (referencia para fases 1-5)

**Backend:**
`prisma/schema.prisma`, nueva migración; `src/auth/guards/*`, todos los controllers en
`src/work-orders`, `src/evidences`, `src/inspections`, `src/crews`, `src/technicians`,
`src/maintenance-plans`, `src/integrations`; DTOs de esos mismos módulos; `main.ts` (CORS,
lectura de env de upload); `.env.example`.

**Frontend:**
`src/api/client.ts` (env var), todos los `src/api/*.ts` (parámetro `q`), `src/types/index.ts`
(campos faltantes), `CreateWorkOrderModal.tsx` (contrato correcto), `WorkOrderDetailPage.tsx`
(selector de técnico), páginas de Technicians/Crews/MaintenancePlans (altas), nuevo módulo de
auth (login, contexto, interceptor axios), `.env.example` nuevo.

## 9. Próximo paso

Continuar con **Fase 1 — Estabilizar contratos internos**: alinear el contrato canónico de
WorkOrder entre backend y frontend, y corregir el manejo de identidad de auditoría vía JWT, antes
de tocar UI de creación de módulos nuevos (Fase 2) o aplicar guards de forma global (Fase 4, que
depende de que exista login real en el frontend).
