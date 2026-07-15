import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders the title and message', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Eliminar orden"
        message="¿Seguro que querés eliminar la orden OT-1?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )

    expect(screen.getByText('Eliminar orden')).toBeInTheDocument()
    expect(
      screen.getByText('¿Seguro que querés eliminar la orden OT-1?'),
    ).toBeInTheDocument()
  })

  it('uses the provided confirm and cancel labels', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Confirmar"
        message="Acción irreversible"
        confirmLabel="Sí, eliminar"
        cancelLabel="No"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )

    expect(screen.getByRole('button', { name: 'Sí, eliminar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument()
  })

  it('invokes onConfirm and onCancel from the correct buttons', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        title="Confirmar"
        message="Acción"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('includes a close button that calls onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open={false}
        title="Cerrar"
        message="..."
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByLabelText('Cerrar'))
    expect(onCancel).toHaveBeenCalled()
  })
})
