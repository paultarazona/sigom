import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const useTechnicians = vi.hoisted(() => vi.fn())

vi.mock('../../hooks/useTechnicians', () => ({
  useTechnicians,
}))

import { TechniciansPage } from './TechniciansPage'

describe('TechniciansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    useTechnicians.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    render(<TechniciansPage />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
      ),
    })

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows empty state when no technicians exist', () => {
    useTechnicians.mockReturnValue({
      data: { data: [], meta: { total: 0 } },
      isLoading: false,
      isError: false,
    })

    render(<TechniciansPage />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
      ),
    })

    expect(screen.getByText('Sin técnicos')).toBeInTheDocument()
  })

  it('shows error state when request fails', () => {
    useTechnicians.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })

    render(<TechniciansPage />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
      ),
    })

    expect(screen.getByText('Error al cargar')).toBeInTheDocument()
  })
})
