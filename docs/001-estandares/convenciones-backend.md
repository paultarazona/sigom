# Convenciones Backend — SIGOM API

## Tecnología

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- JWT
- REST API

## Variables y métodos

- Variables y métodos: `camelCase`.
- Clases, interfaces, DTOs y enums: `PascalCase`.
- Constantes globales: `UPPER_SNAKE_CASE`.
- Booleanos deben empezar con `is`, `has`, `can`, `should` o `requires`.

## Ejemplos

```ts
const activeWorkOrders = [];
const technicianId = '...';
const isTechnicianActive = true;
const requiresMeterReplacement = false;

function assignTechnician() {}
function closeWorkOrder() {}

class CreateWorkOrderDto {}
class WorkOrderService {}
enum WorkOrderStatus {}