import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateWorkOrderModal } from './CreateWorkOrderModal'

const mutate = vi.fn()

vi.mock('../../hooks/useWorkOrders', () => ({
  useCreateWorkOrder: () => ({ mutate, isPending: false }),
}))

describe('CreateWorkOrderModal', () => {
  beforeEach(() => mutate.mockReset())

  it('submits the completed form and closes after a successful creation', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<CreateWorkOrderModal open onClose={onClose} />)

    await user.type(screen.getByLabelText(/Título/), 'Fuga en medidor')
    await user.type(screen.getByLabelText(/Descripción/), 'Verificar conexión')
    await user.selectOptions(screen.getByLabelText('Prioridad'), 'HIGH')
    await user.type(screen.getByLabelText(/Zona/), 'zone-1')
    await user.click(screen.getByRole('button', { name: 'Crear orden' }))

    expect(mutate).toHaveBeenCalledWith(
      {
        title: 'Fuga en medidor',
        description: 'Verificar conexión',
        priority: 'HIGH',
        status: 'PENDING',
        zoneId: 'zone-1',
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )

    const options = mutate.mock.calls[0][1] as { onSuccess: () => void }
    options.onSuccess()

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not submit an incomplete form', async () => {
    const user = userEvent.setup()
    render(<CreateWorkOrderModal open onClose={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Crear orden' }))

    expect(mutate).not.toHaveBeenCalled()
  })
})
