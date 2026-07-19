import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FilterBar, FilterSelect } from './FilterBar'

describe('FilterBar', () => {
  it('renders children and applies extra className', () => {
    const { container } = render(
      <FilterBar className="compact">
        <span>Filtro A</span>
      </FilterBar>,
    )

    expect(screen.getByText('Filtro A')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('filter-bar', 'compact')
  })
})

describe('FilterSelect', () => {
  it('renders a label and options', () => {
    render(
      <FilterSelect
        label="Estado"
        value="PENDING"
        onChange={() => {}}
        options={[
          { value: 'PENDING', label: 'Pendiente' },
          { value: 'CLOSED', label: 'Cerrada' },
        ]}
      />,
    )

    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue('PENDING')
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('calls onChange when the selected value changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <FilterSelect
        label="Estado"
        value="PENDING"
        onChange={onChange}
        options={[
          { value: 'PENDING', label: 'Pendiente' },
          { value: 'CLOSED', label: 'Cerrada' },
        ]}
      />,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'CLOSED')

    expect(onChange).toHaveBeenCalledWith('CLOSED')
  })
})
