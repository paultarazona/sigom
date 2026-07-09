import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
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
    <div className="form-panel">
      {children}
      <div className="form-panel__cancel">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
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
      { id, data: { finalDiagnosis: finalDiagnosis.trim(), solutionApplied: solution.trim() } },
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
    <div className="actions-panel">
      <h3 className="actions-panel__heading">Acciones</h3>

      {/* Button row */}
      <div className="actions-panel__buttons">
        {status === 'PENDING' && (
          <>
            <Button onClick={() => setActivePanel('assign')} disabled={isWorking}>
              Asignar técnico
            </Button>
            <Button variant="danger" onClick={() => setActivePanel('cancel')} disabled={isWorking}>
              Cancelar orden
            </Button>
          </>
        )}

        {status === 'ASSIGNED' && (
          <>
            <Button onClick={() => setActivePanel('start')} disabled={isWorking}>
              Iniciar en campo
            </Button>
            <Button variant="danger" onClick={() => setActivePanel('cancel')} disabled={isWorking}>
              Cancelar orden
            </Button>
          </>
        )}

        {status === 'IN_FIELD' && (
          <>
            <Button variant="danger" onClick={() => setActivePanel('suspend')} disabled={isWorking}>
              Suspender
            </Button>
            <Button onClick={() => setActivePanel('resolve')} disabled={isWorking}>
              Resolver
            </Button>
          </>
        )}

        {status === 'SUSPENDED' && (
          <Button onClick={() => setActivePanel('reassign')} disabled={isWorking}>
            Reasignar técnico
          </Button>
        )}

        {status === 'RESOLVED' && (
          <Button onClick={() => setActivePanel('close')} disabled={isWorking}>
            Cerrar orden
          </Button>
        )}
      </div>

      {/* Inline forms */}

      {(activePanel === 'assign' || activePanel === 'reassign') && (
        <div className="mt-4">
          <FormPanel onClose={resetPanels}>
            <label className="mb-1 block text-xs font-semibold text-textPrimary">
              ID del técnico
            </label>
            <input
              type="text"
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              placeholder="ej. tech-001"
              className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button onClick={handleAssign} disabled={isWorking || !technicianId.trim()}>
              {assign.isPending ? 'Guardando…' : activePanel === 'reassign' ? 'Reasignar' : 'Asignar'}
            </Button>
          </FormPanel>
        </div>
      )}

      {activePanel === 'start' && (
        <div className="mt-4">
          <FormPanel onClose={resetPanels}>
            <p className="mb-3 text-sm text-textSecondary">
              ¿Confirmás que el técnico inicia el trabajo en campo?
            </p>
            <Button onClick={handleStart} disabled={isWorking}>
              {start.isPending ? 'Iniciando…' : 'Confirmar inicio'}
            </Button>
          </FormPanel>
        </div>
      )}

      {activePanel === 'suspend' && (
        <div className="mt-4">
          <FormPanel onClose={resetPanels}>
            <label className="mb-1 block text-xs font-semibold text-textPrimary">
              Motivo de suspensión
            </label>
            <textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Describí el motivo de la suspensión…"
              className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <Button variant="danger" onClick={handleSuspend} disabled={isWorking || !suspendReason.trim()}>
              {suspend.isPending ? 'Suspendiendo…' : 'Suspender orden'}
            </Button>
          </FormPanel>
        </div>
      )}

      {activePanel === 'resolve' && (
        <div className="mt-4">
          <FormPanel onClose={resetPanels}>
            <label className="mb-1 block text-xs font-semibold text-textPrimary">
              Diagnóstico final
            </label>
            <textarea
              rows={2}
              value={finalDiagnosis}
              onChange={(e) => setFinalDiagnosis(e.target.value)}
              placeholder="Describí el diagnóstico final…"
              className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <label className="mb-1 block text-xs font-semibold text-textPrimary">Solución</label>
            <textarea
              rows={2}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Describí la solución aplicada…"
              className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <Button
              onClick={handleResolve}
              disabled={isWorking || !finalDiagnosis.trim() || !solution.trim()}
            >
              {resolve.isPending ? 'Guardando…' : 'Marcar como resuelta'}
            </Button>
          </FormPanel>
        </div>
      )}

      {activePanel === 'close' && (
        <div className="mt-4">
          <FormPanel onClose={resetPanels}>
            <p className="mb-3 text-sm text-textSecondary">
              ¿Confirmás el cierre definitivo de esta orden?
            </p>
            <Button onClick={handleClose} disabled={isWorking}>
              {close.isPending ? 'Cerrando…' : 'Confirmar cierre'}
            </Button>
          </FormPanel>
        </div>
      )}

      {activePanel === 'cancel' && (
        <>
          <div className="mt-4">
            <FormPanel onClose={resetPanels}>
              <label className="mb-1 block text-xs font-semibold text-textPrimary">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Motivo de cancelación…"
                className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <Button variant="danger" onClick={() => setConfirmOpen(true)} disabled={isWorking}>
                Cancelar orden
              </Button>
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
    <div className="page">
      <button
        onClick={() => navigate(-1)}
        className="back-btn"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState onRetry={refetch} />}

      {data && (
        <>
          <PageHeader
            title={data.type}
            description={`Código: ${data.code}`}
            actions={
              <div className="flex items-center gap-2">
                <StatusBadge status={data.status} />
                <PriorityBadge priority={data.priority} />
              </div>
            }
          />

          <div className="detail-grid">
            <div className="detail-grid__main">
              <div className="detail-card">
                <h3 className="detail-card__heading">Descripción</h3>
                <p className="detail-card__text">{data.initialObservation || 'Sin observación inicial.'}</p>
              </div>

              {(data.finalDiagnosis || data.solutionApplied) && (
                <div className="detail-card">
                  <h3 className="detail-card__heading">Resolución</h3>
                  {data.finalDiagnosis && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">
                        Diagnóstico final
                      </p>
                      <p className="text-sm text-textPrimary leading-relaxed">{data.finalDiagnosis}</p>
                    </div>
                  )}
                  {data.solutionApplied && (
                    <div>
                      <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">
                        Solución
                      </p>
                      <p className="text-sm text-textPrimary leading-relaxed">{data.solutionApplied}</p>
                    </div>
                  )}
                </div>
              )}

              <ActionsPanel id={data.id} status={data.status} />
            </div>

            <div className="detail-grid__side">
              <div className="detail-card">
                <h3 className="detail-card__heading">Detalles</h3>
                <dl className="detail-card__dl">
                  <div className="detail-card__row">
                    <dt className="detail-card__dt">Zona</dt>
                    <dd className="detail-card__dd">{data.zoneId}</dd>
                  </div>
                  <div className="detail-card__row">
                    <dt className="detail-card__dt">Asignado a</dt>
                    <dd className="detail-card__dd">
                      {data.assignedTo
                        ? `${data.assignedTo.firstName} ${data.assignedTo.lastName}`
                        : '—'}
                    </dd>
                  </div>
                  <div className="detail-card__row">
                    <dt className="detail-card__dt">Creada</dt>
                    <dd className="detail-card__dd">
                      {new Date(data.createdAt).toLocaleDateString('es-PE')}
                    </dd>
                  </div>
                  <div className="detail-card__row">
                    <dt className="detail-card__dt">Actualizada</dt>
                    <dd className="detail-card__dd">
                      {new Date(data.updatedAt).toLocaleDateString('es-PE')}
                    </dd>
                  </div>
                </dl>
              </div>

              {(data.status === 'CLOSED' || data.status === 'CANCELLED') && (
                <div className="detail-card">
                  <span
                    className={`status-pill${
                      data.status === 'CLOSED'
                        ? ' status-pill--closed'
                        : ' status-pill--cancelled'
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
