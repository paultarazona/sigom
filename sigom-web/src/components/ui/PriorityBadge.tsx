import type { Priority } from '../../types'

interface PriorityBadgeProps {
  priority: Priority
}

const priorityConfig: Record<Priority, { label: string; className: string; dot: string }> = {
  LOW: {
    label: 'Baja',
    className: 'bg-slate-50 text-slate-500',
    dot: 'bg-slate-300',
  },
  MEDIUM: {
    label: 'Media',
    className: 'bg-blue-50 text-blue-600',
    dot: 'bg-blue-400',
  },
  HIGH: {
    label: 'Alta',
    className: 'bg-orange-50 text-orange-600',
    dot: 'bg-orange-400',
  },
  CRITICAL: {
    label: 'Crítica',
    className: 'bg-red-50 text-red-600 font-semibold',
    dot: 'bg-red-500',
  },
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} shrink-0`} aria-hidden="true" />
      {config.label}
    </span>
  )
}
