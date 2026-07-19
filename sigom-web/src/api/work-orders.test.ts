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

import { workOrdersApi } from './work-orders'

describe('workOrdersApi', () => {
  it('omits empty list filters from the request', () => {
    workOrdersApi.list({ page: 2, search: '', status: undefined, priority: 'HIGH' })

    expect(client.get).toHaveBeenCalledWith('/work-orders', { params: { page: 2, priority: 'HIGH' } })
  })

  it('uses the assign action endpoint with its payload', () => {
    workOrdersApi.assign('order-1', { technicianId: 'technician-1' })

    expect(client.patch).toHaveBeenCalledWith('/work-orders/order-1/assign', { technicianId: 'technician-1' })
  })

  it('uses the action endpoint without a body when starting an order', () => {
    workOrdersApi.start('order-1')

    expect(client.patch).toHaveBeenCalledWith('/work-orders/order-1/start')
  })

  it('uses the expected endpoints for work order reads and writes', () => {
    workOrdersApi.getById('order-1')
    workOrdersApi.create({ type: 'Revisar medidor' })
    workOrdersApi.update('order-1', { priority: 'CRITICAL' })
    workOrdersApi.remove('order-1')
    workOrdersApi.suspend('order-1', { reason: 'Lluvia' })
    workOrdersApi.resolve('order-1', { finalDiagnosis: 'Fuga', solutionApplied: 'Reparada' })
    workOrdersApi.close('order-1')
    workOrdersApi.cancel('order-1', { reason: 'Duplicada' })

    expect(client.get).toHaveBeenCalledWith('/work-orders/order-1')
    expect(client.post).toHaveBeenCalledWith('/work-orders', { type: 'Revisar medidor' })
    expect(client.patch).toHaveBeenCalledWith('/work-orders/order-1', { priority: 'CRITICAL' })
    expect(client.delete).toHaveBeenCalledWith('/work-orders/order-1')
    expect(client.patch).toHaveBeenCalledWith('/work-orders/order-1/suspend', { reason: 'Lluvia' })
    expect(client.patch).toHaveBeenCalledWith('/work-orders/order-1/resolve', {
      finalDiagnosis: 'Fuga',
      solutionApplied: 'Reparada',
    })
    expect(client.patch).toHaveBeenCalledWith('/work-orders/order-1/close')
    expect(client.patch).toHaveBeenCalledWith('/work-orders/order-1/cancel', { reason: 'Duplicada' })
  })
})
