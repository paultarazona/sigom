export type WorkOrderStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_FIELD'
  | 'SUSPENDED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type Role = 'ADMIN' | 'SUPERVISOR' | 'TECHNICIAN' | 'VIEWER'

export interface WorkOrder {
  id: string
  code: string
  title: string
  description: string
  status: WorkOrderStatus
  priority: Priority
  zoneId: string
  assignedTo?: string
  finalDiagnosis?: string
  solution?: string
  createdAt: string
  updatedAt: string
}

export interface Technician {
  id: string
  name: string
  email: string
  isActive: boolean
  activeOrdersCount: number
}

export interface Crew {
  id: string
  name: string
  leaderId: string
  members: Technician[]
}

export interface Inspection {
  id: string
  workOrderId: string
  findings: string
  inspectedAt: string
  technicianId: string
}

export interface Evidence {
  id: string
  workOrderId: string
  fileUrl: string
  mimeType: string
  uploadedAt: string
}

export interface MaintenancePlan {
  id: string
  title: string
  description: string
  scheduledDate: string
  zoneId: string
  status: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DashboardSummary {
  pending: number
  critical: number
  inField: number
  averageResolutionHours: number
}
