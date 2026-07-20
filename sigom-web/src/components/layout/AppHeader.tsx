import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu } from 'lucide-react'
import { logout } from '../../auth/auth-api'
import { getSession } from '../../auth/session'

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/work-orders': 'Órdenes de Trabajo',
  '/inspections': 'Inspecciones',
  '/evidences': 'Evidencias',
  '/crews': 'Cuadrillas',
  '/maintenance-plans': 'Planes de Mantenimiento',
  '/reports': 'Reportes',
  '/technicians': 'Técnicos',
}

interface AppHeaderProps {
  onToggleSidebar: () => void
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const base = '/' + pathname.split('/')[1]
  const title = routeTitles[base] ?? 'SIGOM'
  const user = getSession()?.user
  const name = user ? `${user.firstName} ${user.lastName}` : 'Usuario'
  const initials = `${user?.firstName[0] ?? ''}${user?.lastName[0] ?? ''}` || 'US'

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="header">
      <div className="header__left">
        <button
          onClick={onToggleSidebar}
          className="header__menu-btn"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <h2 className="header__title">{title}</h2>
      </div>

      <div className="header__right">
        <button className="header__notification-btn" aria-label="Notificaciones">
          <Bell size={18} strokeWidth={1.75} />
          <span className="header__notification-dot" aria-hidden="true" />
        </button>

        <div className="header__user">
          <div className="header__avatar" aria-hidden="true">{initials}</div>
          <div className="header__user-info">
            <p className="header__user-name">{name}</p>
            <p className="header__user-role">{user?.role ?? 'ENOSA'}</p>
          </div>
        </div>
        <button className="header__notification-btn" onClick={handleLogout} aria-label="Cerrar sesión">
          <LogOut size={18} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  )
}
