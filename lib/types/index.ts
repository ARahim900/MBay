// Global type definitions for MBay System
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'operator' | 'viewer'
  permissions: Record<string, string[]>
  avatar?: string
}

export interface ModuleConfig {
  id: string
  name: string
  icon: string
  description: string
  color: string
  enabled: boolean
  permissions: string[]
  routes: string[]
}

export interface DashboardMetric {
  id: string
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease'
  icon: string
  color: string
  unit?: string
}

export interface ChartData {
  id: string
  label: string
  value: number
  color?: string
  timestamp?: Date
}

export interface NotificationItem {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  moduleId?: string
  actionUrl?: string
}

export interface FilterOption {
  id: string
  label: string
  value: string
  count?: number
}

export interface TableColumn<T = any> {
  id: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => React.ReactNode
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

// Module-specific types
export interface ElectricityData {
  id: string
  location: string
  voltage: number
  current: number
  power: number
  frequency: number
  powerFactor: number
  timestamp: Date
  status: 'normal' | 'warning' | 'critical'
  cost: number
}

export interface WaterQualityData {
  id: string
  location: string
  ph: number
  turbidity: number
  chlorine: number
  temperature: number
  tds: number
  timestamp: Date
  status: 'excellent' | 'good' | 'fair' | 'poor'
  compliance: boolean
}

export interface WaterAnalysisData {
  id: string
  meterLabel: string
  accountNumber: string
  zone: string
  type: string
  parentMeter: string
  label: string
  monthlyReadings: Record<string, number>
  totalConsumption: number
  averageMonthly: number
  status: 'operational' | 'maintenance' | 'critical' | 'offline'
  location: string
  category: string
  alerts?: ZoneAlert[]
}

export interface ZoneAlert {
  id: string
  zone: string
  type: 'info' | 'warning' | 'critical'
  message: string
  timestamp: Date
  resolved: boolean
}

export interface ZoneConsumptionTrend {
  zone: string
  jan24: number
  feb24: number
  mar24: number
  apr24: number
  current: number
  trend: 'increasing' | 'decreasing' | 'stable' | 'variable' | 'critical'
}

export interface STPData {
  id: string
  plantId: string
  inflowRate: number
  outflowRate: number
  efficiency: number
  bod: number
  cod: number
  tss: number
  ph: number
  timestamp: Date
  alarms: string[]
  status: 'operational' | 'maintenance' | 'offline'
}

export interface ContractorData {
  id: string
  name: string
  company: string
  email: string
  phone: string
  specialization: string[]
  rating: number
  projectsCompleted: number
  currentProjects: number
  status: 'active' | 'inactive' | 'suspended'
  documents: Document[]
  lastActivity: Date
}

export interface ProjectData {
  id: string
  title: string
  description: string
  contractorId: string
  startDate: Date
  endDate: Date
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  progress: number
  budget: number
  spent: number
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface Document {
  id: string
  name: string
  type: string
  url: string
  uploadDate: Date
  expiryDate?: Date
  verified: boolean
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
  pagination?: PaginationInfo
}

export interface ModuleStats {
  total: number
  active: number
  inactive: number
  critical: number
  lastUpdated: Date
}
