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

import { evidencesApi } from './evidences'

describe('evidencesApi', () => {
  it('uses the list endpoint with pagination and work order filter', () => {
    evidencesApi.list({ page: 1, limit: 10, workOrderId: 'wo-1' })

    expect(client.get).toHaveBeenCalledWith('/evidences', { params: { page: 1, limit: 10, workOrderId: 'wo-1' } })
  })

  it('uses the upload endpoint with multipart form data', () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    evidencesApi.upload('wo-1', file)

    expect(client.post).toHaveBeenCalledWith('/evidences', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  })

  it('uses the expected endpoints for evidence reads and deletes', () => {
    evidencesApi.getById('evidence-1')
    evidencesApi.remove('evidence-1')

    expect(client.get).toHaveBeenCalledWith('/evidences/evidence-1')
    expect(client.delete).toHaveBeenCalledWith('/evidences/evidence-1')
  })
})
