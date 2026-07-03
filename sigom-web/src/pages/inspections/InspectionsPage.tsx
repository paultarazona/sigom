import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { inspectionsApi } from '../../api/inspections'
import type { Inspection } from '../../types'

const columns: Column<Inspection>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => (
      <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{row.code}</span>
    ),
  },
  {
    key: 'workOrderId',
    header: 'Orden',
    render: (row) => (
      <span className="font-mono text-xs" style={{ color: 'var(--color-primary)' }}>{row.workOrder?.code ?? row.workOrderId}</span>
    ),
  },
  {
    key: 'observation',
    header: 'Hallazgos',
    render: (row) => (
      <span className="max-w-xs truncate block" style={{ color: 'var(--color-text)' }}>{row.observation}</span>
    ),
  },
  {
    key: 'registeredAt',
    header: 'Fecha',
    render: (row) => (
      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {new Date(row.registeredAt).toLocaleDateString('es-PE')}
      </span>
    ),
  },
]

export function InspectionsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => inspectionsApi.list({ limit: 20 }).then((r) => r.data),
  })

  return (
    <div className="page">
      <PageHeader
        description="Registro de inspecciones realizadas en campo"
      />

      <div className="card">
        {isLoading && <LoadingState rows={8} />}
        {isError && <ErrorState onRetry={refetch} />}
        {data && (
          <DataTable
            columns={columns}
            data={data.data}
            keyExtractor={(row) => row.id}
            emptyMessage="No hay inspecciones registradas."
          />
        )}
      </div>
    </div>
  )
}
