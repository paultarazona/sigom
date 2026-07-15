import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

import { AppSidebar } from './AppSidebar'

describe('AppSidebar', () => {
  it('renders all navigation items', () => {
    render(
      <AppSidebar isOpen={true} onClose={() => {}} />,
      { wrapper: ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter> },
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Órdenes de Trabajo')).toBeInTheDocument()
    expect(screen.getByText('Inspecciones')).toBeInTheDocument()
    expect(screen.getByText('Evidencias')).toBeInTheDocument()
    expect(screen.getByText('Cuadrillas')).toBeInTheDocument()
    expect(screen.getByText('Planes de Mantenimiento')).toBeInTheDocument()
    expect(screen.getByText('Reportes')).toBeInTheDocument()
    expect(screen.getByText('Técnicos')).toBeInTheDocument()
  })

  it('shows logo text', () => {
    render(
      <AppSidebar isOpen={false} onClose={() => {}} />,
      { wrapper: ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter> },
    )

    expect(screen.getByText('SIGOM')).toBeInTheDocument()
    expect(screen.getByText('ENOSA')).toBeInTheDocument()
  })

  it('renders close button with accessible label', () => {
    render(
      <AppSidebar isOpen={true} onClose={() => {}} />,
      { wrapper: ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter> },
    )

    expect(screen.getByLabelText('Cerrar menú')).toBeInTheDocument()
  })
})
