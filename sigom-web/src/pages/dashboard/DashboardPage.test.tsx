import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

const useDashboardSummary = vi.hoisted(() => vi.fn())
const useAverageAttentionTime = vi.hoisted(() => vi.fn())
const useWorkOrders = vi.hoisted(() => vi.fn())

vi.mock('../../hooks/useReports', () => ({
  useDashboardSummary,
  useAverageAttentionTime,
}))

vi.mock('../../hooks/useWorkOrders', () => ({
  useWorkOrders,
}))

import { DashboardPage } from './DashboardPage'

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

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    useDashboardSummary.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    useAverageAttentionTime.mockReturnValue({ data: undefined })
    useWorkOrders.mockReturnValue({ data: undefined, isLoading: true, isError: false })

    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
  })

  it('shows error state when summary request fails', () => {
    useDashboardSummary.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })
    useAverageAttentionTime.mockReturnValue({ data: undefined })
    useWorkOrders.mockReturnValue({ data: undefined, isLoading: false, isError: false })

    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByText('No se pudo cargar el resumen.')).toBeInTheDocument()
  })

  it('shows stat cards when data loads', () => {
    useDashboardSummary.mockReturnValue({
      data: { total: 10, pending: 3, assigned: 2, inField: 1 },
      isLoading: false,
      isError: false,
    })
    useAverageAttentionTime.mockReturnValue({
      data: { averageHours: 2.5 },
    })
    useWorkOrders.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } },
      isLoading: false,
      isError: false,
    })

    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Órdenes pendientes')).toBeInTheDocument()
    expect(screen.getByText('Asignadas')).toBeInTheDocument()
    expect(screen.getByText('En campo')).toBeInTheDocument()
  })

  it('shows recent work orders section', () => {
    useDashboardSummary.mockReturnValue({
      data: { total: 10, pending: 3, assigned: 2, inField: 1 },
      isLoading: false,
      isError: false,
    })
    useAverageAttentionTime.mockReturnValue({ data: { averageHours: 2.5 } })
    useWorkOrders.mockReturnValue({
      data: {
        data: [{ id: 'wo-1', code: 'OT-001', type: 'Revisar medidor', status: 'PENDING', priority: 'HIGH', createdAt: '2026-01-01' }],
        meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
      },
      isLoading: false,
      isError: false,
    })

    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Órdenes recientes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ver todas/ })).toBeInTheDocument()
  })
})
