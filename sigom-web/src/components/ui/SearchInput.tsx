import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#72727A] pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#C4D0D8] bg-white py-2 pl-9 pr-4 text-sm text-[#151B30] placeholder:text-[#72727A] focus:border-[#00236F] focus:outline-none focus:ring-2 focus:ring-[#00236F]/20 transition-colors"
      />
    </div>
  )
}
