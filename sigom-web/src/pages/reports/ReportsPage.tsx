import { BarChart2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { LoadingSpinner } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { EmptyState } from '../../components/ui/EmptyState'
import { useDashboardSummary } from '../../hooks/useReports'
import { ClipboardList, AlertCircle, Radio, Clock } from 'lucide-react'

export function ReportsPage() {
  const { data, isLoading, isError, refetch } = useDashboardSummary()

  return (
    <div className="p-6">
      <PageHeader
        title="Reportes"
        description="Métricas y estadísticas operativas del sistema"
      />

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState onRetry={refetch} />}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Órdenes pendientes"
              value={data.pending}
              icon={ClipboardList}
              variant="default"
            />
            <StatCard
              title="Órdenes críticas"
              value={data.critical}
              icon={AlertCircle}
              variant="danger"
            />
            <StatCard
              title="En campo"
              value={data.inField}
              icon={Radio}
              variant="warning"
            />
            <StatCard
              title="Tiempo promedio"
              value={`${data.averageResolutionHours}h`}
              icon={Clock}
              variant="success"
            />
          </div>

          <div className="rounded-xl border border-[#C4D0D8] bg-white p-8 shadow-sm">
            <EmptyState
              icon={BarChart2}
              title="Gráficos en construcción"
              description="Los reportes visuales estarán disponibles en la próxima versión."
            />
          </div>
        </div>
      )}
    </div>
  )
}
