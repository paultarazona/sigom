export type AuthenticatedUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'SUPERVISOR' | 'TECHNICIAN' | 'VIEWER'
}

export type Session = {
  user: AuthenticatedUser
}

const SESSION_KEY = 'sigom_session'

export function saveSession(user: AuthenticatedUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user }))
}

export function getSession(): Session | null {
  const rawSession = localStorage.getItem(SESSION_KEY)
  if (!rawSession) return null

  try {
    return JSON.parse(rawSession) as Session
  } catch {
    clearSession()
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
