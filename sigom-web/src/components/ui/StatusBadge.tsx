import type { WorkOrderStatus } from '../../types'

interface StatusBadgeProps {
  status: WorkOrderStatus
}

const statusConfig: Record<
  WorkOrderStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Pendiente',
    className: 'bg-gray-100 text-gray-700',
  },
  ASSIGNED: {
    label: 'Asignada',
    className: 'bg-blue-100 text-blue-700',
  },
  IN_FIELD: {
    label: 'En campo',
    className: 'bg-cyan-100 text-cyan-700',
  },
  SUSPENDED: {
    label: 'Suspendida',
    className: 'bg-yellow-100 text-yellow-700',
  },
  RESOLVED: {
    label: 'Resuelta',
    className: 'bg-green-100 text-green-700',
  },
  CLOSED: {
    label: 'Cerrada',
    className: 'bg-emerald-100 text-emerald-800',
  },
  CANCELLED: {
    label: 'Anulada',
    className: 'bg-red-100 text-red-700',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
