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
    render: (row) => <span className="font-medium" style={{ color: 'var(--color-text)' }}>{row.name}</span>,
  },
  {
    key: 'leaderId',
    header: 'Líder',
    render: (row) => (
      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {`${row.leader?.firstName ?? ''} ${row.leader?.lastName ?? ''}`.trim()}
      </span>
    ),
  },
  {
    key: 'members',
    header: 'Integrantes',
    render: (row) => (
      <span className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--color-text)' }}>
        <Users size={14} style={{ color: 'var(--color-text-muted)' }} />
        {row._count?.members ?? 0}
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
    <div className="page">
      <PageHeader
        description="Equipos de trabajo y sus integrantes"
      />

      <div className="card">
        {isLoading && <LoadingState variant="overlay" />}
        {isError && <ErrorState onRetry={refetch} />}
        {data && data.data.length === 0 && (
          <EmptyState
            icon={Users}
            title="Sin cuadrillas"
            description="No hay cuadrillas registradas aún."
            hint="Contactá al administrador para registrar las cuadrillas de trabajo."
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
