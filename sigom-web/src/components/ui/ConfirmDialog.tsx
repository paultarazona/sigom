import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

const variantStyles = {
  danger: {
    icon: 'bg-red-50 text-red-600',
    confirm: 'bg-[#B91C1C] hover:bg-red-800 focus:ring-red-500/40',
  },
  warning: {
    icon: 'bg-yellow-50 text-yellow-600',
    confirm: 'bg-[#B45309] hover:bg-yellow-800 focus:ring-yellow-500/40',
  },
  default: {
    icon: 'bg-blue-50 text-[#00236F]',
    confirm: 'bg-[#00236F] hover:bg-[#001A52] focus:ring-[#00236F]/40',
  },
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const styles = variantStyles[variant]

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      el.showModal()
    } else {
      el.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      className="rounded-xl p-0 shadow-xl backdrop:bg-black/40 w-full max-w-md open:flex open:flex-col"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`shrink-0 rounded-full p-2.5 ${styles.icon}`}>
            <AlertTriangle size={20} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-textPrimary">{title}</h3>
            <p className="mt-1 text-sm text-textSecondary">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="shrink-0 rounded-md p-1 text-textSecondary hover:bg-background transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
        <button
          onClick={onCancel}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-textPrimary hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 ${styles.confirm}`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
