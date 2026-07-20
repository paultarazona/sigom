import { type FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../auth/auth-api'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    } catch {
      setError('Credenciales inválidas o el servicio no está disponible.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-label="Inicio de sesión SIGOM-ENOSA">
        <div className="login-card__mark" aria-hidden="true">OT</div>
        <h1>SIGOM-ENOSA</h1>
        <p>Gestión de órdenes de mantenimiento</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Correo electrónico
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Contraseña
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <p className="login-form__error" role="alert">{error}</p>}
          <button type="submit" disabled={isLoading}>{isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}</button>
        </form>
      </section>
    </main>
  )
}
