# Integración entre SISCON y SIGOM

## Contrato vigente

SISCON crea órdenes mediante `POST /api/v1/integrations/siscon/work-orders` en SIGOM (`http://localhost:3001`). La solicitud incluye `Authorization: HMAC <firma>`, `Idempotency-Key`, `X-Request-Id` y `X-SISCON-Timestamp`.

Los identificadores de SISCON son strings opacos. SIGOM persiste sus snapshots de zona, suministro, medidor y dirección; no crea foreign keys hacia datos de SISCON.

SIGOM responde con su UUID y código `OT-...`. Al cerrar una orden proveniente de SISCON, persiste un evento `work-order.closed` en su outbox y lo entrega en forma asíncrona a `SISCON_API_URL`. Un fallo de SISCON no bloquea el cierre operativo.

Solo `CLOSED` habilita a SISCON para resolver su incidencia. `CANCELLED` no la resuelve.
