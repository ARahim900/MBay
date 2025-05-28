import {
  Zap,
  Droplets, 
  Combine,
  UserCheck,
  BarChart3,
  Settings,
  Bell,
  FileText
} from "lucide-react"
import { ModuleConfig } from "@/lib/types"
import { COLORS } from "./constants"

// Module Configuration - Single source of truth for all modules
export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  dashboard: {
    id: "dashboard",
    name: "Dashboard",
    icon: "BarChart3",
    description: "Overview of all systems and key metrics",
    color: COLORS.primary,
    enabled: true,
    permissions: ["read"],
    routes: ["/", "/dashboard"]
  },
  electricity: {
    id: "electricity",
    name: "Electricity System",
    icon: "Zap",
    description: "Power infrastructure monitoring and management",
    color: COLORS.warning,
    enabled: true,
    permissions: ["read", "write", "manage"],
    routes: ["/electricity"]
  },
  water: {
    id: "water",
    name: "Water Analysis",
    icon: "Droplets", 
    description: "Water quality monitoring and analysis",
    color: COLORS.info,
    enabled: true,
    permissions: ["read", "write", "manage"],
    routes: ["/water"]
  },
  stp: {
    id: "stp",
    name: "STP Plant",
    icon: "Combine",
    description: "Sewage Treatment Plant operations",
    color: COLORS.success,
    enabled: true,
    permissions: ["read", "write", "manage"],
    routes: ["/stp"]
  },
  contractors: {
    id: "contractors",
    name: "Contractor Tracker",
    icon: "UserCheck",
    description: "Contractor management and project tracking",
    color: COLORS.primaryLight,
    enabled: true,
    permissions: ["read", "write", "manage"],
    routes: ["/contractors"]
  },
  reports: {
    id: "reports",
    name: "Reports",
    icon: "FileText",
    description: "Generate and view system reports",
    color: COLORS.dominant,
    enabled: true,
    permissions: ["read", "generate"],
    routes: ["/reports"]
  },
  settings: {
    id: "settings",
    name: "Settings",
    icon: "Settings", 
    description: "System configuration and preferences",
    color: COLORS.navy,
    enabled: true,
    permissions: ["admin"],
    routes: ["/settings"]
  }
}

// Icon mapping for dynamic icon rendering
export const ICON_MAP = {
  Zap,
  Droplets,
  Combine,
  UserCheck,
  BarChart3,
  Settings,
  Bell,
  FileText
}

// Navigation structure
export const NAVIGATION_ITEMS = [
  {
    section: "Main",
    items: [
      MODULE_CONFIGS.dashboard,
      MODULE_CONFIGS.electricity,
      MODULE_CONFIGS.water,
      MODULE_CONFIGS.stp,
      MODULE_CONFIGS.contractors
    ]
  },
  {
    section: "Management",
    items: [
      MODULE_CONFIGS.reports,
      MODULE_CONFIGS.settings
    ]
  }
]

// Module status and health check configuration
export const MODULE_HEALTH_ENDPOINTS = {
  electricity: "/api/health/electricity",
  water: "/api/health/water", 
  stp: "/api/health/stp",
  contractors: "/api/health/contractors"
}

// Default pagination settings per module
export const PAGINATION_DEFAULTS = {
  electricity: { itemsPerPage: 50, sortBy: "timestamp", sortOrder: "desc" },
  water: { itemsPerPage: 25, sortBy: "timestamp", sortOrder: "desc" },
  stp: { itemsPerPage: 30, sortBy: "timestamp", sortOrder: "desc" },
  contractors: { itemsPerPage: 20, sortBy: "name", sortOrder: "asc" }
}

// Refresh intervals for real-time data (in milliseconds)
export const REFRESH_INTERVALS = {
  electricity: 30000, // 30 seconds
  water: 60000,       // 1 minute
  stp: 45000,         // 45 seconds
  contractors: 300000 // 5 minutes
}

// Alert thresholds per module
export const ALERT_THRESHOLDS = {
  electricity: {
    voltage: { min: 220, max: 240 },
    frequency: { min: 49.5, max: 50.5 },
    power: { max: 10000 }
  },
  water: {
    ph: { min: 6.5, max: 8.5 },
    turbidity: { max: 4 },
    chlorine: { min: 0.5, max: 4.0 }
  },
  stp: {
    efficiency: { min: 85 },
    bod: { max: 30 },
    ph: { min: 6.0, max: 9.0 }
  }
}

// Export utility functions
export const getModuleByRoute = (route: string): ModuleConfig | undefined => {
  return Object.values(MODULE_CONFIGS).find(module => 
    module.routes.some(r => route.startsWith(r))
  )
}

export const getEnabledModules = (): ModuleConfig[] => {
  return Object.values(MODULE_CONFIGS).filter(module => module.enabled)
}

export const getModulesByPermission = (permissions: string[]): ModuleConfig[] => {
  return Object.values(MODULE_CONFIGS).filter(module =>
    module.permissions.some(perm => permissions.includes(perm))
  )
}
