
Los diagramas Mermaid son buena opción porque viven como texto en Git y puedes modificarlos sin depender de una imagen.

---

### 4. `docs/02-dominio/entidades-y-relaciones.md`

Aquí defines quién es dueño de cada dato. Esto es especialmente importante porque SIGOM se conectará con SISCON.

```md
# Entidades y relaciones

## Entidades administradas por SISCON

- Usuario
- Rol
- Zona
- Suministro
- Medidor
- Incidencia

## Entidades administradas por SIGOM

- OrdenTrabajo
- AsignacionOrden
- Inspeccion
- Evidencia
- Cuadrilla
- PlanMantenimiento

## Relaciones principales

```mermaid
erDiagram
    INCIDENCIA ||--o| ORDEN_TRABAJO : genera
    ORDEN_TRABAJO ||--o{ ASIGNACION_ORDEN : tiene
    ORDEN_TRABAJO ||--o{ INSPECCION : registra
    ORDEN_TRABAJO ||--o{ EVIDENCIA : contiene
    USUARIO ||--o{ ASIGNACION_ORDEN : recibe
    MEDIDOR ||--o{ ORDEN_TRABAJO : requiere
    SUMINISTRO ||--o{ ORDEN_TRABAJO : atiende
    ZONA ||--o{ ORDEN_TRABAJO : pertenece