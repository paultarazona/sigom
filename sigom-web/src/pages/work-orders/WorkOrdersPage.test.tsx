import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

const useWorkOrders = vi.hoisted(() => vi.fn())
const useCreateWorkOrder = vi.hoisted(() => vi.fn())

vi.mock('../../hooks/useWorkOrders', () => ({
  useWorkOrders,
  useCreateWorkOrder,
}))

import { WorkOrdersPage } from './WorkOrdersPage'

function createWrapper() {
  const qc = new QueryClient()
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter>
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </MemoryRouter>
    )
  }
}

describe('WorkOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCreateWorkOrder.mockReturnValue({ mutate: vi.fn(), isPending: false })
  })

  it('shows loading state initially', () => {
    useWorkOrders.mockReturnValue({ data: undefined, isLoading: true, isError: false })

    render(<WorkOrdersPage />, { wrapper: createWrapper() })

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error state when request fails', () => {
    useWorkOrders.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })

    render(<WorkOrdersPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Error al cargar')).toBeInTheDocument()
  })

  it('renders the new order button', () => {
    useWorkOrders.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
      isLoading: false,
      isError: false,
    })

    render(<WorkOrdersPage />, { wrapper: createWrapper() })

    expect(screen.getByRole('button', { name: /Nueva orden/ })).toBeInTheDocument()
  })

  it('renders the filter bar with status and priority selects', () => {
    useWorkOrders.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
      isLoading: false,
      isError: false,
    })

    render(<WorkOrdersPage />, { wrapper: createWrapper() })

    expect(screen.getAllByText('Estado').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Prioridad').length).toBeGreaterThan(0)
  })
})
