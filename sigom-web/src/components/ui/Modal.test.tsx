import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders the title and body content', () => {
    render(
      <Modal open={false} title="Nueva orden" onClose={() => {}}>
        <p>Contenido</p>
      </Modal>,
    )

    expect(screen.getByText('Nueva orden')).toBeInTheDocument()
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('exposes a close button with accessible label', () => {
    render(
      <Modal open={false} title="Título" onClose={() => {}}>
        <p>Cuerpo</p>
      </Modal>,
    )

    expect(screen.getByLabelText('Cerrar')).toBeInTheDocument()
  })
})
