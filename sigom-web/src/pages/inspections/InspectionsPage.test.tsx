import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const inspectionsApi = vi.hoisted(() => ({
  list: vi.fn(),
}))

vi.mock('../../api/inspections', () => ({
  inspectionsApi,
}))

import { InspectionsPage } from './InspectionsPage'

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('InspectionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    inspectionsApi.list.mockReturnValue(new Promise(() => {}))
    render(<InspectionsPage />, { wrapper: createWrapper() })

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows empty state when no inspections exist', async () => {
    inspectionsApi.list.mockResolvedValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
    })

    render(<InspectionsPage />, { wrapper: createWrapper() })

    await screen.findByText('No hay inspecciones registradas.')
  })

  it('shows error state when request fails', async () => {
    inspectionsApi.list.mockRejectedValue(new Error('Network error'))

    render(<InspectionsPage />, { wrapper: createWrapper() })

    await screen.findByText('Error al cargar')
  })
})
