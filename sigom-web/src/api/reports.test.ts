import { describe, expect, it, vi } from 'vitest'

const client = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('./client', () => ({
  default: client,
}))

import { reportsApi } from './reports'

describe('reportsApi', () => {
  it('uses the expected endpoints for dashboard and analytics reports', () => {
    reportsApi.summary()
    reportsApi.averageAttentionTime()
    reportsApi.workOrdersByZone()
    reportsApi.technicianWorkload()

    expect(client.get).toHaveBeenCalledWith('/reports/summary')
    expect(client.get).toHaveBeenCalledWith('/reports/average-attention-time')
    expect(client.get).toHaveBeenCalledWith('/reports/work-orders-by-zone')
    expect(client.get).toHaveBeenCalledWith('/reports/technician-workload')
  })
})
