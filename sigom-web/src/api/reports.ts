import client from './client'
import type { DashboardSummary } from '../types'

export const reportsApi = {
  summary: () =>
    client.get<DashboardSummary>('/reports/summary'),

  workOrdersByZone: () =>
    client.get('/reports/work-orders-by-zone'),

  technicianWorkload: () =>
    client.get('/reports/technician-workload'),
}
