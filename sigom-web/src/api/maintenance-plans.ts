import client from './client'
import type { MaintenancePlan, PaginatedResponse } from '../types'

export const maintenancePlansApi = {
  list: (params: { page?: number; limit?: number; status?: string } = {}) =>
    client.get<PaginatedResponse<MaintenancePlan>>('/maintenance-plans', { params }),

  getById: (id: string) =>
    client.get<MaintenancePlan>(`/maintenance-plans/${id}`),

  create: (data: Partial<MaintenancePlan>) =>
    client.post<MaintenancePlan>('/maintenance-plans', data),

  update: (id: string, data: Partial<MaintenancePlan>) =>
    client.patch<MaintenancePlan>(`/maintenance-plans/${id}`, data),

  remove: (id: string) =>
    client.delete(`/maintenance-plans/${id}`),
}
