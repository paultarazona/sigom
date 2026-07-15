import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const useDashboardSummary = vi.hoisted(() => vi.fn())
const useAverageAttentionTime = vi.hoisted(() => vi.fn())

vi.mock('../../hooks/useReports', () => ({
  useDashboardSummary,
  useAverageAttentionTime,
}))

import { ReportsPage } from './ReportsPage'

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    useDashboardSummary.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    useAverageAttentionTime.mockReturnValue({ data: undefined, isLoading: true })

    render(<ReportsPage />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
      ),
    })

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error state when request fails', () => {
    useDashboardSummary.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })
    useAverageAttentionTime.mockReturnValue({ data: undefined })

    render(<ReportsPage />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
      ),
    })

    expect(screen.getByText('Error al cargar')).toBeInTheDocument()
  })

  it('shows stat cards when data loads', () => {
    useDashboardSummary.mockReturnValue({
      data: { total: 10, pending: 3, assigned: 2, inField: 1 },
      isLoading: false,
      isError: false,
    })
    useAverageAttentionTime.mockReturnValue({
      data: { averageHours: 2.5 },
      isLoading: false,
    })

    render(<ReportsPage />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
      ),
    })

    expect(screen.getByText('Órdenes pendientes')).toBeInTheDocument()
    expect(screen.getByText('Asignadas')).toBeInTheDocument()
    expect(screen.getByText('En campo')).toBeInTheDocument()
    expect(screen.getByText('2.5h')).toBeInTheDocument()
  })
})
