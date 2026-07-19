import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge'
import type { WorkOrderStatus } from '../../types'

describe('StatusBadge', () => {
  const cases: Array<[WorkOrderStatus, string, string]> = [
    ['PENDING', 'Pendiente', 'status-badge--pending'],
    ['ASSIGNED', 'Asignada', 'status-badge--assigned'],
    ['IN_FIELD', 'En campo', 'status-badge--in-field'],
    ['SUSPENDED', 'Suspendida', 'status-badge--suspended'],
    ['RESOLVED', 'Resuelta', 'status-badge--resolved'],
    ['CLOSED', 'Cerrada', 'status-badge--closed'],
    ['CANCELLED', 'Anulada', 'status-badge--cancelled'],
  ]

  it.each(cases)('renders %s with label %s and modifier %s', (status, label, modifier) => {
    render(<StatusBadge status={status} />)

    const badge = screen.getByText(label)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('status-badge', modifier)
  })
})
