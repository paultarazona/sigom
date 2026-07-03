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
      <span className="font-mono text-xs text-[#72727A]">{row.code}</span>
    ),
  },
  {
    key: 'workOrderId',
    header: 'Orden',
    render: (row) => (
      <span className="font-mono text-xs text-[#00236F]">{row.workOrder?.code ?? row.workOrderId}</span>
    ),
  },
  {
    key: 'observation',
    header: 'Hallazgos',
    render: (row) => (
      <span className="max-w-xs truncate block text-[#151B30]">{row.observation}</span>
    ),
  },
  {
    key: 'registeredAt',
    header: 'Fecha',
    render: (row) => (
      <span className="text-sm text-[#72727A]">
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
    <div className="p-6">
      <PageHeader
        title="Inspecciones"
        description="Registro de inspecciones realizadas en campo"
      />

      <div className="rounded-xl border border-[#C4D0D8] bg-white shadow-sm">
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
