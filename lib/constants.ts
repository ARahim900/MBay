// ===============================
// CORE CONSTANTS & CONFIGURATION
// ===============================

export const OMR_PER_KWH = 0.025;

// Primary Color Scheme - Sophisticated Purple-Gray Palette
export const COLORS = {
  primary: '#4E4456',        // Main brand color - Deep purple-gray
  primaryLight: '#7E708A',   // Lighter variant for hover states
  primaryDark: '#3B3241',    // Darker variant for active states
  accent: '#6A5ACD',         // Accent purple for highlights
  success: '#10B981',        // Green for positive metrics
  warning: '#F59E0B',        // Amber for warnings
  info: '#3B82F6',          // Blue for information
  error: '#EF4444',         // Red for errors
  
  // Chart colors palette
  chart: ['#6A5ACD', '#FFA07A', '#20B2AA', '#FF69B4', '#9370DB', '#F08080', '#4682B4', '#32CD32', '#FF6347', '#4169E1']
};

// Application Configuration
export const APP_CONFIG = {
  name: 'Muscat Bay Assets & Operation',
  description: 'Modern web app to showcase operational data to top management and others',
  version: '2.0.0',
  defaultRefreshInterval: 30000, // 30 seconds
  maxRetries: 3,
};

// Navigation Configuration
export const MAIN_SECTIONS = [
  { 
    name: 'Electricity System', 
    id: 'ElectricitySystem', 
    icon: 'Zap',
    description: 'Electricity consumption analysis and monitoring'
  },
  { 
    name: 'Water Analysis', 
    id: 'WaterAnalysis', 
    icon: 'Droplets',
    description: 'Water quality and flow analysis'
  },
  { 
    name: 'STP Plant', 
    id: 'STPPlant', 
    icon: 'Combine',
    description: 'Sewage treatment plant monitoring'
  },
  { 
    name: 'Contractor Tracker', 
    id: 'ContractorTracker', 
    icon: 'UserCheck',
    description: 'Contractor and project management'
  },
];

// Electricity System Sub-sections
export const ELECTRICITY_SUB_SECTIONS = [
  { name: 'Dashboard', id: 'Dashboard', icon: 'LayoutDashboard' },
  { name: 'Performance', id: 'Performance', icon: 'TrendingUp' },
  { name: 'Analytics', id: 'Analytics', icon: 'BarChart2' },
  { name: 'Unit Details', id: 'UnitDetails', icon: 'List' },
];

// API Endpoints (for future use)
export const API_ENDPOINTS = {
  electricity: '/api/electricity',
  water: '/api/water',
  stp: '/api/stp',
  contractors: '/api/contractors',
};
