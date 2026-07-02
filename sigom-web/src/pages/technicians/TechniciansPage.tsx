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
    key: 'name',
    header: 'Nombre',
    render: (row) => <span className="font-medium text-[#151B30]">{row.name}</span>,
  },
  {
    key: 'email',
    header: 'Email',
    render: (row) => <span className="text-sm text-[#72727A]">{row.email}</span>,
  },
  {
    key: 'activeOrdersCount',
    header: 'Órdenes activas',
    render: (row) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          row.activeOrdersCount > 3
            ? 'bg-red-100 text-red-700'
            : row.activeOrdersCount > 0
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        {row.activeOrdersCount}
      </span>
    ),
  },
  {
    key: 'isActive',
    header: 'Estado',
    render: (row) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          row.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        {row.isActive ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
]

export function TechniciansPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useTechnicians({ search, limit: 20 })

  return (
    <div className="p-6">
      <PageHeader
        title="Técnicos"
        description="Personal técnico registrado en el sistema"
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar técnico por nombre o email..."
          className="max-w-sm"
        />
      </div>

      <div className="rounded-xl border border-[#C4D0D8] bg-white shadow-sm">
        {isLoading && <LoadingState rows={8} />}
        {isError && <ErrorState onRetry={refetch} />}
        {data && data.data.length === 0 && (
          <EmptyState
            icon={HardHat}
            title="Sin técnicos"
            description="No hay técnicos registrados en el sistema."
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
