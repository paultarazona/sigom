import client from './client'
import type { DashboardSummary, AverageAttentionTime } from '../types'

export const reportsApi = {
  summary: () =>
    client.get<{ data: DashboardSummary }>('/reports/summary'),

  averageAttentionTime: () =>
    client.get<{ data: AverageAttentionTime }>('/reports/average-attention-time'),

  workOrdersByZone: () =>
    client.get('/reports/work-orders-by-zone'),

  technicianWorkload: () =>
    client.get('/reports/technician-workload'),
}
