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

import { maintenancePlansApi } from './maintenance-plans'

describe('maintenancePlansApi', () => {
  it('uses the list endpoint with pagination and status filter', () => {
    maintenancePlansApi.list({ page: 1, limit: 20, status: 'ACTIVE' })

    expect(client.get).toHaveBeenCalledWith('/maintenance-plans', { params: { page: 1, limit: 20, status: 'ACTIVE' } })
  })

  it('uses the expected endpoints for maintenance plan reads and writes', () => {
    maintenancePlansApi.getById('plan-1')
    maintenancePlansApi.create({ frequency: 'MONTHLY' })
    maintenancePlansApi.update('plan-1', { status: 'INACTIVE' })
    maintenancePlansApi.remove('plan-1')

    expect(client.get).toHaveBeenCalledWith('/maintenance-plans/plan-1')
    expect(client.post).toHaveBeenCalledWith('/maintenance-plans', { frequency: 'MONTHLY' })
    expect(client.patch).toHaveBeenCalledWith('/maintenance-plans/plan-1', { status: 'INACTIVE' })
    expect(client.delete).toHaveBeenCalledWith('/maintenance-plans/plan-1')
  })
})
