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
  type: string
  initialObservation?: string
  status: WorkOrderStatus
  priority: Priority
  zoneId: string
  scheduledAt?: string
  createdById?: string
  assignedToId?: string
  finalDiagnosis?: string
  solutionApplied?: string
  assignedTo?: {
    id: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
}

export interface Technician {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  _count: {
    assignedOrders: number
  }
}

export interface Crew {
  id: string
  name: string
  leaderId: string
  leader: {
    id: string
    firstName: string
    lastName: string
  }
  members?: Technician[]
  _count: {
    members: number
  }
}

export interface Inspection {
  id: string
  code: string
  workOrderId: string
  inspectionType?: string
  result?: string
  observation: string
  registeredAt: string
  registeredById?: string
  registeredBy?: {
    id: string
    firstName: string
    lastName: string
  }
  workOrder?: {
    id: string
    code: string
  }
}

export interface Evidence {
  id: string
  code: string
  workOrderId: string
  filePath: string
  originalName?: string
  mimeType: string
  observation?: string
  registeredAt: string
  registeredById?: string
  inspectionId?: string
  registeredBy?: {
    id: string
    firstName: string
    lastName: string
  }
  workOrder?: {
    id: string
    code: string
  }
}

export interface MaintenancePlan {
  id: string
  code: string
  name: string
  description: string
  startDate: string
  frequencyDays: number
  isActive: boolean
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
  total: number
  pending: number
  assigned: number
  inField: number
  suspended: number
  resolved: number
  closed: number
  cancelled: number
}

export interface AverageAttentionTime {
  averageHours: number
  count: number
}
