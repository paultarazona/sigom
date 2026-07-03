export type ToastType = 'success' | 'error' | 'warning' | 'loading'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration: number // ms, 0 = no auto-dismiss
}

type ToastListener = (toast: ToastItem) => void
type DismissListener = (id: string) => void

const toastListeners: Set<ToastListener> = new Set()
const dismissListeners: Set<DismissListener> = new Set()

function emit(item: ToastItem): void {
  toastListeners.forEach((fn) => fn(item))
}

function emitDismiss(id: string): void {
  dismissListeners.forEach((fn) => fn(id))
}

function generateId(): string {
  return Math.random().toString(36).slice(2)
}

export const toast = {
  success(message: string, duration = 3000): string {
    const id = generateId()
    emit({ id, type: 'success', message, duration })
    return id
  },

  error(message: string, duration = 5000): string {
    const id = generateId()
    emit({ id, type: 'error', message, duration })
    return id
  },

  warning(message: string, duration = 4000): string {
    const id = generateId()
    emit({ id, type: 'warning', message, duration })
    return id
  },

  loading(message: string): string {
    const id = generateId()
    emit({ id, type: 'loading', message, duration: 0 })
    return id
  },

  dismiss(id: string): void {
    emitDismiss(id)
  },
}

export function subscribe(fn: ToastListener): () => void {
  toastListeners.add(fn)
  return () => toastListeners.delete(fn)
}

export function subscribeDismiss(fn: DismissListener): () => void {
  dismissListeners.add(fn)
  return () => dismissListeners.delete(fn)
}
