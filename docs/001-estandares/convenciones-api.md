# Convenciones de API — SIGOM-ENOSA

## 1. Propósito

Este documento define los estándares para diseñar, implementar, consumir y documentar la API REST de SIGOM-ENOSA.

SIGOM-ENOSA es el Sistema de Gestión de Órdenes de Inspección y Mantenimiento para el Control Operativo de la Red Eléctrica.

La API permitirá gestionar:

- Órdenes de trabajo.
- Asignaciones de técnicos.
- Inspecciones de campo.
- Evidencias técnicas.
- Planes de mantenimiento preventivo.
- Reportes operativos.
- Integración con SISCON-ENOSA.

---

## 2. Principios generales

La API debe cumplir los siguientes principios:

- Usar arquitectura REST.
- Usar JSON como formato principal de intercambio de datos.
- Usar inglés para nombres de rutas, recursos, propiedades JSON y enums.
- Usar español para mensajes visibles al usuario.
- Mantener respuestas consistentes.
- Aplicar validaciones en el backend.
- No exponer detalles internos de la base de datos.
- Mantener trazabilidad de las operaciones importantes.
- Documentar todos los endpoints implementados mediante Swagger.
- Mantener compatibilidad con SISCON-ENOSA y futuras integraciones con ERP.

---

## 3. URL base y versionado

La URL base de la API será:

```text
/api/v1
```

Ejemplo:

```http
GET /api/v1/work-orders
```

### Reglas de versionado

- Todas las rutas funcionales deben incluir versión.
- La primera versión oficial será `v1`.
- Cambios compatibles no requieren cambiar la versión.
- Cambios incompatibles requieren una nueva versión.

Ejemplo:

```text
/api/v2/work-orders
```

- No se debe eliminar ni modificar abruptamente un endpoint ya consumido por SIGOM Web, SISCON u otro sistema externo.
- Las rutas no deben terminar con `/`.

Correcto:

```text
/api/v1/work-orders
```

Incorrecto:

```text
/api/v1/work-orders/
```

---

## 4. Reglas de rutas

Las rutas deben cumplir las siguientes reglas:

- Usar inglés.
- Usar minúsculas.
- Usar plural para representar colecciones.
- Usar `kebab-case`.
- Representar recursos mediante sustantivos.
- No usar verbos dentro de rutas CRUD.
- Las acciones de negocio solo se permiten cuando no representan un CRUD simple.
- No usar nombres de tablas, columnas o detalles internos de base de datos.
- No anidar más de dos niveles de recursos, salvo casos técnicamente justificados.

### Ejemplos correctos

```http
GET    /api/v1/work-orders
GET    /api/v1/work-orders/:id
POST   /api/v1/work-orders
PATCH  /api/v1/work-orders/:id

GET    /api/v1/technicians
GET    /api/v1/crews

GET    /api/v1/inspections
GET    /api/v1/inspections/:id

GET    /api/v1/work-orders/:workOrderId/inspections
POST   /api/v1/work-orders/:workOrderId/inspections

GET    /api/v1/work-orders/:workOrderId/evidences
POST   /api/v1/work-orders/:workOrderId/evidences

GET    /api/v1/maintenance-plans
POST   /api/v1/maintenance-plans
```

### Ejemplos incorrectos

```http
GET  /api/v1/getWorkOrders
POST /api/v1/create-work-order
GET  /api/v1/order_work_table
GET  /api/v1/WorkOrders
GET  /api/v1/work_orders
POST /api/v1/work-orders/:id/create-inspection
```

---

## 5. Recursos principales

Los recursos principales de SIGOM-ENOSA serán:

| Recurso | Ruta base |
|---|---|
| Órdenes de trabajo | `/api/v1/work-orders` |
| Técnicos | `/api/v1/technicians` |
| Cuadrillas | `/api/v1/crews` |
| Inspecciones | `/api/v1/inspections` |
| Evidencias | `/api/v1/evidences` |
| Planes preventivos | `/api/v1/maintenance-plans` |
| Reportes operativos | `/api/v1/reports` |
| Integraciones | `/api/v1/integrations` |

La ruta global `/api/v1/evidences` podrá utilizarse para consultas administrativas o auditorías.

Para registrar y consultar evidencias de una orden específica se utilizará la ruta anidada:

```http
GET  /api/v1/work-orders/:workOrderId/evidences
POST /api/v1/work-orders/:workOrderId/evidences
```

---

## 6. Identificadores y códigos visibles

Todas las entidades internas utilizarán UUID como identificador principal.

Ejemplo:

```text
id: 550e8400-e29b-41d4-a716-446655440000
```

Los códigos funcionales visibles serán generados por el sistema y no podrán ser modificados por el cliente.

Ejemplos:

```text
OT-2026-000145
INS-2026-000089
EVI-2026-000325
MP-2026-000014
```

### Reglas

- Los UUID se usarán en rutas, relaciones y operaciones internas.
- Los códigos visibles se usarán en pantallas, reportes, búsquedas y documentación.
- Los clientes no deben generar códigos de órdenes, inspecciones ni evidencias.
- Los códigos visibles deben ser únicos.

Ejemplo correcto:

```http
GET /api/v1/work-orders/550e8400-e29b-41d4-a716-446655440000
```

Ejemplo de búsqueda por código:

```http
GET /api/v1/work-orders?q=OT-2026-000145
```

---

## 7. Métodos HTTP

| Método | Uso |
|---|---|
| `GET` | Consultar recursos |
| `POST` | Crear recursos |
| `PATCH` | Actualizar parcialmente recursos o ejecutar transiciones de estado |
| `DELETE` | Eliminar solo recursos no transaccionales autorizados |
| `PUT` | No se utilizará inicialmente |

### Ejemplos

```http
GET    /api/v1/work-orders
GET    /api/v1/work-orders/:id
POST   /api/v1/work-orders
PATCH  /api/v1/work-orders/:id
```

### Regla para órdenes de trabajo

Las órdenes de trabajo son registros transaccionales auditables.

Por ello:

```text
No se eliminarán físicamente.
```

Para anular una orden se utilizará:

```http
PATCH /api/v1/work-orders/:id/cancel
```

---

## 8. Acciones de negocio permitidas

Las acciones de negocio se permiten únicamente cuando representan una transición específica del proceso y no un CRUD tradicional.

```http
PATCH /api/v1/work-orders/:id/assign
PATCH /api/v1/work-orders/:id/start
PATCH /api/v1/work-orders/:id/suspend
PATCH /api/v1/work-orders/:id/resolve
PATCH /api/v1/work-orders/:id/close
PATCH /api/v1/work-orders/:id/cancel
```

### Significado de cada acción

| Endpoint | Descripción |
|---|---|
| `/assign` | Asigna un técnico o cuadrilla a una orden |
| `/start` | Inicia la atención de campo |
| `/suspend` | Suspende temporalmente una orden |
| `/resolve` | Marca la orden como resuelta luego de registrar diagnóstico y solución |
| `/close` | Cierra oficialmente la orden |
| `/cancel` | Anula una orden antes de su cierre |

### Restricciones

Cada acción debe validar el estado actual de la orden.

Ejemplo de transiciones permitidas:

```text
PENDING   → ASSIGNED
ASSIGNED  → IN_FIELD
IN_FIELD  → SUSPENDED
SUSPENDED → ASSIGNED
IN_FIELD  → RESOLVED
RESOLVED  → CLOSED
PENDING   → CANCELLED
ASSIGNED  → CANCELLED
```

Si un usuario intenta ejecutar una transición inválida, la API debe responder con:

```http
409 Conflict
```

Ejemplo:

```text
No se puede cerrar una orden que todavía se encuentra en estado ASSIGNED.
```

---

## 9. Convención de enums

Los enums enviados y recibidos por la API deben:

- Estar escritos en inglés.
- Usar mayúsculas.
- Usar formato `UPPER_SNAKE_CASE`.

### Estados de orden

```text
PENDING
ASSIGNED
IN_FIELD
SUSPENDED
RESOLVED
CLOSED
CANCELLED
```

### Prioridades

```text
LOW
MEDIUM
HIGH
CRITICAL
```

### Tipos de orden

```text
METER_INSPECTION
METER_REPLACEMENT
CONSUMPTION_VERIFICATION
PREVENTIVE_MAINTENANCE
CORRECTIVE_MAINTENANCE
CONNECTION_VERIFICATION
CLAIM_ATTENTION
DISCONNECTION_RECONNECTION
```

### Resultados de inspección

```text
METER_DAMAGED
METER_TAMPERED
READING_CORRECT
IRREGULAR_CONNECTION
INTERNAL_LEAK
CUSTOMER_ABSENT
NO_ISSUE_FOUND
ADDITIONAL_VISIT_REQUIRED
```

La interfaz web será responsable de traducir estos valores al español.

Ejemplo:

```text
IN_FIELD               → En campo
METER_DAMAGED          → Medidor averiado
CRITICAL               → Crítica
PREVENTIVE_MAINTENANCE → Mantenimiento preventivo
```

---

## 10. Parámetros de consulta

Los parámetros de consulta deben utilizar nombres descriptivos en `camelCase`.

Ejemplo:

```http
GET /api/v1/work-orders?status=ASSIGNED&priority=HIGH&zoneId=uuid&page=1&limit=20
```

### Paginación

| Parámetro | Descripción | Valor por defecto |
|---|---|---|
| `page` | Número de página | `1` |
| `limit` | Registros por página | `20` |

El valor máximo permitido para `limit` será:

```text
100
```

Ejemplo:

```http
GET /api/v1/work-orders?page=2&limit=20
```

### Ordenamiento

```http
GET /api/v1/work-orders?sortBy=createdAt&sortOrder=desc
```

Reglas:

```text
sortBy    = Campo permitido para ordenar.
sortOrder = asc | desc.
```

Campos permitidos inicialmente para órdenes de trabajo:

```text
createdAt
scheduledAt
closedAt
priority
status
code
```

No se debe permitir que el cliente ordene por cualquier campo arbitrario.

### Filtros

Ejemplos:

```http
GET /api/v1/work-orders?zoneId=uuid
GET /api/v1/work-orders?technicianId=uuid
GET /api/v1/work-orders?crewId=uuid
GET /api/v1/work-orders?priority=CRITICAL
GET /api/v1/work-orders?status=PENDING,ASSIGNED,IN_FIELD
GET /api/v1/work-orders?type=METER_INSPECTION
GET /api/v1/work-orders?scheduledFrom=2026-07-01T00:00:00Z
GET /api/v1/work-orders?scheduledTo=2026-07-31T23:59:59Z
GET /api/v1/work-orders?q=OT-2026-000145
```

Para enviar múltiples valores se utilizará una lista separada por comas:

```text
status=PENDING,ASSIGNED,IN_FIELD
```

### Búsqueda general

La búsqueda general utilizará el parámetro:

```text
q
```

Ejemplo:

```http
GET /api/v1/work-orders?q=Talara
```

La búsqueda podrá considerar, según corresponda:

- Código de orden.
- Código de incidencia.
- Código de suministro.
- Código de medidor.
- Dirección referencial.
- Nombre de técnico.
- Nombre de zona.

---

## 11. Fechas y zonas horarias

Las fechas y horas deben usar el estándar ISO 8601.

### Fechas con hora

Las fechas con hora deben enviarse y devolverse en UTC.

Ejemplo correcto:

```json
{
  "scheduledAt": "2026-07-03T15:30:00Z"
}
```

### Fechas sin hora

Las fechas sin hora deben usar el formato:

```text
YYYY-MM-DD
```

Ejemplo:

```json
{
  "visitDate": "2026-07-03"
}
```

### Formatos no permitidos

```json
{
  "scheduledAt": "03/07/2026 10:30 AM"
}
```

```json
{
  "scheduledAt": "03-07-2026"
}
```

---

## 12. Convenciones para request body

Los cuerpos de solicitudes JSON deben usar `camelCase`.

### Reglas

- Los campos opcionales pueden omitirse.
- No se deben enviar valores `null` sin necesidad.
- Los identificadores de auditoría no deben enviarse desde el frontend.
- Los identificadores del usuario autenticado se obtienen desde el JWT.
- El backend debe validar todos los campos recibidos.

Los siguientes campos no deben ser enviados por el cliente:

```text
createdById
updatedById
assignedById
closedById
registeredById
cancelledById
```

### Ejemplo correcto

```json
{
  "type": "METER_INSPECTION",
  "priority": "HIGH",
  "zoneId": "550e8400-e29b-41d4-a716-446655440000",
  "supplyId": "0e8400-e29b-41d4-a716-446655440000",
  "meterId": "8a8400-e29b-41d4-a716-446655440000",
  "scheduledAt": "2026-07-03T15:30:00Z",
  "initialObservation": "Consumo irregular detectado."
}
```

### Ejemplo incorrecto

```json
{
  "TipoOrden": "METER_INSPECTION",
  "prioridad": "HIGH",
  "createdById": "uuid-del-usuario"
}
```

---

## 13. Respuestas exitosas

Las respuestas exitosas deben utilizar una estructura uniforme.

### Recurso único

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "OT-2026-000145",
    "status": "ASSIGNED"
  },
  "message": "Orden de trabajo creada correctamente."
}
```

### Lista paginada

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "OT-2026-000145",
      "status": "ASSIGNED"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 148,
    "totalPages": 8
  }
}
```

### Reglas

- La propiedad `data` es obligatoria en respuestas exitosas.
- La propiedad `meta` se utiliza únicamente en resultados paginados.
- La propiedad `message` es opcional en consultas `GET`.
- La propiedad `message` debe utilizarse en operaciones que crean, actualizan, cierran, suspenden o anulan registros.

---

## 14. Respuestas de error

Las respuestas de error deben tener una estructura uniforme.

```json
{
  "statusCode": 409,
  "code": "WORK_ORDER_CLOSED",
  "message": "No se puede editar una orden de trabajo cerrada.",
  "details": [],
  "timestamp": "2026-07-01T19:40:00.000Z",
  "path": "/api/v1/work-orders/550e8400-e29b-41d4-a716-446655440000",
  "requestId": "req_01JABC123"
}
```

### Error de validación

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "La solicitud contiene datos inválidos.",
  "details": [
    {
      "field": "scheduledAt",
      "messages": [
        "scheduledAt debe tener formato ISO 8601."
      ]
    }
  ],
  "timestamp": "2026-07-01T19:40:00.000Z",
  "path": "/api/v1/work-orders",
  "requestId": "req_01JABC123"
}
```

### Convención de códigos de error

Los códigos de error deben usar:

```text
UPPER_SNAKE_CASE
```

Ejemplos:

```text
VALIDATION_ERROR
WORK_ORDER_NOT_FOUND
WORK_ORDER_CLOSED
INVALID_WORK_ORDER_TRANSITION
TECHNICIAN_NOT_ACTIVE
TECHNICIAN_WORKLOAD_EXCEEDED
INSPECTION_REQUIRED
EVIDENCE_FILE_TOO_LARGE
UNSUPPORTED_FILE_TYPE
UNAUTHORIZED_ACCESS
FORBIDDEN_ACTION
```

---

## 15. Códigos HTTP

| Código | Uso |
|---|---|
| `200 OK` | Consulta o actualización exitosa |
| `201 Created` | Recurso creado correctamente |
| `204 No Content` | Eliminación permitida sin contenido de respuesta |
| `400 Bad Request` | Datos inválidos o error de validación |
| `401 Unauthorized` | Token ausente, inválido o expirado |
| `403 Forbidden` | Usuario autenticado sin permisos |
| `404 Not Found` | Recurso no encontrado |
| `409 Conflict` | Conflicto de negocio o transición de estado inválida |
| `413 Payload Too Large` | Archivo excede el tamaño máximo permitido |
| `415 Unsupported Media Type` | Tipo de archivo no permitido |
| `422 Unprocessable Entity` | Datos válidos en formato, pero no procesables por una regla de negocio |
| `500 Internal Server Error` | Error interno no controlado |

La API no debe devolver:

- Errores SQL.
- Trazas internas.
- Rutas físicas del servidor.
- Contraseñas.
- Tokens completos.
- Credenciales de servicios externos.

---

## 16. Autenticación y autorización

Las rutas protegidas requieren autenticación mediante JWT.

```http
Authorization: Bearer <token>
```

El usuario autenticado se obtiene desde el token JWT.

La API no debe confiar en datos enviados por el cliente para definir:

```text
createdById
updatedById
assignedById
closedById
registeredById
cancelledById
```

### Roles iniciales

| Rol | Permisos principales |
|---|---|
| `ADMIN` | Administración general, catálogos, usuarios y configuraciones |
| `SUPERVISOR` | Crear órdenes, asignar técnicos, suspender, cerrar y anular órdenes |
| `TECHNICIAN` | Consultar órdenes asignadas, iniciar atención, registrar inspecciones y subir evidencias |
| `VIEWER` | Consultar información y reportes sin modificar registros |

La autorización debe validarse en el backend, no únicamente en el frontend.

---

## 17. Archivos y evidencias

Las evidencias técnicas se enviarán mediante:

```text
multipart/form-data
```

Ejemplo:

```http
POST /api/v1/work-orders/:workOrderId/evidences
Content-Type: multipart/form-data
```

### Campos mínimos

```text
file
type
observation
```

### Tipos de archivo permitidos inicialmente

```text
image/jpeg
image/png
application/pdf
```

### Reglas

- No enviar archivos en Base64 dentro de JSON.
- El tamaño máximo permitido debe configurarse mediante variable de entorno.
- La API no debe exponer rutas físicas del servidor.
- Toda evidencia debe almacenar fecha de registro, técnico responsable y orden relacionada.
- Las evidencias asociadas a una orden cerrada no deben eliminarse libremente.
- Toda eliminación permitida debe ser lógica y auditada.
- Los archivos deben validarse por tipo MIME y extensión.

---

## 18. Integración con SISCON-ENOSA

SIGOM no es propietario de los siguientes datos:

- Incidencias.
- Zonas.
- Suministros.
- Medidores.
- Lecturas.
- Usuarios base de SISCON.

SIGOM solo almacenará las referencias necesarias para mantener trazabilidad.

### Creación de orden desde SISCON

La ruta de integración oficial será:

```http
POST /api/v1/integrations/siscon/incidents/:incidentId/work-orders
```

Ejemplo:

```http
POST /api/v1/integrations/siscon/incidents/550e8400-e29b-41d4-a716-446655440000/work-orders
```

Ejemplo de body:

```json
{
  "incidentCode": "INC-2026-00456",
  "type": "CONSUMPTION_VERIFICATION",
  "priority": "HIGH",
  "zoneId": "uuid-zona",
  "supplyId": "uuid-suministro",
  "meterId": "uuid-medidor",
  "initialObservation": "Consumo anómalo detectado por SISCON."
}
```

### Respuesta esperada

```json
{
  "data": {
    "id": "uuid-orden",
    "code": "OT-2026-000145",
    "status": "PENDING",
    "sourceSystem": "SISCON",
    "incidentId": "uuid-incidencia",
    "incidentCode": "INC-2026-00456"
  },
  "message": "Orden de trabajo creada desde SISCON correctamente."
}
```

### Idempotencia

Para evitar la creación duplicada de órdenes cuando SISCON reintente una solicitud, toda integración deberá enviar:

```http
Idempotency-Key: 4a5db6db-9eaf-4ef2-bfd8-001234567890
```

### Reglas de integración

- SIGOM no debe acceder directamente a la base de datos de SISCON.
- La comunicación debe realizarse mediante API REST o eventos.
- Toda orden generada desde SISCON debe guardar el sistema de origen.
- Toda orden generada desde SISCON debe mantener la referencia de la incidencia original.
- Cuando SIGOM cierre una orden vinculada a una incidencia, deberá notificar a SISCON mediante API o evento.
- SISCON será responsable de cambiar el estado de la incidencia según sus propias reglas de negocio.

---

## 19. Reportes y dashboard operativo

Los endpoints de reportes deben iniciar con:

```text
/api/v1/reports
```

Ejemplos:

```http
GET /api/v1/reports/summary
GET /api/v1/reports/work-orders-by-zone
GET /api/v1/reports/average-attention-time
GET /api/v1/reports/technician-workload
GET /api/v1/reports/common-failures
GET /api/v1/reports/replaced-meters
```

Los endpoints de reportes deben permitir filtros de fecha cuando corresponda.

Ejemplo:

```http
GET /api/v1/reports/work-orders-by-zone?from=2026-07-01&to=2026-07-31
```

---

## 20. Swagger y documentación técnica

Swagger será la fuente de referencia técnica de los endpoints implementados.

La documentación Swagger estará disponible inicialmente en:

```text
/api/docs
```

Cada endpoint debe incluir:

- Tag del módulo.
- Descripción funcional.
- Autenticación requerida.
- DTO de entrada.
- Ejemplos de request.
- Ejemplos de respuesta.
- Códigos HTTP posibles.
- Errores de negocio relevantes.
- Roles autorizados.

### Tags sugeridos

```text
Auth
Work Orders
Technicians
Crews
Inspections
Evidences
Maintenance Plans
Reports
Integrations
```

Toda modificación de endpoint debe actualizar Swagger en el mismo Pull Request.

---

## 21. Trazabilidad técnica y logs

Cada solicitud debe contar con un identificador de seguimiento.

La API debe aceptar o generar el siguiente header:

```http
X-Request-Id: req_01JABC123
```

El `requestId` debe aparecer en:

- Logs del backend.
- Respuestas de error.
- Registros de integración.
- Auditorías relevantes.

No se deben registrar en logs:

- Contraseñas.
- Tokens JWT completos.
- Archivos adjuntos completos.
- Datos privados innecesarios.
- Credenciales de servicios externos.
- Datos de conexión de la base de datos.

---

## 22. Checklist para crear un nuevo endpoint

Antes de implementar un nuevo endpoint, se debe verificar:

- [ ] La ruta está en inglés.
- [ ] La ruta usa plural y `kebab-case`.
- [ ] El recurso está representado por un sustantivo.
- [ ] El verbo HTTP es correcto.
- [ ] El endpoint respeta la versión `/api/v1`.
- [ ] El DTO valida los datos de entrada.
- [ ] El endpoint valida autenticación y autorización.
- [ ] La respuesta usa la estructura estándar.
- [ ] Los errores usan códigos HTTP y códigos de negocio consistentes.
- [ ] El endpoint está documentado en Swagger.
- [ ] Se agregaron pruebas unitarias o de integración.
- [ ] Se revisó si afecta la integración con SISCON.
- [ ] Se actualizó la documentación si corresponde.

---

## 23. Ejemplo de endpoints principales

```http
# Órdenes de trabajo
GET    /api/v1/work-orders
GET    /api/v1/work-orders/:id
POST   /api/v1/work-orders
PATCH  /api/v1/work-orders/:id

# Acciones de orden
PATCH  /api/v1/work-orders/:id/assign
PATCH  /api/v1/work-orders/:id/start
PATCH  /api/v1/work-orders/:id/suspend
PATCH  /api/v1/work-orders/:id/resolve
PATCH  /api/v1/work-orders/:id/close
PATCH  /api/v1/work-orders/:id/cancel

# Inspecciones
GET    /api/v1/inspections
GET    /api/v1/inspections/:id
GET    /api/v1/work-orders/:workOrderId/inspections
POST   /api/v1/work-orders/:workOrderId/inspections

# Evidencias
GET    /api/v1/evidences
GET    /api/v1/work-orders/:workOrderId/evidences
POST   /api/v1/work-orders/:workOrderId/evidences

# Técnicos y cuadrillas
GET    /api/v1/technicians
GET    /api/v1/technicians/:id
GET    /api/v1/crews
GET    /api/v1/crews/:id

# Mantenimiento preventivo
GET    /api/v1/maintenance-plans
GET    /api/v1/maintenance-plans/:id
POST   /api/v1/maintenance-plans
PATCH  /api/v1/maintenance-plans/:id

# Reportes
GET    /api/v1/reports/summary
GET    /api/v1/reports/work-orders-by-zone
GET    /api/v1/reports/average-attention-time
GET    /api/v1/reports/technician-workload
GET    /api/v1/reports/common-failures
GET    /api/v1/reports/replaced-meters

# Integración con SISCON
POST   /api/v1/integrations/siscon/incidents/:incidentId/work-orders
```