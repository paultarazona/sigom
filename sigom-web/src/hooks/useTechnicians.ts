import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { techniciansApi } from '../api/technicians'
import type { Technician } from '../types'

export function useTechnicians(params: { page?: number; limit?: number; search?: string } = {}) {
  return useQuery({
    queryKey: ['technicians', params],
    queryFn: () => techniciansApi.list(params).then((r) => r.data),
  })
}

export function useTechnician(id: string) {
  return useQuery({
    queryKey: ['technicians', id],
    queryFn: () => techniciansApi.getById(id).then((r) => r.data),
    enabled: Boolean(id),
  })
}

export function useCreateTechnician() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Technician>) =>
      techniciansApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['technicians'] }),
  })
}

export function useUpdateTechnician() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Technician> }) =>
      techniciansApi.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['technicians'] }),
  })
}
