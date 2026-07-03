import type { ReactNode } from 'react'

interface FilterBarProps {
  children: ReactNode
  className?: string
}

export function FilterBar({ children, className = '' }: FilterBarProps) {
  return (
    <div className={`filter-bar${className ? ` ${className}` : ''}`}>
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
    <div className="filter-select">
      <label className="filter-select__label">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="filter-select__input"
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
