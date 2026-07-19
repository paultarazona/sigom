import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const workOrdersApi = vi.hoisted(() => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  assign: vi.fn(),
  start: vi.fn(),
  suspend: vi.fn(),
  resolve: vi.fn(),
  close: vi.fn(),
  cancel: vi.fn(),
}))

vi.mock('../api/work-orders', () => ({
  workOrdersApi,
}))

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('../lib/toast', () => ({
  toast,
}))

import {
  useWorkOrders,
  useWorkOrder,
  useCreateWorkOrder,
  useUpdateWorkOrder,
  useDeleteWorkOrder,
  useAssignWorkOrder,
  useStartWorkOrder,
  useSuspendWorkOrder,
  useResolveWorkOrder,
  useCloseWorkOrder,
  useCancelWorkOrder,
} from './useWorkOrders'

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('useWorkOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches work orders list with filters', async () => {
    workOrdersApi.list.mockResolvedValue({
      data: { data: [{ id: 'wo-1' }], meta: { total: 1 } },
    })

    const { result } = renderHook(() => useWorkOrders({ status: 'PENDING' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(workOrdersApi.list).toHaveBeenCalledWith({ status: 'PENDING' })
  })
})

describe('useWorkOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches work order by id', async () => {
    workOrdersApi.getById.mockResolvedValue({
      data: { id: 'wo-1', type: 'Correctiva' },
    })

    const { result } = renderHook(() => useWorkOrder('wo-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(workOrdersApi.getById).toHaveBeenCalledWith('wo-1')
  })

  it('does not fetch when id is empty', () => {
    renderHook(() => useWorkOrder(''), { wrapper: createWrapper() })

    expect(workOrdersApi.getById).not.toHaveBeenCalled()
  })
})

describe('useCreateWorkOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates work order and shows success toast', async () => {
    workOrdersApi.create.mockResolvedValue({
      data: { id: 'wo-2', type: 'Preventiva' },
    })

    const { result } = renderHook(() => useCreateWorkOrder(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ type: 'Preventiva' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(workOrdersApi.create).toHaveBeenCalledWith({ type: 'Preventiva' })
    expect(toast.success).toHaveBeenCalledWith('Orden creada correctamente')
  })

  it('shows error toast on failure', async () => {
    workOrdersApi.create.mockRejectedValue(new Error('Error'))

    const { result } = renderHook(() => useCreateWorkOrder(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ type: 'Preventiva' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('Error al crear la orden')
  })
})

describe('useUpdateWorkOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates work order', async () => {
    workOrdersApi.update.mockResolvedValue({
      data: { id: 'wo-1', priority: 'HIGH' },
    })

    const { result } = renderHook(() => useUpdateWorkOrder(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ id: 'wo-1', data: { priority: 'HIGH' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(workOrdersApi.update).toHaveBeenCalledWith('wo-1', { priority: 'HIGH' })
  })
})

describe('useDeleteWorkOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes work order', async () => {
    workOrdersApi.remove.mockResolvedValue({ data: {} })

    const { result } = renderHook(() => useDeleteWorkOrder(), {
      wrapper: createWrapper(),
    })

    result.current.mutate('wo-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(workOrdersApi.remove).toHaveBeenCalledWith('wo-1')
  })
})

describe('useAssignWorkOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('assigns work order to technician', async () => {
    workOrdersApi.assign.mockResolvedValue({
      data: { id: 'wo-1', assignedTechnicianId: 'tech-1' },
    })

    const { result } = renderHook(() => useAssignWorkOrder(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ id: 'wo-1', data: { technicianId: 'tech-1' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(workOrdersApi.assign).toHaveBeenCalledWith('wo-1', { technicianId: 'tech-1' })
  })
})

describe('useStartWorkOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts work order', async () => {
    workOrdersApi.start.mockResolvedValue({ data: { id: 'wo-1', status: 'IN_FIELD' } })

    const { result } = renderHook(() => useStartWorkOrder(), {
      wrapper: createWrapper(),
    })

    result.current.mutate('wo-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(workOrdersApi.start).toHaveBeenCalledWith('wo-1')
  })
})

describe('useSuspendWorkOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('suspends work order', async () => {
    workOrdersApi.suspend.mockResolvedValue({ data: { id: 'wo-1', status: 'SUSPENDED' } })

    const { result } = renderHook(() => useSuspendWorkOrder(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ id: 'wo-1', data: { reason: 'Lluvia' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(workOrdersApi.suspend).toHaveBeenCalledWith('wo-1', { reason: 'Lluvia' })
  })
})

describe('useResolveWorkOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves work order', async () => {
    workOrdersApi.resolve.mockResolvedValue({
      data: { id: 'wo-1', status: 'RESOLVED' },
    })

    const { result } = renderHook(() => useResolveWorkOrder(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      id: 'wo-1',
      data: { finalDiagnosis: 'Fuga', solutionApplied: 'Reparada' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(workOrdersApi.resolve).toHaveBeenCalledWith('wo-1', {
      finalDiagnosis: 'Fuga',
      solutionApplied: 'Reparada',
    })
  })
})

describe('useCloseWorkOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('closes work order', async () => {
    workOrdersApi.close.mockResolvedValue({ data: { id: 'wo-1', status: 'CLOSED' } })

    const { result } = renderHook(() => useCloseWorkOrder(), {
      wrapper: createWrapper(),
    })

    result.current.mutate('wo-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(workOrdersApi.close).toHaveBeenCalledWith('wo-1')
  })
})

describe('useCancelWorkOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cancels work order', async () => {
    workOrdersApi.cancel.mockResolvedValue({ data: { id: 'wo-1', status: 'CANCELLED' } })

    const { result } = renderHook(() => useCancelWorkOrder(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ id: 'wo-1', data: { reason: 'Duplicada' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(workOrdersApi.cancel).toHaveBeenCalledWith('wo-1', { reason: 'Duplicada' })
  })
})
