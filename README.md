# SIGOM-ENOSA

Sistema de Gestión de Órdenes de Inspección y Mantenimiento para operaciones de campo en ENOSA.

SIGOM conecta incidencias, técnicos, inspecciones, evidencias y mantenimiento preventivo en una interfaz operativa pensada para supervisores que necesitan saber qué ocurre, quién lo atiende y en qué estado se encuentra cada orden.

[![Backend](https://img.shields.io/badge/backend-NestJS-E0234E?style=flat-square)](./sigom-api)
[![Frontend](https://img.shields.io/badge/frontend-React-61DAFB?style=flat-square)](./sigom-web)
[![Database](https://img.shields.io/badge/database-PostgreSQL-4169E1?style=flat-square)](./sigom-api/prisma/schema.prisma)
[![API](https://img.shields.io/badge/API-REST%20%2B%20Swagger-85EA2D?style=flat-square)](http://localhost:3000/api/docs)

## Por qué existe

SISCON registra lecturas, consumos e incidencias. SIGOM cubre el siguiente paso: convertir esas incidencias o actividades preventivas en trabajo técnico trazable.

El foco no es verse como otro dashboard SaaS. El foco es operar infraestructura eléctrica con claridad: prioridades visibles, estados auditables y decisiones rápidas.

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | NestJS, TypeScript, Prisma |
| Base de datos | PostgreSQL |
| Autenticación | JWT Bearer |
| Frontend | React, TypeScript, Vite |
| UI | Tailwind CSS, Inter, componentes propios |
| API | REST JSON, Swagger en `/api/docs` |

## Estructura

```txt
sigom/
├─ sigom-api/   # API NestJS, Prisma, PostgreSQL
├─ sigom-web/   # App React para supervisores y técnicos
└─ docs/        # Requisitos, arquitectura, dominio y UX
```

## Módulos principales

| Módulo | Propósito |
|--------|-----------|
| Órdenes de trabajo | Crear, asignar, iniciar, suspender, resolver, cerrar o cancelar órdenes |
| Técnicos | Consultar disponibilidad y carga operativa |
| Inspecciones | Registrar resultados técnicos asociados a una orden |
| Evidencias | Adjuntar imágenes, PDFs y observaciones técnicas |
| Cuadrillas | Organizar equipos y líderes de campo |
| Planes de mantenimiento | Gestionar actividades preventivas recurrentes |
| Reportes | Visualizar indicadores operativos |
| Integraciones | Crear órdenes desde incidencias externas de SISCON |

## Arranque rápido

### 1. Backend

```bash
cd sigom-api
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

La API queda disponible en `http://localhost:3000/api/v1`.

La documentación Swagger queda disponible en `http://localhost:3000/api/docs`.

### 2. Frontend

```bash
cd sigom-web
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Variables de entorno

El backend usa PostgreSQL y JWT. Configura las variables desde los ejemplos incluidos antes de levantar la API.

```txt
DATABASE_URL="postgresql://user:password@localhost:5432/sigom"
JWT_SECRET="change-me"
PORT=3001
```

## Contrato de API

SIGOM expone una API REST versionada bajo `/api/v1`.

| Regla | Decisión |
|-------|----------|
| Formato | JSON con envelope `{ data, meta?, message? }` |
| Errores | `{ statusCode, code, message, details, timestamp, path, requestId }` |
| Paginación | `page`, `limit`, máximo 100 |
| Ordenamiento | `sortBy`, `sortOrder`, siempre con whitelist |
| Fechas | ISO 8601 en UTC; fechas simples como `YYYY-MM-DD` |
| Trazabilidad | `X-Request-Id` aceptado o generado |
| Documentación | Swagger en `/api/docs` |

## Flujo de órdenes

```txt
PENDING ── assign ──> ASSIGNED ── start ──> IN_FIELD ── resolve ──> RESOLVED ── close ──> CLOSED
   │                     │                      │
   └──── cancel ────────> CANCELLED             ├── suspend ──> SUSPENDED ── assign ──> ASSIGNED
                         │                      │
                         └──── cancel ─────────> CANCELLED
```

Las transiciones inválidas responden `409 Conflict`.

## Principios del sistema

- Separación real entre SISCON y SIGOM: integración por API, nunca por acceso directo a base de datos.
- Autorización server-side para roles `ADMIN`, `SUPERVISOR`, `TECHNICIAN` y `VIEWER`.
- Auditoría desde JWT: campos como `createdById`, `assignedById` o `closedById` no se aceptan desde el body.
- Cierre estricto: una orden solo se cierra con diagnóstico, solución, técnico, fecha y al menos una inspección.
- Interfaz institucional: densa, clara y orientada a operación, no decorativa.

## Scripts útiles

### API

```bash
npm run start:dev
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run prisma:studio
```

### Web

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [`docs/00-proyecto/vision-y-alcance.md`](./docs/00-proyecto/vision-y-alcance.md) | Visión, alcance y límites del producto |
| [`docs/01-requisitos/reglas-de-negocio.md`](./docs/01-requisitos/reglas-de-negocio.md) | Reglas funcionales obligatorias |
| [`docs/02-dominio/flujo-estados-orden.md`](./docs/02-dominio/flujo-estados-orden.md) | Estados y transiciones de órdenes |
| [`docs/03-arquitectura/ADR-001-arquitectura-separada.md`](./docs/03-arquitectura/ADR-001-arquitectura-separada.md) | Decisión de separar SIGOM de SISCON |
| [`docs/04-integraciones/integracion-siscon.md`](./docs/04-integraciones/integracion-siscon.md) | Contrato conceptual de integración |
| [`docs/06-ux/design-system.md`](./docs/06-ux/design-system.md) | Paleta, componentes y criterios visuales |

## Estado del proyecto

SIGOM cuenta con backend NestJS, modelo Prisma, API documentada, frontend React y componentes de interfaz operativa. El proyecto sigue evolucionando sobre las convenciones documentadas en `docs/001-estandares/`.

## Licencia

Proyecto académico privado.
