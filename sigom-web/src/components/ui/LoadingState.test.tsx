import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoadingState, LoadingSpinner, LoadingOverlay } from './LoadingState'

describe('LoadingState', () => {
  it('renders the requested number of skeleton rows', () => {
    const { container } = render(<LoadingState rows={3} />)

    expect(container.querySelectorAll('.loading-state__row')).toHaveLength(3)
  })

  it('exposes a status role with the message', () => {
    render(<LoadingState message="Cargando órdenes..." />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando órdenes...')
  })

  it('renders the overlay variant when requested', () => {
    render(<LoadingState variant="overlay" />)

    expect(screen.getByRole('status')).toHaveClass('loading-overlay')
  })
})

describe('LoadingSpinner', () => {
  it('renders a status with accessible label', () => {
    render(<LoadingSpinner />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

describe('LoadingOverlay', () => {
  it('shows the provided message', () => {
    render(<LoadingOverlay message="Procesando..." />)

    expect(screen.getByText('Procesando...')).toBeInTheDocument()
  })
})
