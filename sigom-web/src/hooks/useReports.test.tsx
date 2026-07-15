import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const reportsApi = vi.hoisted(() => ({
  summary: vi.fn(),
  averageAttentionTime: vi.fn(),
  workOrdersByZone: vi.fn(),
  technicianWorkload: vi.fn(),
}))

vi.mock('../api/reports', () => ({
  reportsApi,
}))

import {
  useDashboardSummary,
  useAverageAttentionTime,
  useWorkOrdersByZone,
  useTechnicianWorkload,
} from './useReports'

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('useDashboardSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches dashboard summary', async () => {
    reportsApi.summary.mockResolvedValue({
      data: { data: { totalOrders: 10, pendingOrders: 3 } },
    })

    const { result } = renderHook(() => useDashboardSummary(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reportsApi.summary).toHaveBeenCalled()
    expect(result.current.data).toEqual({ totalOrders: 10, pendingOrders: 3 })
  })
})

describe('useAverageAttentionTime', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches average attention time', async () => {
    reportsApi.averageAttentionTime.mockResolvedValue({
      data: { data: { averageHours: 2.5 } },
    })

    const { result } = renderHook(() => useAverageAttentionTime(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reportsApi.averageAttentionTime).toHaveBeenCalled()
    expect(result.current.data).toEqual({ averageHours: 2.5 })
  })
})

describe('useWorkOrdersByZone', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches work orders by zone', async () => {
    reportsApi.workOrdersByZone.mockResolvedValue({
      data: { data: [{ zone: 'Zona 1', count: 5 }] },
    })

    const { result } = renderHook(() => useWorkOrdersByZone(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reportsApi.workOrdersByZone).toHaveBeenCalled()
  })
})

describe('useTechnicianWorkload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches technician workload', async () => {
    reportsApi.technicianWorkload.mockResolvedValue({
      data: { data: [{ technicianId: 'tech-1', orders: 8 }] },
    })

    const { result } = renderHook(() => useTechnicianWorkload(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reportsApi.technicianWorkload).toHaveBeenCalled()
  })
})
