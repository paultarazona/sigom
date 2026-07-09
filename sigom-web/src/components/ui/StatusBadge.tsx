import type { WorkOrderStatus } from '../../types'

interface StatusBadgeProps {
  status: WorkOrderStatus
}

const statusConfig: Record<WorkOrderStatus, { label: string; modifier: string }> = {
  PENDING:   { label: 'Pendiente',  modifier: 'status-badge--pending' },
  ASSIGNED:  { label: 'Asignada',   modifier: 'status-badge--assigned' },
  IN_FIELD:  { label: 'En campo',   modifier: 'status-badge--in-field' },
  SUSPENDED: { label: 'Suspendida', modifier: 'status-badge--suspended' },
  RESOLVED:  { label: 'Resuelta',   modifier: 'status-badge--resolved' },
  CLOSED:    { label: 'Cerrada',    modifier: 'status-badge--closed' },
  CANCELLED: { label: 'Anulada',    modifier: 'status-badge--cancelled' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, modifier } = statusConfig[status]
  return (
    <span className={`status-badge ${modifier}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {label}
    </span>
  )
}
