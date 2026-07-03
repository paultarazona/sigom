import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { useCreateWorkOrder } from '../../hooks/useWorkOrders'
import type { Priority, WorkOrderStatus } from '../../types'

export function CreateWorkOrderPage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateWorkOrder()

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
    status: 'PENDING' as WorkOrderStatus,
    zoneId: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(form, {
      onSuccess: () => navigate('/work-orders'),
    })
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <div className="page">
      <button
        onClick={() => navigate(-1)}
        className="back-btn"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <PageHeader
        title="Nueva Orden de Trabajo"
        description="Completá los datos para registrar una nueva orden"
      />

      <div className="max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="form-panel"
        >
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1.5">
              Título <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Descripción breve de la orden"
              {...field('title')}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1.5">
              Descripción
            </label>
            <textarea
              rows={4}
              placeholder="Detallá el trabajo a realizar..."
              {...field('description')}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1.5">
                Prioridad
              </label>
              <select
                {...field('priority')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-textPrimary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1.5">
                Zona <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ID de zona"
                {...field('zoneId')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>

          <div className="form-panel__cancel">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending ? 'Guardando...' : 'Crear orden'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
