# SIGOM-ENOSA — Agent Instructions

## Project status

Planning phase. `sigom-api/` and `sigom-web/` are empty. All conventions live in `docs/`.
No build config, no CI, no tests yet. Git not initialized.

## Tech stack (decided, not yet bootstrapped)

| Layer    | Choice                        |
| -------- | ----------------------------- |
| Backend  | NestJS + TypeScript           |
| ORM      | Prisma                        |
| Database | PostgreSQL                    |
| Auth     | JWT (Bearer token)            |
| Frontend | React + TypeScript            |
| API      | REST JSON, Swagger at `/api/docs` |
| Font     | Inter                         |

## Monorepo boundaries

```
sigom-api/   → backend (NestJS)
sigom-web/   → frontend (React)
docs/        → project documentation (Spanish)
```

SIGOM is independent from SISCON — integration only through REST API, never direct DB access.
See `docs/03-arquitectura/ADR-001-arquitectura-separada.md`.

## Language rules

- **Code**: English (variables, classes, methods, routes, tables, enums)
- **User-facing messages**: Spanish
- **Documentation**: Spanish allowed

## Naming conventions

| Thing                     | Convention        | Example                           |
| ------------------------- | ----------------- | --------------------------------- |
| Folders                   | `kebab-case`      | `work-orders/`                    |
| Files                     | `kebab-case`      | `create-work-order.dto.ts`        |
| Variables, methods        | `camelCase`       | `activeWorkOrders`, `assignTechnician()` |
| Classes, interfaces, DTOs, enums | `PascalCase` | `WorkOrderService`, `CreateWorkOrderDto` |
| Global constants          | `UPPER_SNAKE_CASE`| `MAX_FILE_SIZE`                   |
| Booleans                  | `is/has/can/should/requires` prefix | `isTechnicianActive`    |

## API design rules (hard constraints)

- Base: `/api/v1`
- Routes: English, plural nouns, `kebab-case`, no verbs (except business actions)
- Methods: `GET`, `POST`, `PATCH` — no `PUT` initially, no physical `DELETE` on work orders
- IDs: UUID internally, visible codes (`OT-2026-000145`) for UI
- Pagination: `page` (default 1), `limit` (default 20, max 100)
- Sorting: `sortBy` + `sortOrder` — whitelist fields only, never arbitrary columns
- Dates: ISO 8601, UTC for timestamps, `YYYY-MM-DD` for dates only
- Response envelope: `{ data, meta?, message? }`
- Error envelope: `{ statusCode, code, message, details[], timestamp, path, requestId }`
- Error codes: `UPPER_SNAKE_CASE` (`WORK_ORDER_CLOSED`, `VALIDATION_ERROR`)
- Audit fields (`createdById`, `assignedById`, `closedById`, etc.) must come from JWT, never from the request body
- Request tracing: `X-Request-Id` header (accept or generate)
- File uploads: `multipart/form-data`, allowed MIME: `image/jpeg`, `image/png`, `application/pdf`
- SISCON integration: `Idempotency-Key` header required

### Order state machine

```
PENDING → ASSIGNED    (/assign)
ASSIGNED → IN_FIELD   (/start)
IN_FIELD → SUSPENDED  (/suspend)
SUSPENDED → ASSIGNED  (/assign)
IN_FIELD → RESOLVED   (/resolve)
RESOLVED → CLOSED     (/close)
PENDING → CANCELLED   (/cancel)
ASSIGNED → CANCELLED  (/cancel)
```

Invalid transitions → `409 Conflict`.

### Roles

`ADMIN` | `SUPERVISOR` | `TECHNICIAN` | `VIEWER`
Authorization must be enforced server-side, never client-only.

## Entity ownership

| Owned by SISCON (read-only to SIGOM) | Owned by SIGOM               |
| ------------------------------------ | -----------------------------|
| User, Role, Zone, Supply, Meter, Incident | WorkOrder, OrderAssignment, Inspection, Evidence, Crew, MaintenancePlan |

## Design system

Primary: `#00236F` (matches SISCON). Full palette in `docs/06-ux/design-system.md`.
Component library: `AppSidebar`, `AppHeader`, `PageHeader`, `StatCard`, `DataTable`, `StatusBadge`, `PriorityBadge`, `SearchInput`, `FilterBar`, `ConfirmDialog`, `EmptyState`, `LoadingState`, `ErrorState`, `Pagination`.

## Key business rules

- Only active technicians receive orders (RN-001)
- Max active orders per technician (RN-002)
- CRITICAL priority overrides low/medium preventive (RN-003)
- CLOSED orders are immutable except admin reopening with audit (RN-004)
- Incident-originated orders keep source reference permanently (RN-005)
- Orders close only with: final diagnosis, solution, technician, date, ≥1 inspection (RN-006)
- Linked incidents resolve only when order reaches CLOSED (RN-007)

See `docs/01-requisitos/reglas-de-negocio.md`.

## Full convention sources

- `docs/001-estandares/convenciones-generales.md`
- `docs/001-estandares/convenciones-backend.md`
- `docs/001-estandares/convenciones-api.md`
- `docs/001-estandares/convenciones-frontend.md`
