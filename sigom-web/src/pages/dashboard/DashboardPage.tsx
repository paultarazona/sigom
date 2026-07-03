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
import { useDashboardSummary } from '../../hooks/useReports'
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
    key: 'title',
    header: 'Título',
    render: (row) => (
      <span className="max-w-xs truncate block text-textPrimary">{row.title}</span>
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
  const workOrders = useWorkOrders({ limit: 5, page: 1 })

  const stats = summary.data

  return (
    <div className="p-6">
      <PageHeader
        title="Dashboard operativo"
        description="Resumen del estado actual de las órdenes de trabajo"
      />

      {/* Stat cards */}
      {summary.isLoading && <LoadingState rows={1} />}
      {summary.isError && <ErrorState message="No se pudo cargar el resumen." onRetry={() => summary.refetch()} />}
      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Órdenes pendientes"
            value={stats.pending}
            icon={ClipboardList}
            description="Sin asignar o sin iniciar"
            variant="default"
          />
          <StatCard
            title="Órdenes críticas"
            value={stats.critical}
            icon={AlertCircle}
            description="Requieren atención inmediata"
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
            value={`${stats.averageResolutionHours}h`}
            icon={Clock}
            description="De resolución por orden"
            variant="success"
          />
        </div>
      )}

      {/* Recent work orders */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-textPrimary">
            Órdenes recientes
          </h3>
          <button
            onClick={() => navigate('/work-orders')}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Ver todas <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>

        {workOrders.isLoading && <LoadingState rows={5} />}
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
