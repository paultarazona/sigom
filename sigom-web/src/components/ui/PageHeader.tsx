import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#E8EEF2] pb-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[#151B30]">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[#72727A]">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  )
}
