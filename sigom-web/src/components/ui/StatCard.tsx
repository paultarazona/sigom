import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  variant?: 'default' | 'warning' | 'danger' | 'success'
  onClick?: () => void
}

const iconModifiers: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: 'stat-card__icon--default',
  warning: 'stat-card__icon--warning',
  danger: 'stat-card__icon--danger',
  success: 'stat-card__icon--success',
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = 'default',
  onClick,
}: StatCardProps) {
  const isInteractive = !!onClick

  return (
    <div
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={`stat-card${isInteractive ? ' stat-card--interactive' : ''}`}
    >
      <div className="stat-card__body">
        <div className="stat-card__info">
          <p className="stat-card__label">{title}</p>
          <p className="stat-card__value">{value}</p>
          {description && (
            <p className="stat-card__description">{description}</p>
          )}
        </div>
        <div className={`stat-card__icon ${iconModifiers[variant]}`}>
          <Icon size={20} strokeWidth={1.75} />
        </div>
      </div>
    </div>
  )
}
