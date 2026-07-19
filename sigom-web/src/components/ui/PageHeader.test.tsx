import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('renders nothing when no content is supplied', () => {
    const { container } = render(<PageHeader />)

    expect(container.firstChild).toBeNull()
  })

  it('renders the title', () => {
    render(<PageHeader title="Órdenes" />)

    expect(screen.getByRole('heading', { name: 'Órdenes' })).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<PageHeader description="Gestioná las órdenes." />)

    expect(screen.getByText('Gestioná las órdenes.')).toBeInTheDocument()
  })

  it('renders the actions slot', () => {
    render(<PageHeader actions={<button>Agregar</button>} />)

    expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument()
  })
})
