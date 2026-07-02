import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  variant?: 'default' | 'warning' | 'danger' | 'success'
}

const variantStyles: Record<string, { icon: string; border: string }> = {
  default: { icon: 'bg-blue-50 text-[#00236F]', border: 'border-border' },
  warning: { icon: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-200' },
  danger: { icon: 'bg-red-50 text-red-600', border: 'border-red-200' },
  success: { icon: 'bg-green-50 text-green-700', border: 'border-green-200' },
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = 'default',
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${styles.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#72727A] truncate">{title}</p>
          <p className="mt-1 text-3xl font-bold text-[#151B30]">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-[#72727A]">{description}</p>
          )}
        </div>
        <div className={`rounded-lg p-2.5 ${styles.icon} shrink-0`}>
          <Icon size={20} strokeWidth={1.75} />
        </div>
      </div>
    </div>
  )
}
