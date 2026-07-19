import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

const useWorkOrder = vi.hoisted(() => vi.fn())
const useAssignWorkOrder = vi.hoisted(() => vi.fn())
const useStartWorkOrder = vi.hoisted(() => vi.fn())
const useSuspendWorkOrder = vi.hoisted(() => vi.fn())
const useResolveWorkOrder = vi.hoisted(() => vi.fn())
const useCloseWorkOrder = vi.hoisted(() => vi.fn())
const useCancelWorkOrder = vi.hoisted(() => vi.fn())

vi.mock('../../hooks/useWorkOrders', () => ({
  useWorkOrder,
  useAssignWorkOrder,
  useStartWorkOrder,
  useSuspendWorkOrder,
  useResolveWorkOrder,
  useCloseWorkOrder,
  useCancelWorkOrder,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: 'wo-1' }),
    useNavigate: () => vi.fn(),
  }
})

import { WorkOrderDetailPage } from './WorkOrderDetailPage'

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

function mockAllMutations() {
  const idle = () => ({ mutate: vi.fn(), isPending: false })
  useAssignWorkOrder.mockReturnValue(idle())
  useStartWorkOrder.mockReturnValue(idle())
  useSuspendWorkOrder.mockReturnValue(idle())
  useResolveWorkOrder.mockReturnValue(idle())
  useCloseWorkOrder.mockReturnValue(idle())
  useCancelWorkOrder.mockReturnValue(idle())
}

describe('WorkOrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAllMutations()
  })

  it('shows loading state initially', () => {
    useWorkOrder.mockReturnValue({ data: undefined, isLoading: true, isError: false })

    render(<WorkOrderDetailPage />, { wrapper: createWrapper() })

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error state when request fails', () => {
    useWorkOrder.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })

    render(<WorkOrderDetailPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Error al cargar')).toBeInTheDocument()
  })

  it('renders the work order details when loaded', () => {
    useWorkOrder.mockReturnValue({
      data: {
        id: 'wo-1',
        code: 'OT-2026-000001',
        type: 'Revisar medidor',
        status: 'PENDING',
        priority: 'HIGH',
        initialObservation: 'Medidor dañado',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isLoading: false,
      isError: false,
    })

    render(<WorkOrderDetailPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Revisar medidor')).toBeInTheDocument()
    expect(screen.getByText('Código: OT-2026-000001')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
    expect(screen.getByText('Medidor dañado')).toBeInTheDocument()
  })

  it('shows assign action for PENDING orders', () => {
    useWorkOrder.mockReturnValue({
      data: {
        id: 'wo-1',
        code: 'OT-001',
        type: 'Revisar',
        status: 'PENDING',
        priority: 'LOW',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isLoading: false,
      isError: false,
    })

    render(<WorkOrderDetailPage />, { wrapper: createWrapper() })

    expect(screen.getByRole('button', { name: 'Asignar técnico' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar orden' })).toBeInTheDocument()
  })

  it('shows resolve action for IN_FIELD orders', () => {
    useWorkOrder.mockReturnValue({
      data: {
        id: 'wo-1',
        code: 'OT-001',
        type: 'Revisar',
        status: 'IN_FIELD',
        priority: 'LOW',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isLoading: false,
      isError: false,
    })

    render(<WorkOrderDetailPage />, { wrapper: createWrapper() })

    expect(screen.getByRole('button', { name: 'Suspender' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resolver' })).toBeInTheDocument()
  })

  it('does not show actions for CLOSED orders', () => {
    useWorkOrder.mockReturnValue({
      data: {
        id: 'wo-1',
        code: 'OT-001',
        type: 'Revisar',
        status: 'CLOSED',
        priority: 'LOW',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isLoading: false,
      isError: false,
    })

    render(<WorkOrderDetailPage />, { wrapper: createWrapper() })

    expect(screen.queryByRole('button', { name: 'Asignar técnico' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resolver' })).not.toBeInTheDocument()
  })
})
