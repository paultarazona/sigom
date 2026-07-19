import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ClipboardList } from 'lucide-react'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('renders the title and value', () => {
    render(<StatCard title="Pendientes" value={12} icon={ClipboardList} />)

    expect(screen.getByText('Pendientes')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(
      <StatCard title="Total" value={5} icon={ClipboardList} description="Esta semana" />,
    )

    expect(screen.getByText('Esta semana')).toBeInTheDocument()
  })

  it('does not render as interactive when onClick is absent', () => {
    render(<StatCard title="Pendientes" value={12} icon={ClipboardList} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onClick and supports keyboard activation when interactive', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<StatCard title="Pendientes" value={12} icon={ClipboardList} onClick={onClick} />)

    const card = screen.getByRole('button')
    await user.click(card)

    expect(onClick).toHaveBeenCalledTimes(1)

    onClick.mockClear()
    card.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies the expected icon modifier per variant', () => {
    const { container, rerender } = render(
      <StatCard title="T" value={0} icon={ClipboardList} variant="danger" />,
    )
    expect(container.querySelector('.stat-card__icon--danger')).toBeTruthy()

    rerender(<StatCard title="T" value={0} icon={ClipboardList} variant="success" />)
    expect(container.querySelector('.stat-card__icon--success')).toBeTruthy()
  })
})
