import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  it('calls onChange with the user-entered text', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    function SearchInputHarness() {
      const [value, setValue] = useState('')

      return (
        <SearchInput
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue)
            onChange(nextValue)
          }}
          placeholder="Buscar órdenes"
        />
      )
    }

    render(<SearchInputHarness />)

    await user.type(screen.getByRole('textbox', { name: 'Buscar órdenes' }), 'OT-2026')

    expect(onChange).toHaveBeenLastCalledWith('OT-2026')
  })
})
