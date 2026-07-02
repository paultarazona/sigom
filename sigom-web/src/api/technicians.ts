import client from './client'
import type { Technician, PaginatedResponse } from '../types'

export const techniciansApi = {
  list: (params: { page?: number; limit?: number; search?: string } = {}) =>
    client.get<PaginatedResponse<Technician>>('/technicians', { params }),

  getById: (id: string) =>
    client.get<Technician>(`/technicians/${id}`),

  create: (data: Partial<Technician>) =>
    client.post<Technician>('/technicians', data),

  update: (id: string, data: Partial<Technician>) =>
    client.patch<Technician>(`/technicians/${id}`, data),

  remove: (id: string) =>
    client.delete(`/technicians/${id}`),
}
