# Integración entre SISCON y SIGOM

## Objetivo
Permitir que una incidencia registrada en SISCON genere una orden
de trabajo en SIGOM y que SIGOM devuelva el estado de atención.

## Flujo principal

```mermaid
sequenceDiagram
    participant Usuario
    participant SISCON
    participant SIGOM

    Usuario->>SISCON: Detecta o registra incidencia
    Usuario->>SISCON: Solicita generar orden
    SISCON->>SIGOM: POST /api/v1/ordenes-trabajo
    SIGOM-->>SISCON: Código de orden creada
    SIGOM->>SIGOM: Asigna técnico e inspecciona
    SIGOM-->>SISCON: Estado final de orden
    SISCON->>SISCON: Actualiza incidencia a RESUELTA