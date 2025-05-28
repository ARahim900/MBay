// Clean water analysis data with zone bulks only (4300336 & 4300338 removed)
import { WaterAnalysisData } from '@/lib/types'

export const WATER_ZONE_DATA: WaterAnalysisData[] = [
  // Zone 01 (FM) - Zone Bulk
  {
    id: '4300346',
    meterLabel: 'ZONE FM ( BULK ZONE FM )',
    accountNumber: '4300346',
    zone: 'Zone_01_(FM)',
    type: 'Zone Bulk',
    parentMeter: 'Main Bulk (NAMA)',
    label: 'L2',
    monthlyReadings: {
      'Jan-24': 1595, 'Feb-24': 1283, 'Mar-24': 1255, 'Apr-24': 1383,
      'May-24': 1411, 'Jun-24': 2078, 'Jul-24': 2601, 'Aug-24': 1638,
      'Sep-24': 1550, 'Oct-24': 2098, 'Nov-24': 1808, 'Dec-24': 1946,
      'Jan-25': 2008, 'Feb-25': 1740, 'Mar-25': 1880, 'Apr-25': 1880
    },
    totalConsumption: 25561,
    averageMonthly: 1597.56,
    status: 'operational',
    location: 'Zone FM',
    category: 'Zone Bulk'
  },

  // Zone 03(A) - Zone Bulk  
  {
    id: '4300343',
    meterLabel: 'ZONE 3A (Bulk Zone 3A)',
    accountNumber: '4300343',
    zone: 'Zone_03_(A)',
    type: 'Zone Bulk',
    parentMeter: 'Main Bulk (NAMA)',
    label: 'L2',
    monthlyReadings: {
      'Jan-24': 1234, 'Feb-24': 1099, 'Mar-24': 1297, 'Apr-24': 1892,
      'May-24': 2254, 'Jun-24': 2227, 'Jul-24': 3313, 'Aug-24': 3172,
      'Sep-24': 2698, 'Oct-24': 3715, 'Nov-24': 3501, 'Dec-24': 3796,
      'Jan-25': 4235, 'Feb-25': 4273, 'Mar-25': 3591, 'Apr-25': 4041
    },
    totalConsumption: 43538,
    averageMonthly: 2721.13,
    status: 'operational',
    location: 'Zone 3A',
    category: 'Zone Bulk'
  },

  // Zone 03(B) - Zone Bulk
  {
    id: '4300344',
    meterLabel: 'ZONE 3B (Bulk Zone 3B)',
    accountNumber: '4300344',
    zone: 'Zone_03_(B)',
    type: 'Zone Bulk',
    parentMeter: 'Main Bulk (NAMA)',
    label: 'L2',
    monthlyReadings: {
      'Jan-24': 2653, 'Feb-24': 2169, 'Mar-24': 2315, 'Apr-24': 2381,
      'May-24': 2634, 'Jun-24': 2932, 'Jul-24': 3369, 'Aug-24': 3458,
      'Sep-24': 3742, 'Oct-24': 2906, 'Nov-24': 2695, 'Dec-24': 3583,
      'Jan-25': 3256, 'Feb-25': 2962, 'Mar-25': 3331, 'Apr-25': 2157
    },
    totalConsumption: 44543,
    averageMonthly: 2783.94,
    status: 'operational',
    location: 'Zone 3B',
    category: 'Zone Bulk'
  },

  // Zone 05 - Zone Bulk
  {
    id: '4300345',
    meterLabel: 'ZONE 5 (Bulk Zone 5)',
    accountNumber: '4300345',
    zone: 'Zone_05',
    type: 'Zone Bulk',
    parentMeter: 'Main Bulk (NAMA)',
    label: 'L2',
    monthlyReadings: {
      'Jan-24': 4286, 'Feb-24': 3897, 'Mar-24': 4127, 'Apr-24': 4911,
      'May-24': 2639, 'Jun-24': 4992, 'Jul-24': 5305, 'Aug-24': 4039,
      'Sep-24': 2736, 'Oct-24': 3383, 'Nov-24': 1438, 'Dec-24': 3788,
      'Jan-25': 4267, 'Feb-25': 4231, 'Mar-25': 3862, 'Apr-25': 3737
    },
    totalConsumption: 61640,
    averageMonthly: 3852.50,
    status: 'operational',
    location: 'Zone 5',
    category: 'Zone Bulk'
  },

  // Zone 08 - Zone Bulk
  {
    id: '4300342',
    meterLabel: 'ZONE 8 (Bulk Zone 8)',
    accountNumber: '4300342',
    zone: 'Zone_08',
    type: 'Zone Bulk',
    parentMeter: 'Main Bulk (NAMA)',
    label: 'L2',
    monthlyReadings: {
      'Jan-24': 2170, 'Feb-24': 1825, 'Mar-24': 2021, 'Apr-24': 2753,
      'May-24': 2722, 'Jun-24': 3193, 'Jul-24': 3639, 'Aug-24': 3957,
      'Sep-24': 3947, 'Oct-24': 4296, 'Nov-24': 3569, 'Dec-24': 3018,
      'Jan-25': 1547, 'Feb-25': 1498, 'Mar-25': 2605, 'Apr-25': 3203
    },
    totalConsumption: 45963,
    averageMonthly: 2872.69,
    status: 'operational',
    location: 'Zone 8',
    category: 'Zone Bulk'
  },

  // Village Square - Zone Bulk
  {
    id: '4300335',
    meterLabel: 'Village Square (Zone Bulk)',
    accountNumber: '4300335',
    zone: 'Zone_VS',
    type: 'Zone Bulk',
    parentMeter: 'Main Bulk (NAMA)',
    label: 'L2',
    monthlyReadings: {
      'Jan-24': 261, 'Feb-24': 97, 'Mar-24': 260, 'Apr-24': 125,
      'May-24': 277, 'Jun-24': 143, 'Jul-24': 137, 'Aug-24': 145,
      'Sep-24': 63, 'Oct-24': 341, 'Nov-24': 71, 'Dec-24': 41,
      'Jan-25': 22, 'Feb-25': 11, 'Mar-25': 3, 'Apr-25': 0
    },
    totalConsumption: 1996,
    averageMonthly: 124.75,
    status: 'operational',
    location: 'Village Square',
    category: 'Zone Bulk'
  }
]

// Zone consumption trends
export const ZONE_CONSUMPTION_TRENDS = [
  { zone: 'Zone FM', jan24: 1595, feb24: 1283, mar24: 1255, apr24: 1383, current: 1880, trend: 'stable' },
  { zone: 'Zone 3A', jan24: 1234, feb24: 1099, mar24: 1297, apr24: 1892, current: 4041, trend: 'increasing' },
  { zone: 'Zone 3B', jan24: 2653, feb24: 2169, mar24: 2315, apr24: 2381, current: 2157, trend: 'decreasing' },
  { zone: 'Zone 5', jan24: 4286, feb24: 3897, mar24: 4127, apr24: 4911, current: 3737, trend: 'variable' },
  { zone: 'Zone 8', jan24: 2170, feb24: 1825, mar24: 2021, apr24: 2753, current: 3203, trend: 'increasing' },
  { zone: 'Village Square', jan24: 261, feb24: 97, mar24: 260, apr24: 125, current: 0, trend: 'critical' }
]

// Zone performance metrics
export const ZONE_PERFORMANCE_METRICS = {
  totalZones: 6,
  totalConsumption: 223238,
  averageZoneConsumption: 37206.33,
  highestConsumer: 'Zone 5',
  lowestConsumer: 'Village Square',
  criticalZones: ['Village Square'],
  stableZones: ['Zone FM', 'Zone 3A', 'Zone 8'],
  variableZones: ['Zone 3B', 'Zone 5']
}

// Monthly aggregated data for charts
export const MONTHLY_ZONE_AGGREGATE = [
  { month: 'Jan-24', total: 12199, zones: 6 },
  { month: 'Feb-24', total: 10370, zones: 6 },
  { month: 'Mar-24', total: 11275, zones: 6 },
  { month: 'Apr-24', total: 12445, zones: 6 },
  { month: 'May-24', total: 12537, zones: 6 },
  { month: 'Jun-24', total: 15565, zones: 6 },
  { month: 'Jul-24', total: 18364, zones: 6 },
  { month: 'Aug-24', total: 16409, zones: 6 },
  { month: 'Sep-24', total: 14736, zones: 6 },
  { month: 'Oct-24', total: 16739, zones: 6 },
  { month: 'Nov-24', total: 13282, zones: 6 },
  { month: 'Dec-24', total: 16372, zones: 6 },
  { month: 'Jan-25', total: 15335, zones: 6 },
  { month: 'Feb-25', total: 14215, zones: 6 },
  { month: 'Mar-25', total: 13872, zones: 6 },
  { month: 'Apr-25', total: 15018, zones: 6 }
]

// Zone status alerts
export const ZONE_ALERTS = [
  {
    id: 'vs-001',
    zone: 'Village Square',
    type: 'critical',
    message: 'Zero consumption detected for Apr-25',
    timestamp: new Date('2025-04-01'),
    resolved: false
  },
  {
    id: 'z3a-001', 
    zone: 'Zone 3A',
    type: 'warning',
    message: 'Consumption increased by 227% since Jan-24',
    timestamp: new Date('2025-04-01'),
    resolved: false
  },
  {
    id: 'z5-001',
    zone: 'Zone 5',
    type: 'info',
    message: 'Highly variable consumption pattern detected',
    timestamp: new Date('2025-04-01'),
    resolved: false
  }
]
