import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const maintenancePlansApi = vi.hoisted(() => ({
  list: vi.fn(),
}))

vi.mock('../../api/maintenance-plans', () => ({
  maintenancePlansApi,
}))

import { MaintenancePlansPage } from './MaintenancePlansPage'

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('MaintenancePlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    maintenancePlansApi.list.mockReturnValue(new Promise(() => {}))
    render(<MaintenancePlansPage />, { wrapper: createWrapper() })

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows empty state when no plans exist', async () => {
    maintenancePlansApi.list.mockResolvedValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
    })

    render(<MaintenancePlansPage />, { wrapper: createWrapper() })

    await screen.findByText('Sin planes')
  })

  it('shows error state when request fails', async () => {
    maintenancePlansApi.list.mockRejectedValue(new Error('Network error'))

    render(<MaintenancePlansPage />, { wrapper: createWrapper() })

    await screen.findByText('Error al cargar')
  })
})
