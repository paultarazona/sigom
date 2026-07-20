import { afterEach, describe, expect, it } from 'vitest'
import { clearSession, getSession, saveSession } from './session'

describe('session', () => {
  afterEach(() => localStorage.clear())

  it('stores and retrieves the authenticated user', () => {
    saveSession({ id: 'user-1', email: 'operador.piura@enosa.test', firstName: 'Carlos', lastName: 'Piura', role: 'TECHNICIAN' })

    expect(getSession()).toEqual({
      user: { id: 'user-1', email: 'operador.piura@enosa.test', firstName: 'Carlos', lastName: 'Piura', role: 'TECHNICIAN' },
    })
  })

  it('clears the current session', () => {
    saveSession({ id: 'user-1', email: 'a@enosa.test', firstName: 'A', lastName: 'B', role: 'ADMIN' })

    clearSession()

    expect(getSession()).toBeNull()
  })
})
