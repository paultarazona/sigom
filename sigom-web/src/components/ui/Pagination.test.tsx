import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('shows the current result range and disables the previous control on the first page', () => {
    render(<Pagination page={1} totalPages={3} total={45} limit={20} onPageChange={vi.fn()} />)

    expect(screen.getByText(/Mostrando/)).toHaveTextContent('Mostrando 1–20 de 45 resultados')
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
  })

  it('changes to the selected page and next page', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination page={2} totalPages={3} total={45} limit={20} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: /^3$/ }))
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }))

    expect(onPageChange).toHaveBeenNthCalledWith(1, 3)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3)
  })

  it('reports zero results and disables the next control on the final page', () => {
    render(<Pagination page={1} totalPages={1} total={0} limit={20} onPageChange={vi.fn()} />)

    expect(screen.getByText(/Mostrando/)).toHaveTextContent('Mostrando 0–0 de 0 resultados')
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled()
  })

  it('changes to the previous page and collapses distant page numbers', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination page={5} totalPages={8} total={160} limit={20} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: 'Página anterior' }))

    expect(onPageChange).toHaveBeenCalledWith(4)
    expect(screen.getAllByText('…')).toHaveLength(2)
  })
})
