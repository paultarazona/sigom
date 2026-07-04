import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { useCreateWorkOrder } from '../../hooks/useWorkOrders'
import type { Priority, WorkOrderStatus } from '../../types'

interface CreateWorkOrderModalProps {
  open: boolean
  onClose: () => void
}

const initialForm = {
  title: '',
  description: '',
  priority: 'MEDIUM' as Priority,
  status: 'PENDING' as WorkOrderStatus,
  zoneId: '',
}

export function CreateWorkOrderModal({ open, onClose }: CreateWorkOrderModalProps) {
  const { mutate, isPending } = useCreateWorkOrder()
  const [form, setForm] = useState(initialForm)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(form, {
      onSuccess: () => {
        setForm(initialForm)
        onClose()
      },
    })
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <Modal open={open} title="Nueva Orden de Trabajo" onClose={onClose}>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-field">
          <label className="form-field__label" htmlFor="wo-title">
            Título <span className="form-field__required">*</span>
          </label>
          <input
            id="wo-title"
            type="text"
            required
            placeholder="Descripción breve de la orden"
            {...field('title')}
            className="form-field__control"
          />
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="wo-description">
            Descripción
          </label>
          <textarea
            id="wo-description"
            rows={4}
            placeholder="Detallá el trabajo a realizar..."
            {...field('description')}
            className="form-field__control form-field__control--textarea"
          />
        </div>

        <div className="form-grid form-grid--2">
          <div className="form-field">
            <label className="form-field__label" htmlFor="wo-priority">
              Prioridad
            </label>
            <select
              id="wo-priority"
              {...field('priority')}
              className="form-field__control form-field__control--select"
            >
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="wo-zone">
              Zona <span className="form-field__required">*</span>
            </label>
            <input
              id="wo-zone"
              type="text"
              required
              placeholder="ID de zona"
              {...field('zoneId')}
              className="form-field__control"
            />
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Crear orden'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
