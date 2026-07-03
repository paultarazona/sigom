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
    key: 'mimeType',
    header: 'Tipo',
    render: (row) => (
      <span className="rounded-md bg-[#F7F9FB] px-2 py-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
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
        className="text-sm hover:underline"
        style={{ color: 'var(--color-primary)' }}
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
      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
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
    <div className="page">
      <PageHeader
        description="Archivos y fotografías adjuntas a las órdenes de trabajo"
      />

      <div className="card">
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
