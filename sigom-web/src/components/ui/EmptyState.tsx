import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
}

export function EmptyState({
  title = 'Sin resultados',
  description = 'No se encontraron registros.',
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-background p-4">
        <Icon size={32} className="text-border" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-textPrimary">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-textSecondary">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
