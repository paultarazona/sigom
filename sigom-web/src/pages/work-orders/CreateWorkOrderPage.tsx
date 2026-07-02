import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
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
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm text-[#72727A] hover:text-[#151B30] transition-colors"
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
          className="rounded-xl border border-[#C4D0D8] bg-white p-6 shadow-sm space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-[#151B30] mb-1.5">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Descripción breve de la orden"
              {...field('title')}
              className="w-full rounded-lg border border-[#C4D0D8] px-3 py-2 text-sm text-[#151B30] placeholder:text-[#72727A] focus:border-[#00236F] focus:outline-none focus:ring-2 focus:ring-[#00236F]/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#151B30] mb-1.5">
              Descripción
            </label>
            <textarea
              rows={4}
              placeholder="Detallá el trabajo a realizar..."
              {...field('description')}
              className="w-full rounded-lg border border-[#C4D0D8] px-3 py-2 text-sm text-[#151B30] placeholder:text-[#72727A] focus:border-[#00236F] focus:outline-none focus:ring-2 focus:ring-[#00236F]/20 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#151B30] mb-1.5">
                Prioridad
              </label>
              <select
                {...field('priority')}
                className="w-full rounded-lg border border-[#C4D0D8] px-3 py-2 text-sm text-[#151B30] focus:border-[#00236F] focus:outline-none focus:ring-2 focus:ring-[#00236F]/20 transition-colors"
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#151B30] mb-1.5">
                Zona <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ID de zona"
                {...field('zoneId')}
                className="w-full rounded-lg border border-[#C4D0D8] px-3 py-2 text-sm text-[#151B30] placeholder:text-[#72727A] focus:border-[#00236F] focus:outline-none focus:ring-2 focus:ring-[#00236F]/20 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-[#C4D0D8] bg-white px-4 py-2 text-sm font-semibold text-[#151B30] hover:bg-[#F7F9FB] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#00236F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#001A52] transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#00236F]/40"
            >
              {isPending ? 'Guardando...' : 'Crear orden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
