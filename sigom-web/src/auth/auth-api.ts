import client from '../api/client'
import { clearSession, saveSession, type AuthenticatedUser } from './session'

export async function login(email: string, password: string) {
  const response = await client.post<{ data: { user: AuthenticatedUser } }>('/auth/login', { email, password })
  saveSession(response.data.data.user)
  return response.data.data.user
}

export async function logout() {
  try {
    await client.post('/auth/logout')
  } catch {
    // The local session must end even when the server cannot be reached.
  } finally {
    clearSession()
  }
}
