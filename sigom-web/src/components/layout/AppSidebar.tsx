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

export function AppSidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-[#00236F]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 bg-[#001A52] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
          <span className="text-xs font-bold text-white">SG</span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">SIGOM</p>
          <p className="text-[10px] text-[#57DFFE]/70">ENOSA</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  isActive
                    ? 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors bg-white/[0.12] text-white'
                    : 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-white/60 hover:bg-white/[0.07] hover:text-white'
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2 : 1.75}
                      className={isActive ? 'text-[#57DFFE]' : 'text-white/50'}
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
      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-[10px] text-white/30">v1.0.0 — SIGOM Web</p>
      </div>
    </aside>
  )
}
