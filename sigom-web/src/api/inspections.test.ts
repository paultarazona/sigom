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

import { inspectionsApi } from './inspections'

describe('inspectionsApi', () => {
  it('uses the list endpoint with pagination and work order filter', () => {
    inspectionsApi.list({ page: 1, limit: 10, workOrderId: 'wo-1' })

    expect(client.get).toHaveBeenCalledWith('/inspections', { params: { page: 1, limit: 10, workOrderId: 'wo-1' } })
  })

  it('uses the expected endpoints for inspection reads and creates', () => {
    inspectionsApi.getById('inspection-1')
    inspectionsApi.create({ findings: 'Normal', result: 'PASS' })

    expect(client.get).toHaveBeenCalledWith('/inspections/inspection-1')
    expect(client.post).toHaveBeenCalledWith('/inspections', { findings: 'Normal', result: 'PASS' })
  })
})
