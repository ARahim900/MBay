// ===============================
// TYPESCRIPT TYPES & INTERFACES
// ===============================

// Core Application Types
export interface AppSection {
  name: string;
  id: string;
  icon: string;
  description?: string;
}

export interface SubSection {
  name: string;
  id: string;
  icon: string;
}

// Electricity System Types
export interface ElectricityConsumption {
  [month: string]: number;
}

export interface ElectricityDataItem {
  id: number;
  slNo: number;
  zone: string;
  type: string;
  muscatBayNumber: string;
  unitName: string;
  category: string;
  meterAccountNo: string;
  consumption: ElectricityConsumption;
  totalConsumption: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: any;
}

export interface MonthlyTrendData {
  name: string;
  total: number;
}

export interface TopConsumerData {
  name: string;
  consumption: number;
  monthlyDataFull: ElectricityConsumption;
}

// Water Analysis Types
export interface WaterQualityParameter {
  parameter: string;
  value: number;
  unit: string;
  status: 'good' | 'normal' | 'warning' | 'critical';
  range: string;
}

export interface WaterFlowData {
  name: string;
  inflow: number;
  outflow: number;
  consumption: number;
}

// STP Plant Types
export interface TreatmentStage {
  name: string;
  efficiency: number;
  status: 'operational' | 'maintenance' | 'offline';
}

export interface DailyTreatmentData {
  name: string;
  inflow: number;
  treated: number;
  efficiency: number;
}

// Contractor Tracker Types
export interface Contractor {
  name: string;
  project: string;
  status: 'active' | 'completed' | 'pending' | 'on-hold';
  completion: number;
  deadline: string;
  budget?: number;
  contact?: string;
}

export interface ProjectStatus {
  name: string;
  value: number;
  color: string;
}

// Shared Component Types
export interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: any;
  unit?: string;
  trend?: string;
  trendColor?: string;
  iconBgColor?: string;
  isLoading?: boolean;
}

export interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
}

export interface StyledSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  id: string;
  icon?: any;
  disabled?: boolean;
}

// Application State Types
export interface AppState {
  activeMainSection: string;
  isCollapsed: boolean;
  isDarkMode: boolean;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export interface ElectricityFilters {
  selectedMonth: string;
  selectedCategory: string;
  selectedUnitId: string;
  currentPage: number;
}

// API Response Types (for future use)
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Filter and Sort Types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

// Theme and UI Types
export interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    success: string;
    warning: string;
    info: string;
    error: string;
  };
  spacing: {
    [key: string]: string;
  };
  breakpoints: {
    [key: string]: string;
  };
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Export utility type for component props
export type ComponentProps<T = {}> = T & {
  className?: string;
  children?: React.ReactNode;
};
