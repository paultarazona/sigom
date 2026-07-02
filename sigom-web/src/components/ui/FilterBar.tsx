import type { ReactNode } from 'react'

interface FilterBarProps {
  children: ReactNode
  className?: string
}

export function FilterBar({ children, className = '' }: FilterBarProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-lg border border-[#C4D0D8] bg-white px-4 py-3 ${className}`}
    >
      {children}
    </div>
  )
}

interface FilterSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

export function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-[#72727A] whitespace-nowrap">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-[#C4D0D8] bg-white py-1.5 pl-2.5 pr-7 text-sm text-[#151B30] focus:border-[#00236F] focus:outline-none focus:ring-2 focus:ring-[#00236F]/20 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
