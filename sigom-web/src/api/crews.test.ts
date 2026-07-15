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

import { crewsApi } from './crews'

describe('crewsApi', () => {
  it('uses the list endpoint with pagination params', () => {
    crewsApi.list({ page: 1, limit: 10 })

    expect(client.get).toHaveBeenCalledWith('/crews', { params: { page: 1, limit: 10 } })
  })

  it('uses the expected endpoints for crew reads and writes', () => {
    crewsApi.getById('crew-1')
    crewsApi.create({ name: 'Brigada A' })
    crewsApi.update('crew-1', { isActive: false })
    crewsApi.remove('crew-1')

    expect(client.get).toHaveBeenCalledWith('/crews/crew-1')
    expect(client.post).toHaveBeenCalledWith('/crews', { name: 'Brigada A' })
    expect(client.patch).toHaveBeenCalledWith('/crews/crew-1', { isActive: false })
    expect(client.delete).toHaveBeenCalledWith('/crews/crew-1')
  })
})
