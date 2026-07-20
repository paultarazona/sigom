import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/client', () => ({
  default: { post: vi.fn() },
}))

import client from '../api/client'
import { logout } from './auth-api'
import { getSession, saveSession } from './session'

describe('logout', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(client.post).mockReset()
  })

  it('clears the local session when the logout request fails', async () => {
    saveSession({ id: 'user-1', email: 'admin@enosa.test', firstName: 'Admin', lastName: 'ENOSA', role: 'ADMIN' })
    vi.mocked(client.post).mockRejectedValueOnce(new Error('Network unavailable'))

    await expect(logout()).resolves.toBeUndefined()

    expect(getSession()).toBeNull()
  })
})
