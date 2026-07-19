import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PriorityBadge } from './PriorityBadge'
import type { Priority } from '../../types'

describe('PriorityBadge', () => {
  const cases: Array<[Priority, string, string]> = [
    ['LOW', 'Baja', 'priority-badge--low'],
    ['MEDIUM', 'Media', 'priority-badge--medium'],
    ['HIGH', 'Alta', 'priority-badge--high'],
    ['CRITICAL', 'Crítica', 'priority-badge--critical'],
  ]

  it.each(cases)('renders %s with label %s and modifier %s', (priority, label, modifier) => {
    render(<PriorityBadge priority={priority} />)

    const badge = screen.getByText(label)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('priority-badge', modifier)
  })
})
