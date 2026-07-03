import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Error al cargar',
  message = 'Ocurrió un problema al obtener los datos. Intentá de nuevo.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-red-50 p-4">
        <AlertTriangle size={32} className="text-red-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-textPrimary">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-textSecondary">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-4">
          Reintentar
        </Button>
      )}
    </div>
  )
}
