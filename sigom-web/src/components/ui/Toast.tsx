import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Loader2, X } from 'lucide-react'
import { subscribe, subscribeDismiss, type ToastItem } from '../../lib/toast'

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const unsubscribe = subscribe((item) => {
      setToasts((prev) => [...prev, item])

      if (item.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== item.id))
        }, item.duration)
      }
    })

    const unsubscribeDismiss = subscribeDismiss((id) => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    })

    return () => {
      unsubscribe()
      unsubscribeDismiss()
    }
  }, [])

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <ToastItem key={t.id} item={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  item: ToastItem
  onDismiss: (id: string) => void
}

function ToastItem({ item, onDismiss }: ToastItemProps) {
  return (
    <div className={`toast toast--${item.type}`} role="alert">
      <ToastIcon type={item.type} />
      <p className="toast__message">{item.message}</p>
      {item.type !== 'loading' && (
        <button
          className="toast__close"
          aria-label="Cerrar"
          onClick={() => onDismiss(item.id)}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

function ToastIcon({ type }: { type: ToastItem['type'] }) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="toast__icon" size={18} />
    case 'error':
      return <XCircle className="toast__icon" size={18} />
    case 'warning':
      return <AlertTriangle className="toast__icon" size={18} />
    case 'loading':
      return <Loader2 className="toast__icon toast__icon--spin" size={18} />
  }
}
