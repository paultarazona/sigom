import { useQuery } from '@tanstack/react-query'
import { CalendarClock } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { EmptyState } from '../../components/ui/EmptyState'
import { maintenancePlansApi } from '../../api/maintenance-plans'
import type { MaintenancePlan } from '../../types'

const columns: Column<MaintenancePlan>[] = [
  {
    key: 'name',
    header: 'Plan',
    render: (row) => <span className="font-medium" style={{ color: 'var(--color-text)' }}>{row.name}</span>,
  },
  {
    key: 'frequencyDays',
    header: 'Zona',
    render: (row) => (
      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{`Cada ${row.frequencyDays} días`}</span>
    ),
  },
  {
    key: 'isActive',
    header: 'Estado',
    render: (row) => (
      <span className="inline-flex items-center rounded-full bg-[#F7F9FB] px-2.5 py-0.5 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
        {row.isActive ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
  {
    key: 'startDate',
    header: 'Fecha programada',
    render: (row) => (
      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {new Date(row.startDate).toLocaleDateString('es-PE')}
      </span>
    ),
  },
]

export function MaintenancePlansPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['maintenance-plans'],
    queryFn: () => maintenancePlansApi.list({ limit: 20 }).then((r) => r.data),
  })

  return (
    <div className="page">
      <PageHeader
        description="Programación y seguimiento de mantenimientos preventivos"
      />

      <div className="card">
        {isLoading && <LoadingState variant="overlay" />}
        {isError && <ErrorState onRetry={refetch} />}
        {data && data.data.length === 0 && (
          <EmptyState
            icon={CalendarClock}
            title="Sin planes"
            description="No hay planes de mantenimiento registrados."
          />
        )}
        {data && data.data.length > 0 && (
          <DataTable
            columns={columns}
            data={data.data}
            keyExtractor={(row) => row.id}
          />
        )}
      </div>
    </div>
  )
}
