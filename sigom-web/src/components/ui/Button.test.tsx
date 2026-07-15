import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders with the primary variant by default', () => {
    render(<Button>Guardar</Button>)

    const btn = screen.getByRole('button', { name: 'Guardar' })
    expect(btn).toHaveClass('btn')
    expect(btn).toHaveClass('btn--primary')
  })

  it('applies the requested variant class', () => {
    const { rerender } = render(<Button variant="secondary">Cancelar</Button>)
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveClass('btn--secondary')

    rerender(<Button variant="danger">Eliminar</Button>)
    expect(screen.getByRole('button', { name: 'Eliminar' })).toHaveClass('btn--danger')
  })

  it('appends extra className values', () => {
    render(<Button className="extra">Guardar</Button>)

    expect(screen.getByRole('button', { name: 'Guardar' })).toHaveClass('extra')
  })

  it('forwards native button attributes and click events', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button type="submit" onClick={onClick} disabled>
        Enviar
      </Button>,
    )

    const btn = screen.getByRole('button', { name: 'Enviar' })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('type', 'submit')
  })
})
