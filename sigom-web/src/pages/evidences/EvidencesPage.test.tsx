import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const evidencesApi = vi.hoisted(() => ({
  list: vi.fn(),
}))

vi.mock('../../api/evidences', () => ({
  evidencesApi,
}))

import { EvidencesPage } from './EvidencesPage'

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('EvidencesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    evidencesApi.list.mockReturnValue(new Promise(() => {}))
    render(<EvidencesPage />, { wrapper: createWrapper() })

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows empty state when no evidences exist', async () => {
    evidencesApi.list.mockResolvedValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
    })

    render(<EvidencesPage />, { wrapper: createWrapper() })

    await screen.findByText('Sin evidencias')
  })

  it('shows error state when request fails', async () => {
    evidencesApi.list.mockRejectedValue(new Error('Network error'))

    render(<EvidencesPage />, { wrapper: createWrapper() })

    await screen.findByText('Error al cargar')
  })
})
