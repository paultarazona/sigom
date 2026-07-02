import type { Priority } from '../../types'

interface PriorityBadgeProps {
  priority: Priority
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: {
    label: 'Baja',
    className: 'bg-gray-100 text-gray-700',
  },
  MEDIUM: {
    label: 'Media',
    className: 'bg-blue-100 text-blue-700',
  },
  HIGH: {
    label: 'Alta',
    className: 'bg-orange-100 text-orange-700',
  },
  CRITICAL: {
    label: 'Crítica',
    className: 'bg-red-100 text-red-700',
  },
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
