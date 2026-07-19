# Convenciones de Testing — SIGOM API

## Stack

| Componente | Tecnología | Rol |
|---|---|---|
| Runner | Jest ^30 | Ejecución, assertions, mocks, coverage |
| Unitarias | `@nestjs/testing` ^11 | TestBed para providers NestJS |
| E2E | Supertest ^7 | HTTP integration contra controladores |
| DB testing | PostgreSQL (docker compose) | Aislamiento total de desarrollo/producción |

## Tipos de tests

| Tipo | Script | Regex | Scope |
|---|---|---|---|
| Unitario | `test:unit` | `.*\.spec\.ts$` dentro de `src/` | Lógica pura, servicios, guards, pipes, filtros |
| Integración | `test:integration` | `.*\.int-spec\.ts$` dentro de `test/` | Servicios contra DB real aislada |
| E2E | `test:e2e` | `.*\.e2e-spec\.ts$` dentro de `test/` | HTTP completo: controladores, guards, pipes, interceptores, filtros |

**Regla de nomenclatura**:
- `*.spec.ts` → unitario (junto al fuente, en `src/`)
- `*.int-spec.ts` → integración (en `test/`)
- `*.e2e-spec.ts` → end-to-end (en `test/`)

## Estructura de archivos de prueba

```
src/
├── work-orders/
│   ├── work-orders.service.spec.ts     ← unitario (junto al fuente)
│   └── state-machine.spec.ts           ← unitario (función pura)
test/
├── app.e2e-spec.ts                     ← E2E
├── work-orders.e2e-spec.ts             ← E2E
└── inspections.int-spec.ts             ← integración (futuro)
```

## Patrón AAA (Arrange-Act-Assert)

Cada test debe seguir estrictamente Arrange → Act → Assert, con separación visual clara:

```ts
it('debe retornar la orden cuando existe', async () => {
  // Arrange
  mockPrisma.workOrder.findUnique.mockResolvedValue(makeWorkOrder());

  // Act
  const result = await service.findOne(WORK_ORDER_ID);

  // Assert
  expect(result.data).toMatchObject({ id: WORK_ORDER_ID });
});
```

## Nombres de tests

- Formato: `debe [resultado] cuando [condición]`
- Un solo comportamiento por test
- Describir el escenario, no la implementación

```ts
// BIEN
it('debe lanzar NotFoundException cuando la orden no existe', async () => { ... });
it('debe lanzar ConflictException cuando la transición a ASSIGNED es inválida', async () => { ... });

// MAL
it('test assign', async () => { ... });
it('should work', async () => { ... });
```

## Casos mínimos por servicio

Cada método público debe cubrir al menos:

1. Camino exitoso (happy path)
2. Entrada inválida (validación de DTO / parámetros)
3. Recurso inexistente (NotFound)
4. Conflicto de estado (Conflict)
5. Error de dependencia externa (DB caída, Prisma error)
6. Autorización/Permisos (cuando aplique)
7. Casos límite (valores nulos, vacíos, máximos, mínimos)

## Casos mínimos por endpoint E2E

- 200/201 respuesta exitosa con contrato correcto
- 400 validación (campos requeridos, formatos, tipos)
- 401 sin token o token inválido
- 403 rol insuficiente
- 404 recurso no encontrado
- 409 conflicto de estado (transiciones inválidas)

## Mocking

### Unitarias

- **Solo mockear límites externos**: `PrismaService`, `JwtService`, `ConfigService`, servicios externos
- **NUNCA mockear la clase bajo test** — la implementación real siempre se prueba
- Usar `jest.fn()` con factories manuales, no auto-mocks
- Limpiar mocks con `jest.clearAllMocks()` en `afterEach`
- Para Prisma, mockear el objeto completo con todas las tablas usadas:

```ts
const mockPrisma = {
  workOrder: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
  user: { findUnique: jest.fn() },
  $transaction: jest.fn(),
};
```

### Integración

- No mockear Prisma — usar transacciones reales contra DB de testing
- Cada test hace rollback al finalizar (o `DELETE` en `beforeEach`)

### E2E

- Mockear Prisma para tests HTTP rápidos (validación de contratos, guards, pipes)
- Para E2E completos con DB real, usar `test:e2e:full` con DB aislada

## Factories y builders

Usar funciones factory reutilizables para datos de prueba:

```ts
function makeWorkOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'wo-uuid-1',
    code: 'OT-2025-000001',
    status: 'PENDING',
    type: 'CORRECTIVE_MAINTENANCE',
    priority: 'MEDIUM',
    zoneId: 'zone-uuid-1',
    createdById: 'user-uuid-1',
    ...overrides,
  };
}
```

## Fixtures compartidas

Constantes al inicio del spec file para IDs y valores fijos:

```ts
const WORK_ORDER_ID = '550e8400-e29b-41d4-a716-446655440001';
const USER_ID = '550e8400-e29b-41d4-a716-446655440002';
```

## Assertions

| Caso | Assertion recomendada |
|---|---|
| Excepción simple | `await expect(...).rejects.toThrow(NotFoundException)` |
| Excepción con código | `await expect(...).rejects.toMatchObject({ response: { code: 'WORK_ORDER_CLOSED' } })` |
| Objeto parcial | `expect(result).toMatchObject({ status: 'ASSIGNED' })` |
| Llamada a mock con parámetros | `expect(mock.method).toHaveBeenCalledWith(expect.objectContaining({ ... }))` |
| Llamada a mock N veces | `expect(mock.method).toHaveBeenCalledTimes(1)` |
| Array vacío | `expect(result.data).toEqual([])` |

## Tests parametrizados

Usar `it.each` para tablas de datos:

```ts
describe('valid transitions', () => {
  it.each([
    ['PENDING', 'ASSIGNED'],
    ['PENDING', 'CANCELLED'],
    ['ASSIGNED', 'IN_FIELD'],
  ])('debe retornar true para %s → %s', (current, target) => {
    expect(isValidTransition(current, target)).toBe(true);
  });
});
```

## Prohibiciones

- **No usar `any`** — tipar correctamente mocks, fixtures y parámetros
- **No usar `skip` o `only`** en tests commiteados
- **No crear tests vacíos** o assertions triviales como `expect(true).toBe(true)`
- **No modificar lógica de producción solo para alcanzar cobertura**
- **No mockear en exceso** — si un test requiere 10+ mocks, reconsiderar el diseño
- **No depender del orden de ejecución** entre tests
- **No usar `setTimeout` o delays** — usar async/await y promises

## Base de datos de testing

### Aislamiento

- Puerto separado: `5433` (desarrollo usa `5432`)
- Base de datos separada: `sigom_test`
- Usuario separado: `sigom_test`
- Migraciones automáticas antes de cada suite

### Configuración

```env
# .env.test (NO contiene secretos reales)
DATABASE_URL=postgresql://sigom_test:sigom_test@localhost:5433/sigom_test
JWT_SECRET=test-jwt-secret
SISCON_HMAC_SECRET=test-hmac-secret
```

### Docker compose

```yaml
# docker-compose.test.yml
services:
  db-test:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: sigom_test
      POSTGRES_PASSWORD: sigom_test
      POSTGRES_DB: sigom_test
    ports:
      - '5433:5432'
```

## Umbral de cobertura

| Fase | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Inicial (Fase 0) | — | — | — | — |
| Post-Fase 1-2 | 35% | 25% | 35% | 35% |
| Post-Fase 1-4 | 60% | 45% | 60% | 60% |
| Objetivo final | 80% | 70% | 85% | 80% |

El umbral se actualiza en `package.json` → `jest.coverageThreshold` al final de cada fase.

## Scripts

```bash
npm run test               # Todos los tests (unit + integration)
npm run test:unit           # Solo unitarios (src/**/*.spec.ts)
npm run test:watch          # Watch mode
npm run test:cov            # Unitarios + coverage
npm run test:integration    # Solo integración (test/**/*.int-spec.ts)
npm run test:e2e            # Solo E2E (test/**/*.e2e-spec.ts)
```

## CI/CD

Cuando se configure GitHub Actions (o similar):

```yaml
- name: Run unit tests
  run: npm run test:unit -- --ci --coverage
- name: Run integration tests
  run: npm run test:integration -- --ci
- name: Run E2E tests
  run: npm run test:e2e -- --ci
```

La DB de testing debe levantarse como service container en CI.

## Reporte de bugs encontrados

Si un test descubre un bug de producción:
1. Documentarlo en el spec con un comment tipo `// BUG: ...`
2. Reportarlo en el canal de equipo antes de continuar
3. No debilitar el test para hacerlo pasar — el test debe reflejar el comportamiento esperado, no el actual con bugs
4. Una vez corregido el bug, remover el comment
