import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppSidebar } from './components/layout/AppSidebar'
import { AppHeader } from './components/layout/AppHeader'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { WorkOrdersPage } from './pages/work-orders/WorkOrdersPage'
import { WorkOrderDetailPage } from './pages/work-orders/WorkOrderDetailPage'
import { InspectionsPage } from './pages/inspections/InspectionsPage'
import { EvidencesPage } from './pages/evidences/EvidencesPage'
import { CrewsPage } from './pages/crews/CrewsPage'
import { MaintenancePlansPage } from './pages/maintenance-plans/MaintenancePlansPage'
import { ReportsPage } from './pages/reports/ReportsPage'
import { TechniciansPage } from './pages/technicians/TechniciansPage'
import { ToastContainer } from './components/ui/Toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="app-layout__body">
        <AppHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="app-layout__main">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/work-orders/:id" element={<WorkOrderDetailPage />} />
            <Route path="/inspections" element={<InspectionsPage />} />
            <Route path="/evidences" element={<EvidencesPage />} />
            <Route path="/crews" element={<CrewsPage />} />
            <Route path="/maintenance-plans" element={<MaintenancePlansPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/technicians" element={<TechniciansPage />} />
          </Routes>
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
