import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/reports'

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => reportsApi.summary().then((r) => r.data.data),
    staleTime: 60_000,
  })
}

export function useAverageAttentionTime() {
  return useQuery({
    queryKey: ['reports', 'average-attention-time'],
    queryFn: () => reportsApi.averageAttentionTime().then((r) => r.data.data),
    staleTime: 60_000,
  })
}

export function useWorkOrdersByZone() {
  return useQuery({
    queryKey: ['reports', 'by-zone'],
    queryFn: () => reportsApi.workOrdersByZone().then((r) => r.data),
  })
}

export function useTechnicianWorkload() {
  return useQuery({
    queryKey: ['reports', 'technician-workload'],
    queryFn: () => reportsApi.technicianWorkload().then((r) => r.data),
  })
}
