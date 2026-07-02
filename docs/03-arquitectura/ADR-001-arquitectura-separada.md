
Este documento hará que tu segundo TPS se vea como un sistema real y no solo como una app independiente sin conexión.

---

### 6. `docs/03-arquitectura/decisiones/ADR-001-arquitectura-separada.md`

Un ADR es un **registro corto de una decisión importante**.

```md
# ADR-001 — Separación de SISCON y SIGOM

## Estado
Aceptada.

## Contexto
SISCON-ENOSA y SIGOM-ENOSA pertenecen al mismo dominio eléctrico,
pero gestionan procesos distintos.

SISCON se enfoca en consumo, lecturas e incidencias.
SIGOM se enfoca en órdenes, inspecciones y mantenimiento.

## Decisión
SIGOM se desarrollará como una aplicación independiente, con:

- sigom-api: backend NestJS.
- sigom-web: frontend React.
- Base de datos propia o esquema separado.
- API REST documentada con Swagger.
- Integración controlada con SISCON mediante API.

## Consecuencias
Ventajas:
- Separación clara de responsabilidades.
- SIGOM puede evolucionar sin afectar directamente a SISCON.
- El TPS se presenta como un sistema independiente.
- Facilita una futura integración con ERP.

Desventajas:
- Se deben definir contratos de integración.
- Puede existir sincronización de datos entre sistemas.