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
    key: 'title',
    header: 'Plan',
    render: (row) => <span className="font-medium text-[#151B30]">{row.title}</span>,
  },
  {
    key: 'zoneId',
    header: 'Zona',
    render: (row) => <span className="text-sm text-[#72727A]">{row.zoneId}</span>,
  },
  {
    key: 'status',
    header: 'Estado',
    render: (row) => (
      <span className="inline-flex items-center rounded-full bg-[#F7F9FB] px-2.5 py-0.5 text-xs font-medium text-[#72727A]">
        {row.status}
      </span>
    ),
  },
  {
    key: 'scheduledDate',
    header: 'Fecha programada',
    render: (row) => (
      <span className="text-sm text-[#72727A]">
        {new Date(row.scheduledDate).toLocaleDateString('es-PE')}
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
    <div className="p-6">
      <PageHeader
        title="Planes de Mantenimiento"
        description="Programación y seguimiento de mantenimientos preventivos"
      />

      <div className="rounded-xl border border-[#C4D0D8] bg-white shadow-sm">
        {isLoading && <LoadingState rows={6} />}
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
