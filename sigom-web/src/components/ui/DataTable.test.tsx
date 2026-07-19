import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataTable, type Column } from './DataTable'

interface Row {
  id: string
  name: string
}

const columns: Column<Row>[] = [
  { key: 'name', header: 'Nombre', render: (row) => row.name },
]

describe('DataTable', () => {
  it('shows the supplied empty message when it has no rows', () => {
    render(<DataTable columns={columns} data={[]} keyExtractor={(row) => row.id} emptyMessage="Sin órdenes." />)

    expect(screen.getByText('Sin órdenes.')).toBeInTheDocument()
  })

  it('uses the default empty message and keeps rows non-interactive without a handler', () => {
    const { rerender } = render(<DataTable columns={columns} data={[]} keyExtractor={(row) => row.id} />)

    expect(screen.getByText('No hay datos para mostrar.')).toBeInTheDocument()

    rerender(
      <DataTable
        columns={columns}
        data={[{ id: 'order-1', name: 'Revisar medidor' }]}
        keyExtractor={(row) => row.id}
      />,
    )

    expect(screen.queryByRole('button', { name: /Revisar medidor/ })).not.toBeInTheDocument()
  })

  it('renders rows and calls the row handler when clicked', async () => {
    const onRowClick = vi.fn()
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={[{ id: 'order-1', name: 'Revisar medidor' }]}
        keyExtractor={(row) => row.id}
        onRowClick={onRowClick}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Revisar medidor/ }))

    expect(onRowClick).toHaveBeenCalledWith({ id: 'order-1', name: 'Revisar medidor' })
  })

  it('calls the row handler from the keyboard', async () => {
    const onRowClick = vi.fn()
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={[{ id: 'order-1', name: 'Revisar medidor' }]}
        keyExtractor={(row) => row.id}
        onRowClick={onRowClick}
      />,
    )

    await user.tab()
    await user.keyboard('{Enter}')

    expect(onRowClick).toHaveBeenCalledWith({ id: 'order-1', name: 'Revisar medidor' })
  })
})
