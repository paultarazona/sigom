interface LoadingStateProps {
  message?: string
  rows?: number
  variant?: 'inline' | 'overlay'
}

export function LoadingState({ message = 'Cargando...', rows = 5, variant = 'inline' }: LoadingStateProps) {
  if (variant === 'overlay') {
    return <LoadingOverlay message={message} />
  }

  return (
    <div className="loading-state" role="status" aria-label={message}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="loading-state__row">
          <div className="loading-state__bar loading-state__bar--flex" />
          <div className="loading-state__bar loading-state__bar--w24" />
          <div className="loading-state__bar loading-state__bar--w20" />
        </div>
      ))}
      <span className="sr-only">{message}</span>
    </div>
  )
}

export function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div className="loading-spinner" role="status" aria-label="Cargando...">
      <svg
        className="loading-spinner__svg"
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
      <span className="sr-only">Cargando...</span>
    </div>
  )
}

export function LoadingOverlay({ message = 'Cargando datos...' }: { message?: string }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label={message}>
      <div className="loading-overlay__panel">
        <svg
          className="loading-overlay__spinner"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          width="26"
          height="26"
          aria-hidden="true"
        >
          <circle
            className="loading-overlay__track"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="loading-overlay__mark"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V1C5.925 1 1 5.925 1 12h3z"
          />
        </svg>
        <span className="loading-overlay__message">{message}</span>
      </div>
    </div>
  )
}
