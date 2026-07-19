import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

import { AppHeader } from './AppHeader'

describe('AppHeader', () => {
  it('renders the page title based on current route', () => {
    render(
      <AppHeader onToggleSidebar={() => {}} />,
      { wrapper: ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={['/work-orders']}>{children}</MemoryRouter> },
    )

    expect(screen.getByRole('heading', { name: 'Órdenes de Trabajo' })).toBeInTheDocument()
  })

  it('renders default title for unknown routes', () => {
    render(
      <AppHeader onToggleSidebar={() => {}} />,
      { wrapper: ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={['/unknown']}>{children}</MemoryRouter> },
    )

    expect(screen.getByRole('heading', { name: 'SIGOM' })).toBeInTheDocument()
  })

  it('calls onToggleSidebar when menu button is clicked', async () => {
    const user = userEvent.setup()
    const onToggleSidebar = vi.fn()
    render(
      <AppHeader onToggleSidebar={onToggleSidebar} />,
      { wrapper: ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter> },
    )

    await user.click(screen.getByLabelText('Abrir menú'))

    expect(onToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it('renders notification and user sections', () => {
    render(
      <AppHeader onToggleSidebar={() => {}} />,
      { wrapper: ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter> },
    )

    expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument()
    expect(screen.getByText('Supervisor')).toBeInTheDocument()
    expect(screen.getByText('ENOSA')).toBeInTheDocument()
  })
})
