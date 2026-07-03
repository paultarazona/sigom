import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  variant?: 'default' | 'warning' | 'danger' | 'success'
}

const variantStyles: Record<string, { icon: string }> = {
  default: { icon: 'bg-[#00236F]/8 text-[#00236F]' },
  warning: { icon: 'bg-amber-50 text-amber-600' },
  danger: { icon: 'bg-red-50 text-red-600' },
  success: { icon: 'bg-emerald-50 text-emerald-700' },
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
      className="rounded-xl bg-white p-5 shadow-sm border border-[#E8EEF2] transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#72727A] truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-[#151B30]">{value}</p>
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
