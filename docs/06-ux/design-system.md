# Sistema de diseño — SIGOM-ENOSA

## Objetivo visual

SIGOM-ENOSA debe mantener coherencia visual con SISCON-ENOSA,
ya que ambos forman parte del ecosistema operativo de ENOSA.

La interfaz debe transmitir:

- Control operativo.
- Trazabilidad.
- Claridad.
- Profesionalismo.
- Uso empresarial.
- Facilidad para supervisores y técnicos.

---

## Paleta institucional

| Token | Color | Uso |
|---|---:|---|
| `primary` | `#00236F` | Botones principales, logo, títulos institucionales |
| `primaryHover` | `#001A52` | Hover de botones principales |
| `accent` | `#57DFFE` | Ítem activo del sidebar, indicadores y detalles |
| `secondary` | `#00687A` | Botones secundarios y filtros activos |
| `background` | `#F7F9FB` | Fondo principal de la aplicación |
| `surface` | `#FFFFFF` | Cards, tablas, modales y formularios |
| `border` | `#C4D0D8` | Bordes de tablas, inputs y cards |
| `textPrimary` | `#151B30` | Títulos y texto importante |
| `textSecondary` | `#72727A` | Descripciones y texto secundario |
| `success` | `#166534` | Estado resuelto, cerrado o disponible |
| `successBackground` | `#DBFCE6` | Fondo de badges de éxito |
| `warning` | `#B45309` | Estado suspendido o atención pendiente |
| `warningBackground` | `#FEF3C7` | Fondo de badges de advertencia |
| `danger` | `#B91C1C` | Estado anulado, crítico o error |
| `dangerBackground` | `#FEE2E2` | Fondo de badges de error |

---

## Estados de órdenes de trabajo

| Estado API | Texto visible | Estilo visual |
|---|---|---|
| `PENDING` | Pendiente | Gris |
| `ASSIGNED` | Asignada | Azul |
| `IN_FIELD` | En campo | Cian |
| `SUSPENDED` | Suspendida | Amarillo |
| `RESOLVED` | Resuelta | Verde |
| `CLOSED` | Cerrada | Verde oscuro |
| `CANCELLED` | Anulada | Rojo |

---

## Prioridades

| Prioridad API | Texto visible | Estilo visual |
|---|---|---|
| `LOW` | Baja | Gris |
| `MEDIUM` | Media | Azul |
| `HIGH` | Alta | Naranja |
| `CRITICAL` | Crítica | Rojo |

---

## Principios de interfaz

- Fondo general claro.
- Sidebar blanco con borde derecho sutil.
- El ítem activo del sidebar usa color `accent`.
- Las cards deben tener bordes suaves y sombra mínima.
- Los botones principales usan `primary`.
- Las tablas deben ser legibles y priorizar información operativa.
- No usar gradientes fuertes.
- No usar más de un color acento principal por pantalla.
- Los estados deben mostrarse mediante badges consistentes.
- Todo formulario debe mostrar validaciones claras.
- Las acciones destructivas deben pedir confirmación.
- Las acciones críticas deben ser visibles y fáciles de distinguir.

---

## Tipografía

- Fuente recomendada: Inter.
- Títulos: peso `700`.
- Subtítulos: peso `500` o `600`.
- Texto normal: peso `400`.
- Botones: peso `600`.
- No usar más de tres tamaños de texto por pantalla salvo casos justificados.

---

## Componentes iniciales

El frontend debe crear componentes reutilizables para:

- `AppSidebar`
- `AppHeader`
- `PageHeader`
- `StatCard`
- `DataTable`
- `StatusBadge`
- `PriorityBadge`
- `SearchInput`
- `FilterBar`
- `ConfirmDialog`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `Pagination`

---

## Diseño inicial del dashboard

El dashboard operativo debe mostrar:

- Órdenes pendientes.
- Órdenes críticas.
- Órdenes vencidas.
- Órdenes en campo.
- Tiempo promedio de atención.
- Técnicos con mayor carga.
- Órdenes por zona.
- Fallas más frecuentes.

El objetivo visual es permitir que un supervisor identifique rápidamente
qué órdenes requieren atención.