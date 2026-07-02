import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppSidebar } from './components/layout/AppSidebar'
import { AppHeader } from './components/layout/AppHeader'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { WorkOrdersPage } from './pages/work-orders/WorkOrdersPage'
import { WorkOrderDetailPage } from './pages/work-orders/WorkOrderDetailPage'
import { CreateWorkOrderPage } from './pages/work-orders/CreateWorkOrderPage'
import { InspectionsPage } from './pages/inspections/InspectionsPage'
import { EvidencesPage } from './pages/evidences/EvidencesPage'
import { CrewsPage } from './pages/crews/CrewsPage'
import { MaintenancePlansPage } from './pages/maintenance-plans/MaintenancePlansPage'
import { ReportsPage } from './pages/reports/ReportsPage'
import { TechniciansPage } from './pages/technicians/TechniciansPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F9FB]">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/work-orders/new" element={<CreateWorkOrderPage />} />
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
