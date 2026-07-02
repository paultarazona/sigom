import client from './client'
import type { Inspection, PaginatedResponse } from '../types'

export const inspectionsApi = {
  list: (params: { page?: number; limit?: number; workOrderId?: string } = {}) =>
    client.get<PaginatedResponse<Inspection>>('/inspections', { params }),

  getById: (id: string) =>
    client.get<Inspection>(`/inspections/${id}`),

  create: (data: Partial<Inspection>) =>
    client.post<Inspection>('/inspections', data),
}
