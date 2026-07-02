# Flujo de estados de una orden de trabajo

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE
    PENDIENTE --> ASIGNADA
    ASIGNADA --> EN_CAMPO
    EN_CAMPO --> SUSPENDIDA
    SUSPENDIDA --> ASIGNADA
    EN_CAMPO --> RESUELTA
    RESUELTA --> CERRADA
    PENDIENTE --> ANULADA
    ASIGNADA --> ANULADA

Restricciones
Una orden PENDIENTE todavía no tiene técnico asignado.
Una orden EN_CAMPO debe tener técnico responsable.
Una orden RESUELTA debe tener diagnóstico final y solución aplicada.
Una orden CERRADA no se edita normalmente.
Una orden ANULADA no puede volver a activarse.