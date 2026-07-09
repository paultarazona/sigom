import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Search,
  ImageIcon,
  Users,
  CalendarClock,
  BarChart2,
  HardHat,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/work-orders', label: 'Órdenes de Trabajo', icon: ClipboardList },
  { to: '/inspections', label: 'Inspecciones', icon: Search },
  { to: '/evidences', label: 'Evidencias', icon: ImageIcon },
  { to: '/crews', label: 'Cuadrillas', icon: Users },
  { to: '/maintenance-plans', label: 'Planes de Mantenimiento', icon: CalendarClock },
  { to: '/reports', label: 'Reportes', icon: BarChart2 },
  { to: '/technicians', label: 'Técnicos', icon: HardHat },
]

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar__backdrop"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">SG</div>
          <div className="sidebar__logo-text-wrap">
            <p className="sidebar__logo-text">SIGOM</p>
            <p className="sidebar__logo-subtitle">ENOSA</p>
          </div>
          <button
            onClick={onClose}
            className="sidebar__close-btn"
            aria-label="Cerrar menú"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar__nav">
          <p className="sidebar__nav-label">Navegación</p>
          <ul className="sidebar__nav-list">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    isActive ? 'sidebar__nav-link sidebar__nav-link--active' : 'sidebar__nav-link'
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2 : 1.75}
                        className={isActive ? 'sidebar__nav-icon sidebar__nav-icon--active' : 'sidebar__nav-icon'}
                      />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <p>v1.0.0 — SIGOM Web</p>
        </div>
      </aside>
    </>
  )
}
