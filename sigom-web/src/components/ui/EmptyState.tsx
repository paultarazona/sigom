import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  hint?: string
}

export function EmptyState({
  title = 'Sin resultados',
  description = 'No se encontraron registros.',
  icon: Icon = Inbox,
  action,
  hint,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {hint && <p className="empty-state__hint">{hint}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
