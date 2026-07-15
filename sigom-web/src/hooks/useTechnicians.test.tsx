import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const techniciansApi = vi.hoisted(() => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}))

vi.mock('../api/technicians', () => ({
  techniciansApi,
}))

import { useTechnicians, useTechnician, useCreateTechnician, useUpdateTechnician } from './useTechnicians'

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('useTechnicians', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches technicians list with params', async () => {
    techniciansApi.list.mockResolvedValue({
      data: { data: [{ id: 'tech-1', name: 'Juan' }], meta: { total: 1 } },
    })

    const { result } = renderHook(() => useTechnicians({ page: 1 }), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(techniciansApi.list).toHaveBeenCalledWith({ page: 1 })
    expect(result.current.data).toEqual({ data: [{ id: 'tech-1', name: 'Juan' }], meta: { total: 1 } })
  })
})

describe('useTechnician', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches technician by id', async () => {
    techniciansApi.getById.mockResolvedValue({
      data: { id: 'tech-1', name: 'Juan' },
    })

    const { result } = renderHook(() => useTechnician('tech-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(techniciansApi.getById).toHaveBeenCalledWith('tech-1')
    expect(result.current.data).toEqual({ id: 'tech-1', name: 'Juan' })
  })

  it('does not fetch when id is empty', () => {
    renderHook(() => useTechnician(''), { wrapper: createWrapper() })

    expect(techniciansApi.getById).not.toHaveBeenCalled()
  })
})

describe('useCreateTechnician', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates technician and invalidates queries', async () => {
    techniciansApi.create.mockResolvedValue({
      data: { id: 'tech-2', name: 'María' },
    })

    const { result } = renderHook(() => useCreateTechnician(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ name: 'María' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(techniciansApi.create).toHaveBeenCalledWith({ name: 'María' })
  })
})

describe('useUpdateTechnician', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates technician and invalidates queries', async () => {
    techniciansApi.update.mockResolvedValue({
      data: { id: 'tech-1', isActive: false },
    })

    const { result } = renderHook(() => useUpdateTechnician(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ id: 'tech-1', data: { isActive: false } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(techniciansApi.update).toHaveBeenCalledWith('tech-1', { isActive: false })
  })
})
