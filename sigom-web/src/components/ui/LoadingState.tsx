interface LoadingStateProps {
  message?: string
  rows?: number
}

export function LoadingState({ message = 'Cargando...', rows = 5 }: LoadingStateProps) {
  return (
    <div className="space-y-3 p-4" role="status" aria-label={message}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 flex-1 animate-pulse rounded bg-[#C4D0D8]/60" />
          <div className="h-4 w-24 animate-pulse rounded bg-[#C4D0D8]/60" />
          <div className="h-4 w-20 animate-pulse rounded bg-[#C4D0D8]/60" />
        </div>
      ))}
      <span className="sr-only">{message}</span>
    </div>
  )
}

export function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-8">
      <svg
        className="animate-spin text-[#00236F]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  )
}
