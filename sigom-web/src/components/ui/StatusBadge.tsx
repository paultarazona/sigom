import type { WorkOrderStatus } from '../../types'

interface StatusBadgeProps {
  status: WorkOrderStatus
}

const statusConfig: Record<
  WorkOrderStatus,
  { label: string; className: string; dot: string }
> = {
  PENDING: {
    label: 'Pendiente',
    className: 'bg-slate-100 text-slate-600',
    dot: 'bg-slate-400',
  },
  ASSIGNED: {
    label: 'Asignada',
    className: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
  },
  IN_FIELD: {
    label: 'En campo',
    className: 'bg-cyan-50 text-cyan-700',
    dot: 'bg-[#57DFFE]',
  },
  SUSPENDED: {
    label: 'Suspendida',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-400',
  },
  RESOLVED: {
    label: 'Resuelta',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  CLOSED: {
    label: 'Cerrada',
    className: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-700',
  },
  CANCELLED: {
    label: 'Anulada',
    className: 'bg-red-50 text-red-600',
    dot: 'bg-red-400',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} shrink-0`} aria-hidden="true" />
      {config.label}
    </span>
  )
}
