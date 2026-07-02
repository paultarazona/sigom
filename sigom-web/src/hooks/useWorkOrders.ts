import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workOrdersApi, type WorkOrderFilters } from '../api/work-orders'
import type { WorkOrder } from '../types'

export function useWorkOrders(filters: WorkOrderFilters = {}) {
  return useQuery({
    queryKey: ['work-orders', filters],
    queryFn: () => workOrdersApi.list(filters).then((r) => r.data),
  })
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ['work-orders', id],
    queryFn: () => workOrdersApi.getById(id).then((r) => r.data),
    enabled: Boolean(id),
  })
}

export function useCreateWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<WorkOrder>) => workOrdersApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}

export function useUpdateWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkOrder> }) =>
      workOrdersApi.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}

export function useDeleteWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workOrdersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}

export function useAssignWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { technicianId: string } }) =>
      workOrdersApi.assign(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}

export function useStartWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workOrdersApi.start(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}

export function useSuspendWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reason: string } }) =>
      workOrdersApi.suspend(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}

export function useResolveWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { finalDiagnosis: string; solution: string } }) =>
      workOrdersApi.resolve(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}

export function useCloseWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workOrdersApi.close(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}

export function useCancelWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reason: string } }) =>
      workOrdersApi.cancel(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}
