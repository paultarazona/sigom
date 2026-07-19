import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('shows the default error copy', () => {
    render(<ErrorState />)

    expect(screen.getByText('Error al cargar')).toBeInTheDocument()
    expect(
      screen.getByText('Ocurrió un problema al obtener los datos. Intentá de nuevo.'),
    ).toBeInTheDocument()
  })

  it('renders a retry button when onRetry is provided and calls it on click', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)

    const retry = screen.getByRole('button', { name: 'Reintentar' })
    await user.click(retry)

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not render the retry button when onRetry is absent', () => {
    render(<ErrorState />)

    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
  })
})
