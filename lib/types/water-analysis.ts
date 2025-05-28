// Water Analysis specific types
export interface WaterConsumptionData {
  meterLabel: string
  acctNumber: string
  zone: string
  type: string
  parentMeter: string
  label: string
  monthlyData: Record<string, number>
  totalConsumption: number
  averageMonthly: number
  status: 'normal' | 'high' | 'low' | 'critical'
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface ZoneAnalytics {
  zoneName: string
  zoneId: string
  totalConsumption: number
  averageMonthly: number
  meterCount: number
  highConsumers: number
  trend: 'increasing' | 'decreasing' | 'stable'
  efficiency: number
}

export interface WaterQualityMetrics {
  ph: number
  turbidity: number
  chlorine: number
  temperature: number
  tds: number
  compliance: boolean
  timestamp: Date
}

// Zone configuration for water analysis
export interface ZoneConfig {
  id: string
  name: string
  displayName: string
  color: string
  type: 'zone_bulk' | 'direct_connection' | 'residential' | 'retail' | 'irrigation'
  enabled: boolean
  excludedMeters?: string[]
}

export const WATER_ZONE_CONFIGS: Record<string, ZoneConfig> = {
  zone_fm: {
    id: 'zone_fm',
    name: 'Zone_01_(FM)',
    displayName: 'Zone 01 (FM)',
    color: '#3B82F6',
    type: 'zone_bulk',
    enabled: true
  },
  zone_3a: {
    id: 'zone_3a', 
    name: 'Zone_03_(A)',
    displayName: 'Zone 03 (A)',
    color: '#10B981',
    type: 'zone_bulk',
    enabled: true
  },
  zone_3b: {
    id: 'zone_3b',
    name: 'Zone_03_(B)', 
    displayName: 'Zone 03 (B)',
    color: '#F59E0B',
    type: 'zone_bulk',
    enabled: true
  },
  zone_05: {
    id: 'zone_05',
    name: 'Zone_05',
    displayName: 'Zone 05',
    color: '#EF4444',
    type: 'zone_bulk', 
    enabled: true
  },
  zone_08: {
    id: 'zone_08',
    name: 'Zone_08',
    displayName: 'Zone 08', 
    color: '#8B5CF6',
    type: 'zone_bulk',
    enabled: true
  },
  zone_vs: {
    id: 'zone_vs',
    name: 'Zone_VS',
    displayName: 'Village Square',
    color: '#06B6D4',
    type: 'zone_bulk',
    enabled: true
  },
  main_bulk: {
    id: 'main_bulk',
    name: 'Main_Bulk',
    displayName: 'Main Bulk',
    color: '#374151',
    type: 'zone_bulk',
    enabled: true,
    excludedMeters: ['4300336', '4300338'] // Exclude these specific meters
  }
}

// Monthly data columns
export const MONTH_COLUMNS = [
  'Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24',
  'Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24', 'Dec-24',
  'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25'
]
