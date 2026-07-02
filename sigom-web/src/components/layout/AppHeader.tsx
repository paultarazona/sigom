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
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#C4D0D8] bg-white px-6">
      <h2 className="text-base font-semibold text-[#151B30]">{title}</h2>

      <div className="flex items-center gap-3">
        <button
          className="relative rounded-lg p-2 text-[#72727A] hover:bg-[#F7F9FB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00236F]/30"
          aria-label="Notificaciones"
        >
          <Bell size={18} strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#B91C1C]" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00236F] text-xs font-semibold text-white select-none">
            SU
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-[#151B30]">Supervisor</p>
            <p className="text-xs text-[#72727A]">ENOSA</p>
          </div>
        </div>
      </div>
    </header>
  )
}
