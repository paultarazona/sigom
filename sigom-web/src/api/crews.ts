import client from './client'
import type { Crew, PaginatedResponse } from '../types'

export const crewsApi = {
  list: (params: { page?: number; limit?: number } = {}) =>
    client.get<PaginatedResponse<Crew>>('/crews', { params }),

  getById: (id: string) =>
    client.get<Crew>(`/crews/${id}`),

  create: (data: Partial<Crew>) =>
    client.post<Crew>('/crews', data),

  update: (id: string, data: Partial<Crew>) =>
    client.patch<Crew>(`/crews/${id}`, data),

  remove: (id: string) =>
    client.delete(`/crews/${id}`),
}
