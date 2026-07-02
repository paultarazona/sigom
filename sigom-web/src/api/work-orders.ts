import client from './client'
import type { WorkOrder, PaginatedResponse } from '../types'

export interface WorkOrderFilters {
  page?: number
  limit?: number
  status?: string
  priority?: string
  search?: string
}

export const workOrdersApi = {
  list: (filters: WorkOrderFilters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined),
    )
    return client.get<PaginatedResponse<WorkOrder>>('/work-orders', { params })
  },

  getById: (id: string) =>
    client.get<WorkOrder>(`/work-orders/${id}`),

  create: (data: Partial<WorkOrder>) =>
    client.post<WorkOrder>('/work-orders', data),

  update: (id: string, data: Partial<WorkOrder>) =>
    client.patch<WorkOrder>(`/work-orders/${id}`, data),

  remove: (id: string) =>
    client.delete(`/work-orders/${id}`),

  assign: (id: string, data: { technicianId: string }) =>
    client.patch<WorkOrder>(`/work-orders/${id}/assign`, data),

  start: (id: string) =>
    client.patch<WorkOrder>(`/work-orders/${id}/start`),

  suspend: (id: string, data: { reason: string }) =>
    client.patch<WorkOrder>(`/work-orders/${id}/suspend`, data),

  resolve: (id: string, data: { finalDiagnosis: string; solution: string }) =>
    client.patch<WorkOrder>(`/work-orders/${id}/resolve`, data),

  close: (id: string) =>
    client.patch<WorkOrder>(`/work-orders/${id}/close`),

  cancel: (id: string, data: { reason: string }) =>
    client.patch<WorkOrder>(`/work-orders/${id}/cancel`, data),
}
