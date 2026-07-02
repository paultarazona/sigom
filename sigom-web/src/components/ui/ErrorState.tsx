import { AlertTriangle } from 'lucide-react'

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
      <h3 className="text-base font-semibold text-[#151B30]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[#72727A]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-[#00236F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#001A52] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00236F]/40"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
