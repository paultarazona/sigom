import type { Priority } from '../../types'

interface PriorityBadgeProps {
  priority: Priority
}

const priorityConfig: Record<Priority, { label: string; modifier: string }> = {
  LOW:      { label: 'Baja',    modifier: 'priority-badge--low' },
  MEDIUM:   { label: 'Media',   modifier: 'priority-badge--medium' },
  HIGH:     { label: 'Alta',    modifier: 'priority-badge--high' },
  CRITICAL: { label: 'Crítica', modifier: 'priority-badge--critical' },
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { label, modifier } = priorityConfig[priority]
  return (
    <span className={`priority-badge ${modifier}`}>
      <span className="priority-badge__dot" aria-hidden="true" />
      {label}
    </span>
  )
}
