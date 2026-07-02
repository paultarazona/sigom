# Reglas de negocio

## RN-001 — Asignación de técnico
Solo un técnico activo puede recibir una orden de trabajo.

## RN-002 — Carga de trabajo
Un técnico no puede superar el número máximo de órdenes activas
definido por el supervisor.

## RN-003 — Orden crítica
Las órdenes con prioridad CRÍTICA deben ser atendidas antes que
las órdenes preventivas de prioridad baja o media.

## RN-004 — Orden cerrada
Una orden en estado CERRADA no puede modificarse, salvo por un
usuario con rol administrador mediante un proceso de reapertura auditado.

## RN-005 — Trazabilidad de incidencia
Cuando una orden sea generada desde una incidencia, debe mantener
la referencia a la incidencia de origen durante todo su ciclo de vida.

## RN-006 — Cierre de orden
Una orden solo puede cerrarse si contiene:
- diagnóstico final;
- solución aplicada;
- técnico responsable;
- fecha de cierre;
- al menos una inspección registrada.

## RN-007 — Resolución de incidencia
Una incidencia vinculada a una orden solo podrá marcarse como RESUELTA
cuando la orden se encuentre en estado CERRADA.