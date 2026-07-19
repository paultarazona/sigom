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

import { techniciansApi } from './technicians'

describe('techniciansApi', () => {
  it('uses the list endpoint with pagination and search params', () => {
    techniciansApi.list({ page: 2, limit: 10, search: 'Juan' })

    expect(client.get).toHaveBeenCalledWith('/technicians', { params: { page: 2, limit: 10, search: 'Juan' } })
  })

  it('uses the list endpoint without params when called empty', () => {
    techniciansApi.list()

    expect(client.get).toHaveBeenCalledWith('/technicians', { params: {} })
  })

  it('uses the expected endpoints for technician reads and writes', () => {
    techniciansApi.getById('tech-1')
    techniciansApi.create({ name: 'Juan' })
    techniciansApi.update('tech-1', { isActive: false })
    techniciansApi.remove('tech-1')

    expect(client.get).toHaveBeenCalledWith('/technicians/tech-1')
    expect(client.post).toHaveBeenCalledWith('/technicians', { name: 'Juan' })
    expect(client.patch).toHaveBeenCalledWith('/technicians/tech-1', { isActive: false })
    expect(client.delete).toHaveBeenCalledWith('/technicians/tech-1')
  })
})
