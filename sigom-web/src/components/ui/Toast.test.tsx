import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ToastContainer } from './Toast'

const toastListeners = vi.hoisted(() => ({
  onToast: vi.fn(),
  onDismiss: vi.fn(),
}))

vi.mock('../../lib/toast', () => ({
  subscribe: (fn: (item: { id: string; type: 'success'; message: string; duration: number }) => void) => {
    toastListeners.onToast.mockImplementation(fn as never)
    return () => {}
  },
  subscribeDismiss: (fn: (id: string) => void) => {
    toastListeners.onDismiss.mockImplementation(fn as never)
    return () => {}
  },
}))

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ToastContainer />)

    expect(container.firstChild).toBeNull()
  })

  it('renders a toast after subscribing and auto-dismisses it', async () => {
    render(<ToastContainer />)

    act(() => {
      toastListeners.onToast({
        id: 'toast-1',
        type: 'success',
        message: 'Guardado',
        duration: 10,
      })
    })

    expect(screen.getByText('Guardado')).toBeInTheDocument()

    await vi.waitFor(
      () => expect(screen.queryByText('Guardado')).not.toBeInTheDocument(),
      { timeout: 500 },
    )
  })

  it('dismisses a toast when its close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ToastContainer />)

    act(() => {
      toastListeners.onToast({
        id: 'toast-2',
        type: 'success',
        message: 'Listo',
        duration: 0,
      })
    })

    await user.click(screen.getByLabelText('Cerrar'))

    expect(screen.queryByText('Listo')).not.toBeInTheDocument()
  })
})
