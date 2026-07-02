import client from './client'
import type { Evidence, PaginatedResponse } from '../types'

export const evidencesApi = {
  list: (params: { page?: number; limit?: number; workOrderId?: string } = {}) =>
    client.get<PaginatedResponse<Evidence>>('/evidences', { params }),

  getById: (id: string) =>
    client.get<Evidence>(`/evidences/${id}`),

  upload: (workOrderId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('workOrderId', workOrderId)
    return client.post<Evidence>('/evidences', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  remove: (id: string) =>
    client.delete(`/evidences/${id}`),
}
