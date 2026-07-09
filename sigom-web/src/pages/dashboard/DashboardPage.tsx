import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  AlertCircle,
  Radio,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { useDashboardSummary, useAverageAttentionTime } from '../../hooks/useReports'
import { useWorkOrders } from '../../hooks/useWorkOrders'
import type { WorkOrder } from '../../types'

const recentOrdersColumns: Column<WorkOrder>[] = [
  {
    key: 'code',
    header: 'Código',
    render: (row) => (
      <span className="font-mono text-xs font-medium text-primary">{row.code}</span>
    ),
  },
  {
    key: 'type',
    header: 'Título',
    render: (row) => (
      <span className="max-w-xs truncate block text-textPrimary">{row.type}</span>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'priority',
    header: 'Prioridad',
    render: (row) => <PriorityBadge priority={row.priority} />,
  },
  {
    key: 'createdAt',
    header: 'Creada',
    render: (row) => (
      <span className="text-textSecondary">
        {new Date(row.createdAt).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </span>
    ),
  },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const summary = useDashboardSummary()
  const avgTime = useAverageAttentionTime()
  const workOrders = useWorkOrders({ limit: 5, page: 1 })

  const stats = summary.data

  return (
    <div className="page">
      <PageHeader
        description="Resumen del estado actual de las órdenes de trabajo"
      />

      {/* Stat cards */}
      {summary.isLoading && <LoadingState rows={1} />}
      {summary.isError && <ErrorState message="No se pudo cargar el resumen." onRetry={() => summary.refetch()} />}
      {stats && (
        <div className="stat-grid">
          <StatCard
            title="Órdenes pendientes"
            value={stats.pending}
            icon={ClipboardList}
            description="Sin asignar o sin iniciar"
            variant="default"
          />
          <StatCard
            title="Asignadas"
            value={stats.assigned}
            icon={AlertCircle}
            description="En proceso de atención"
            variant="danger"
          />
          <StatCard
            title="En campo"
            value={stats.inField}
            icon={Radio}
            description="Técnicos trabajando ahora"
            variant="warning"
          />
          <StatCard
            title="Tiempo promedio"
            value={avgTime.data ? `${avgTime.data.averageHours}h` : '—'}
            icon={Clock}
            description="De resolución por orden"
            variant="success"
          />
        </div>
      )}

      {/* Recent work orders */}
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">
            Órdenes recientes
          </h3>
          <button
            onClick={() => navigate('/work-orders')}
            className="card__action"
          >
            Ver todas <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>

        {workOrders.isLoading && <LoadingState variant="overlay" />}
        {workOrders.isError && (
          <ErrorState
            message="No se pudieron cargar las órdenes recientes."
            onRetry={() => workOrders.refetch()}
          />
        )}
        {workOrders.data && (
          <DataTable
            columns={recentOrdersColumns}
            data={workOrders.data.data}
            keyExtractor={(row) => row.id}
            onRowClick={(row) => navigate(`/work-orders/${row.id}`)}
            emptyMessage="No hay órdenes registradas aún."
          />
        )}
      </div>
    </div>
  )
}
