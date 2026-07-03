import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'

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

export function AppHeader() {
  const { pathname } = useLocation()

  const base = '/' + pathname.split('/')[1]
  const title = routeTitles[base] ?? 'SIGOM'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <h2 className="text-base font-semibold text-textPrimary">{title}</h2>

      <div className="flex items-center gap-3">
        <button
          className="relative rounded-lg p-2 text-textSecondary hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Notificaciones"
        >
          <Bell size={18} strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white select-none">
            SU
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-textPrimary">Supervisor</p>
            <p className="text-xs text-textSecondary">ENOSA</p>
          </div>
        </div>
      </div>
    </header>
  )
}
