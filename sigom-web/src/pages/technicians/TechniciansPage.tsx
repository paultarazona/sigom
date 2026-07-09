import { useState } from 'react'
import { HardHat } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { SearchInput } from '../../components/ui/SearchInput'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { EmptyState } from '../../components/ui/EmptyState'
import { useTechnicians } from '../../hooks/useTechnicians'
import type { Technician } from '../../types'

const columns: Column<Technician>[] = [
  {
    key: 'firstName',
    header: 'Nombre',
    render: (row) => (
      <span className="technician-name">{`${row.firstName} ${row.lastName}`}</span>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (row) => <span className="technician-email">{row.email}</span>,
  },
  {
    key: '_count',
    header: 'Órdenes activas',
    render: (row) => (
      <span className={`technician-badge ${getAssignedOrdersModifier(row._count?.assignedOrders ?? 0)}`}>
        <span className="technician-badge__dot" aria-hidden="true" />
        {row._count?.assignedOrders ?? 0} activas
      </span>
    ),
  },
  {
    key: 'isActive',
    header: 'Estado',
    render: (row) => (
      <span className={`technician-badge ${row.isActive ? 'technician-badge--active' : 'technician-badge--inactive'}`}>
        <span className="technician-badge__dot" aria-hidden="true" />
        {row.isActive ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
]

function getAssignedOrdersModifier(assignedOrders: number) {
  if (assignedOrders > 3) return 'technician-badge--busy'
  if (assignedOrders > 0) return 'technician-badge--assigned'
  return 'technician-badge--available'
}

export function TechniciansPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useTechnicians({ search, limit: 20 })

  return (
    <div className="page">
      <PageHeader
        description="Personal técnico registrado en el sistema"
      />

      <div className="work-orders-filters">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar técnico por nombre o email..."
          className="search-input--sm"
        />
      </div>

      <div className="card">
        {isLoading && <LoadingState variant="overlay" />}
        {isError && <ErrorState onRetry={refetch} />}
        {data && data.data.length === 0 && (
          <EmptyState
            icon={HardHat}
            title="Sin técnicos"
            description="No hay técnicos registrados en el sistema."
            hint="Contactá al administrador para registrar el personal técnico."
          />
        )}
        {data && data.data.length > 0 && (
          <DataTable
            columns={columns}
            data={data.data}
            keyExtractor={(row) => row.id}
            emptyMessage="No se encontraron técnicos."
          />
        )}
      </div>
    </div>
  )
}
