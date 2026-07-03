import { useQuery } from '@tanstack/react-query'
import { ImageIcon } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { EmptyState } from '../../components/ui/EmptyState'
import { evidencesApi } from '../../api/evidences'
import type { Evidence } from '../../types'

const columns: Column<Evidence>[] = [
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
    key: 'mimeType',
    header: 'Tipo',
    render: (row) => (
      <span className="rounded-md bg-[#F7F9FB] px-2 py-0.5 text-xs text-[#72727A]">
        {row.mimeType}
      </span>
    ),
  },
  {
    key: 'filePath',
    header: 'Archivo',
    render: (row) => (
      <a
        href={`http://localhost:3000/${row.filePath?.replace(/^\//, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-[#00236F] hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        Ver archivo
      </a>
    ),
  },
  {
    key: 'registeredAt',
    header: 'Subida',
    render: (row) => (
      <span className="text-sm text-[#72727A]">
        {new Date(row.registeredAt).toLocaleDateString('es-PE')}
      </span>
    ),
  },
]

export function EvidencesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['evidences'],
    queryFn: () => evidencesApi.list({ limit: 20 }).then((r) => r.data),
  })

  return (
    <div className="p-6">
      <PageHeader
        title="Evidencias"
        description="Archivos y fotografías adjuntas a las órdenes de trabajo"
      />

      <div className="rounded-xl border border-[#C4D0D8] bg-white shadow-sm">
        {isLoading && <LoadingState rows={8} />}
        {isError && <ErrorState onRetry={refetch} />}
        {data && data.data.length === 0 && (
          <EmptyState
            icon={ImageIcon}
            title="Sin evidencias"
            description="No se han subido archivos aún."
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
