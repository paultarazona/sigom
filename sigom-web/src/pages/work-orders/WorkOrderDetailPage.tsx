import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { LoadingSpinner } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useWorkOrder } from '../../hooks/useWorkOrders'
import {
  useAssignWorkOrder,
  useStartWorkOrder,
  useSuspendWorkOrder,
  useResolveWorkOrder,
  useCloseWorkOrder,
  useCancelWorkOrder,
} from '../../hooks/useWorkOrders'
import type { WorkOrderStatus } from '../../types'

// ---------------------------------------------------------------------------
// Local form state types
// ---------------------------------------------------------------------------

type ActivePanel =
  | 'assign'
  | 'reassign'
  | 'start'
  | 'suspend'
  | 'resolve'
  | 'close'
  | 'cancel'
  | null

// ---------------------------------------------------------------------------
// Shared button primitives
// ---------------------------------------------------------------------------

function PrimaryBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-[#00236F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#001A52] focus:outline-none focus:ring-2 focus:ring-[#00236F]/40 disabled:opacity-50"
    >
      {children}
    </button>
  )
}

function DangerBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:opacity-50"
    >
      {children}
    </button>
  )
}

function SecondaryBtn({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-[#C4D0D8] bg-white px-4 py-2 text-sm font-semibold text-[#151B30] transition-colors hover:bg-[#F7F9FB] focus:outline-none focus:ring-2 focus:ring-[#00236F]/30"
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Inline form panel
// ---------------------------------------------------------------------------

function FormPanel({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="rounded-xl border border-[#C4D0D8] bg-[#F7F9FB] p-4">
      {children}
      <div className="mt-3">
        <SecondaryBtn onClick={onClose}>Cancelar</SecondaryBtn>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Actions panel — renders contextual controls based on status
// ---------------------------------------------------------------------------

interface ActionsPanelProps {
  id: string
  status: WorkOrderStatus
}

function ActionsPanel({ id, status }: ActionsPanelProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)

  // form state
  const [technicianId, setTechnicianId] = useState('')
  const [suspendReason, setSuspendReason] = useState('')
  const [finalDiagnosis, setFinalDiagnosis] = useState('')
  const [solution, setSolution] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  // mutations
  const assign = useAssignWorkOrder()
  const start = useStartWorkOrder()
  const suspend = useSuspendWorkOrder()
  const resolve = useResolveWorkOrder()
  const close = useCloseWorkOrder()
  const cancel = useCancelWorkOrder()

  const isWorking =
    assign.isPending ||
    start.isPending ||
    suspend.isPending ||
    resolve.isPending ||
    close.isPending ||
    cancel.isPending

  function resetPanels() {
    setActivePanel(null)
    setTechnicianId('')
    setSuspendReason('')
    setFinalDiagnosis('')
    setSolution('')
    setCancelReason('')
  }

  // ---- handlers ----

  function handleAssign() {
    if (!technicianId.trim()) return
    assign.mutate({ id, data: { technicianId: technicianId.trim() } }, { onSuccess: resetPanels })
  }

  function handleStart() {
    start.mutate(id, { onSuccess: resetPanels })
  }

  function handleSuspend() {
    if (!suspendReason.trim()) return
    suspend.mutate({ id, data: { reason: suspendReason.trim() } }, { onSuccess: resetPanels })
  }

  function handleResolve() {
    if (!finalDiagnosis.trim() || !solution.trim()) return
    resolve.mutate(
      { id, data: { finalDiagnosis: finalDiagnosis.trim(), solution: solution.trim() } },
      { onSuccess: resetPanels },
    )
  }

  function handleClose() {
    close.mutate(id, { onSuccess: resetPanels })
  }

  function handleCancel() {
    cancel.mutate({ id, data: { reason: cancelReason.trim() } }, {
      onSuccess: () => {
        setConfirmOpen(false)
        resetPanels()
      },
    })
  }

  // ---- render ----

  if (status === 'CLOSED' || status === 'CANCELLED') {
    return null
  }

  return (
    <div className="rounded-xl border border-[#C4D0D8] bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-[#151B30]">Acciones</h3>

      {/* Button row */}
      <div className="flex flex-wrap gap-2">
        {status === 'PENDING' && (
          <>
            <PrimaryBtn onClick={() => setActivePanel('assign')} disabled={isWorking}>
              Asignar técnico
            </PrimaryBtn>
            <DangerBtn onClick={() => setActivePanel('cancel')} disabled={isWorking}>
              Cancelar orden
            </DangerBtn>
          </>
        )}

        {status === 'ASSIGNED' && (
          <>
            <PrimaryBtn onClick={() => setActivePanel('start')} disabled={isWorking}>
              Iniciar en campo
            </PrimaryBtn>
            <DangerBtn onClick={() => setActivePanel('cancel')} disabled={isWorking}>
              Cancelar orden
            </DangerBtn>
          </>
        )}

        {status === 'IN_FIELD' && (
          <>
            <DangerBtn onClick={() => setActivePanel('suspend')} disabled={isWorking}>
              Suspender
            </DangerBtn>
            <PrimaryBtn onClick={() => setActivePanel('resolve')} disabled={isWorking}>
              Resolver
            </PrimaryBtn>
          </>
        )}

        {status === 'SUSPENDED' && (
          <PrimaryBtn onClick={() => setActivePanel('reassign')} disabled={isWorking}>
            Reasignar técnico
          </PrimaryBtn>
        )}

        {status === 'RESOLVED' && (
          <PrimaryBtn onClick={() => setActivePanel('close')} disabled={isWorking}>
            Cerrar orden
          </PrimaryBtn>
        )}
      </div>

      {/* Inline forms */}

      {(activePanel === 'assign' || activePanel === 'reassign') && (
        <div className="mt-4">
          <FormPanel onClose={resetPanels}>
            <label className="mb-1 block text-xs font-semibold text-[#151B30]">
              ID del técnico
            </label>
            <input
              type="text"
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              placeholder="ej. tech-001"
              className="mb-3 w-full rounded-lg border border-[#C4D0D8] px-3 py-2 text-sm text-[#151B30] focus:outline-none focus:ring-2 focus:ring-[#00236F]/40"
            />
            <PrimaryBtn onClick={handleAssign} disabled={isWorking || !technicianId.trim()}>
              {assign.isPending ? 'Guardando…' : activePanel === 'reassign' ? 'Reasignar' : 'Asignar'}
            </PrimaryBtn>
          </FormPanel>
        </div>
      )}

      {activePanel === 'start' && (
        <div className="mt-4">
          <FormPanel onClose={resetPanels}>
            <p className="mb-3 text-sm text-[#72727A]">
              ¿Confirmás que el técnico inicia el trabajo en campo?
            </p>
            <PrimaryBtn onClick={handleStart} disabled={isWorking}>
              {start.isPending ? 'Iniciando…' : 'Confirmar inicio'}
            </PrimaryBtn>
          </FormPanel>
        </div>
      )}

      {activePanel === 'suspend' && (
        <div className="mt-4">
          <FormPanel onClose={resetPanels}>
            <label className="mb-1 block text-xs font-semibold text-[#151B30]">
              Motivo de suspensión
            </label>
            <textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Describí el motivo de la suspensión…"
              className="mb-3 w-full rounded-lg border border-[#C4D0D8] px-3 py-2 text-sm text-[#151B30] focus:outline-none focus:ring-2 focus:ring-[#00236F]/40 resize-none"
            />
            <DangerBtn onClick={handleSuspend} disabled={isWorking || !suspendReason.trim()}>
              {suspend.isPending ? 'Suspendiendo…' : 'Suspender orden'}
            </DangerBtn>
          </FormPanel>
        </div>
      )}

      {activePanel === 'resolve' && (
        <div className="mt-4">
          <FormPanel onClose={resetPanels}>
            <label className="mb-1 block text-xs font-semibold text-[#151B30]">
              Diagnóstico final
            </label>
            <textarea
              rows={2}
              value={finalDiagnosis}
              onChange={(e) => setFinalDiagnosis(e.target.value)}
              placeholder="Describí el diagnóstico final…"
              className="mb-3 w-full rounded-lg border border-[#C4D0D8] px-3 py-2 text-sm text-[#151B30] focus:outline-none focus:ring-2 focus:ring-[#00236F]/40 resize-none"
            />
            <label className="mb-1 block text-xs font-semibold text-[#151B30]">Solución</label>
            <textarea
              rows={2}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Describí la solución aplicada…"
              className="mb-3 w-full rounded-lg border border-[#C4D0D8] px-3 py-2 text-sm text-[#151B30] focus:outline-none focus:ring-2 focus:ring-[#00236F]/40 resize-none"
            />
            <PrimaryBtn
              onClick={handleResolve}
              disabled={isWorking || !finalDiagnosis.trim() || !solution.trim()}
            >
              {resolve.isPending ? 'Guardando…' : 'Marcar como resuelta'}
            </PrimaryBtn>
          </FormPanel>
        </div>
      )}

      {activePanel === 'close' && (
        <div className="mt-4">
          <FormPanel onClose={resetPanels}>
            <p className="mb-3 text-sm text-[#72727A]">
              ¿Confirmás el cierre definitivo de esta orden?
            </p>
            <PrimaryBtn onClick={handleClose} disabled={isWorking}>
              {close.isPending ? 'Cerrando…' : 'Confirmar cierre'}
            </PrimaryBtn>
          </FormPanel>
        </div>
      )}

      {activePanel === 'cancel' && (
        <>
          <div className="mt-4">
            <FormPanel onClose={resetPanels}>
              <label className="mb-1 block text-xs font-semibold text-[#151B30]">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Motivo de cancelación…"
                className="mb-3 w-full rounded-lg border border-[#C4D0D8] px-3 py-2 text-sm text-[#151B30] focus:outline-none focus:ring-2 focus:ring-[#00236F]/40"
              />
              <DangerBtn onClick={() => setConfirmOpen(true)} disabled={isWorking}>
                Cancelar orden
              </DangerBtn>
            </FormPanel>
          </div>

          <ConfirmDialog
            open={confirmOpen}
            title="Cancelar orden de trabajo"
            message="Esta acción no se puede deshacer. ¿Confirmás la cancelación?"
            confirmLabel="Sí, cancelar"
            cancelLabel="Volver"
            variant="danger"
            onConfirm={handleCancel}
            onCancel={() => setConfirmOpen(false)}
          />
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useWorkOrder(id ?? '')

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm text-[#72727A] hover:text-[#151B30] transition-colors"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState onRetry={refetch} />}

      {data && (
        <>
          <PageHeader
            title={data.title}
            description={`Código: ${data.code}`}
            actions={
              <div className="flex items-center gap-2">
                <StatusBadge status={data.status} />
                <PriorityBadge priority={data.priority} />
              </div>
            }
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-[#C4D0D8] bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-[#151B30]">Descripción</h3>
                <p className="text-sm text-[#72727A] leading-relaxed">{data.description}</p>
              </div>

              {(data.finalDiagnosis || data.solution) && (
                <div className="rounded-xl border border-[#C4D0D8] bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-[#151B30]">Resolución</h3>
                  {data.finalDiagnosis && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-[#72727A] uppercase tracking-wide mb-1">
                        Diagnóstico final
                      </p>
                      <p className="text-sm text-[#151B30] leading-relaxed">{data.finalDiagnosis}</p>
                    </div>
                  )}
                  {data.solution && (
                    <div>
                      <p className="text-xs font-semibold text-[#72727A] uppercase tracking-wide mb-1">
                        Solución
                      </p>
                      <p className="text-sm text-[#151B30] leading-relaxed">{data.solution}</p>
                    </div>
                  )}
                </div>
              )}

              <ActionsPanel id={data.id} status={data.status} />
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#C4D0D8] bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-[#151B30]">Detalles</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[#72727A]">Zona</dt>
                    <dd className="font-medium text-[#151B30]">{data.zoneId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#72727A]">Asignado a</dt>
                    <dd className="font-medium text-[#151B30]">{data.assignedTo ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#72727A]">Creada</dt>
                    <dd className="font-medium text-[#151B30]">
                      {new Date(data.createdAt).toLocaleDateString('es-PE')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#72727A]">Actualizada</dt>
                    <dd className="font-medium text-[#151B30]">
                      {new Date(data.updatedAt).toLocaleDateString('es-PE')}
                    </dd>
                  </div>
                </dl>
              </div>

              {(data.status === 'CLOSED' || data.status === 'CANCELLED') && (
                <div className="rounded-xl border border-[#C4D0D8] bg-white p-5 shadow-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      data.status === 'CLOSED'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {data.status === 'CLOSED' ? 'Cerrada' : 'Cancelada'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
