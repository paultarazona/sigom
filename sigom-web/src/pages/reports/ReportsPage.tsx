import { BarChart2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { LoadingSpinner } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { EmptyState } from '../../components/ui/EmptyState'
import { useDashboardSummary, useAverageAttentionTime } from '../../hooks/useReports'
import { ClipboardList, Users, Radio, Clock } from 'lucide-react'

export function ReportsPage() {
  const { data, isLoading, isError, refetch } = useDashboardSummary()
  const avgTime = useAverageAttentionTime()

  return (
    <div className="page">
      <PageHeader
        description="Métricas y estadísticas operativas del sistema"
      />

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState onRetry={refetch} />}

      {data && (
        <>
          <div className="stat-grid">
            <StatCard
              title="Órdenes pendientes"
              value={data.pending}
              icon={ClipboardList}
              variant="default"
            />
            <StatCard
              title="Asignadas"
              value={data.assigned}
              icon={Users}
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
              value={avgTime.data ? `${avgTime.data.averageHours}h` : '—'}
              icon={Clock}
              variant="success"
            />
          </div>

          <div className="card">
            <EmptyState
              icon={BarChart2}
              title="Gráficos en construcción"
              description="Los reportes visuales estarán disponibles en la próxima versión."
            />
          </div>
        </>
      )}
    </div>
  )
}
