import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const crewsApi = vi.hoisted(() => ({
  list: vi.fn(),
}))

vi.mock('../../api/crews', () => ({
  crewsApi,
}))

import { CrewsPage } from './CrewsPage'

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('CrewsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    crewsApi.list.mockReturnValue(new Promise(() => {}))
    render(<CrewsPage />, { wrapper: createWrapper() })

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows empty state when no crews exist', async () => {
    crewsApi.list.mockResolvedValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
    })

    render(<CrewsPage />, { wrapper: createWrapper() })

    await screen.findByText('Sin cuadrillas')
    expect(screen.getByText('No hay cuadrillas registradas aún.')).toBeInTheDocument()
  })

  it('shows error state when request fails', async () => {
    crewsApi.list.mockRejectedValue(new Error('Network error'))

    render(<CrewsPage />, { wrapper: createWrapper() })

    await screen.findByText('Error al cargar')
  })
})
