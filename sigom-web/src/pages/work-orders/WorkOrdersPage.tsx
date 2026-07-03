import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { SearchInput } from '../../components/ui/SearchInput'
import { FilterBar, FilterSelect } from '../../components/ui/FilterBar'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Pagination } from '../../components/ui/Pagination'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { useWorkOrders } from '../../hooks/useWorkOrders'
import type { WorkOrder } from '../../types'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'ASSIGNED', label: 'Asignada' },
  { value: 'IN_FIELD', label: 'En campo' },
  { value: 'SUSPENDED', label: 'Suspendida' },
  { value: 'RESOLVED', label: 'Resuelta' },
  { value: 'CLOSED', label: 'Cerrada' },
  { value: 'CANCELLED', label: 'Anulada' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'Todas las prioridades' },
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
]

const columns: Column<WorkOrder>[] = [
  {
    key: 'code',
    header: 'Código',
    render: (row) => (
      <span className="font-mono text-xs font-medium text-primary">{row.code}</span>
    ),
  },
  {
    key: 'type',
    header: 'Título',
    render: (row) => <span className="text-textPrimary">{row.type}</span>,
  },
  {
    key: 'status',
    header: 'Estado',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'priority',
    header: 'Prioridad',
    render: (row) => <PriorityBadge priority={row.priority} />,
  },
  {
    key: 'createdAt',
    header: 'Creada',
    render: (row) => (
      <span className="text-sm text-textSecondary">
        {new Date(row.createdAt).toLocaleDateString('es-PE')}
      </span>
    ),
  },
]

export function WorkOrdersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useWorkOrders({
    search,
    status,
    priority,
    page,
    limit: 20,
  })

  return (
    <div className="page">
      <PageHeader
        description="Gestión y seguimiento de órdenes operativas"
        actions={
          <Button onClick={() => navigate('/work-orders/new')}>
            <Plus size={16} aria-hidden="true" />
            Nueva orden
          </Button>
        }
      />

      <div className="work-orders-filters">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código o título..."
          className="search-input--sm"
        />
        <FilterBar>
          <FilterSelect
            label="Estado"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
          />
          <FilterSelect
            label="Prioridad"
            value={priority}
            onChange={setPriority}
            options={PRIORITY_OPTIONS}
          />
        </FilterBar>
      </div>

      <div className="card">
        {isLoading && <LoadingState variant="overlay" />}
        {isError && <ErrorState onRetry={refetch} />}
        {data && (
          <>
            <DataTable
              columns={columns}
              data={data.data}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => navigate(`/work-orders/${row.id}`)}
              emptyMessage="No se encontraron órdenes de trabajo."
            />
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              limit={data.meta.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
