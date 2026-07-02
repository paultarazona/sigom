import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { EmptyState } from '../../components/ui/EmptyState'
import { crewsApi } from '../../api/crews'
import type { Crew } from '../../types'

const columns: Column<Crew>[] = [
  {
    key: 'name',
    header: 'Cuadrilla',
    render: (row) => <span className="font-medium text-[#151B30]">{row.name}</span>,
  },
  {
    key: 'leaderId',
    header: 'Líder',
    render: (row) => <span className="text-sm text-[#72727A]">{row.leaderId}</span>,
  },
  {
    key: 'members',
    header: 'Integrantes',
    render: (row) => (
      <span className="inline-flex items-center gap-1 text-sm text-[#151B30]">
        <Users size={14} className="text-[#72727A]" />
        {row.members?.length ?? 0}
      </span>
    ),
  },
]

export function CrewsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['crews'],
    queryFn: () => crewsApi.list({ limit: 20 }).then((r) => r.data),
  })

  return (
    <div className="p-6">
      <PageHeader
        title="Cuadrillas"
        description="Equipos de trabajo y sus integrantes"
      />

      <div className="rounded-xl border border-[#C4D0D8] bg-white shadow-sm">
        {isLoading && <LoadingState rows={6} />}
        {isError && <ErrorState onRetry={refetch} />}
        {data && data.data.length === 0 && (
          <EmptyState
            icon={Users}
            title="Sin cuadrillas"
            description="No hay cuadrillas registradas aún."
          />
        )}
        {data && data.data.length > 0 && (
          <DataTable
            columns={columns}
            data={data.data}
            keyExtractor={(row) => row.id}
            emptyMessage="No hay cuadrillas registradas."
          />
        )}
      </div>
    </div>
  )
}
