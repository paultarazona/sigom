import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'
import { PackageX } from 'lucide-react'

describe('EmptyState', () => {
  it('renders the default title and description', () => {
    render(<EmptyState />)

    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
    expect(screen.getByText('No se encontraron registros.')).toBeInTheDocument()
  })

  it('renders custom title, description and hint', () => {
    render(
      <EmptyState
        title="Sin órdenes"
        description="Aún no hay órdenes registradas."
        hint="Creá una nueva orden desde el botón superior."
      />,
    )

    expect(screen.getByText('Sin órdenes')).toBeInTheDocument()
    expect(screen.getByText('Aún no hay órdenes registradas.')).toBeInTheDocument()
    expect(
      screen.getByText('Creá una nueva orden desde el botón superior.'),
    ).toBeInTheDocument()
  })

  it('renders the provided action slot', () => {
    render(<EmptyState action={<button>Nueva orden</button>} />)

    expect(screen.getByRole('button', { name: 'Nueva orden' })).toBeInTheDocument()
  })

  it('uses a custom icon when supplied', () => {
    const { container } = render(<EmptyState icon={PackageX} />)

    expect(container.querySelector('svg')).toBeTruthy()
  })
})
