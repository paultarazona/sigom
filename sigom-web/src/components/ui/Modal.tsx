import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

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
    <dialog ref={dialogRef} onClose={onClose} className="modal">
      <div className="modal__header">
        <h2 className="modal__title">{title}</h2>
        <button onClick={onClose} className="modal__close" aria-label="Cerrar">
          <X size={16} />
        </button>
      </div>
      <div className="modal__body">{children}</div>
    </dialog>
  )
}
