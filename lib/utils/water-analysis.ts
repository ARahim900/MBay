import { WaterConsumptionData, ZoneAnalytics, WATER_ZONE_CONFIGS, MONTH_COLUMNS } from '@/lib/types/water-analysis'

// Parse raw CSV data into structured water consumption data
export const parseWaterConsumptionData = (rawData: any[]): WaterConsumptionData[] => {
  return rawData.map(row => {
    // Extract monthly data
    const monthlyData: Record<string, number> = {}
    let totalConsumption = 0
    
    MONTH_COLUMNS.forEach(month => {
      const value = parseFloat(row[month]) || 0
      monthlyData[month] = value
      totalConsumption += value
    })
    
    const averageMonthly = totalConsumption / MONTH_COLUMNS.length
    
    // Determine status based on consumption patterns
    const status = determineConsumptionStatus(monthlyData, row.Type)
    
    // Calculate trend
    const trend = calculateConsumptionTrend(monthlyData)
    
    return {
      meterLabel: row['Meter Label'] || '',
      acctNumber: row['Acct #'] || '',
      zone: row.Zone || '',
      type: row.Type || '',
      parentMeter: row['Parent Meter'] || '',
      label: row.Label || '',
      monthlyData,
      totalConsumption,
      averageMonthly,
      status,
      trend
    }
  })
}

// Filter data to exclude specific meters and focus on zone bulks
export const filterWaterData = (data: WaterConsumptionData[]): WaterConsumptionData[] => {
  return data.filter(item => {
    // Get zone config
    const zoneConfig = Object.values(WATER_ZONE_CONFIGS).find(
      config => item.zone === config.name
    )
    
    // Exclude disabled zones
    if (zoneConfig && !zoneConfig.enabled) {
      return false
    }
    
    // Exclude specific meters (4300336 & 4300338)
    if (zoneConfig?.excludedMeters?.includes(item.acctNumber)) {
      return false
    }
    
    // Focus on zone bulks and important meters
    const includedTypes = [
      'Zone Bulk',
      'Zone_Bulk', 
      'Residential (Villa)',
      'Residential (Apart)',
      'Retail',
      'IRR_Servies',
      'MB_Common',
      'D_Building_Common'
    ]
    
    return includedTypes.includes(item.type)
  })
}

// Calculate zone analytics
export const calculateZoneAnalytics = (data: WaterConsumptionData[]): ZoneAnalytics[] => {
  const zoneGroups = data.reduce((acc, item) => {
    if (!acc[item.zone]) {
      acc[item.zone] = []
    }
    acc[item.zone].push(item)
    return acc
  }, {} as Record<string, WaterConsumptionData[]>)
  
  return Object.entries(zoneGroups).map(([zone, items]) => {
    const zoneConfig = Object.values(WATER_ZONE_CONFIGS).find(
      config => config.name === zone
    )
    
    const totalConsumption = items.reduce((sum, item) => sum + item.totalConsumption, 0)
    const averageMonthly = totalConsumption / MONTH_COLUMNS.length
    const highConsumers = items.filter(item => item.status === 'high' || item.status === 'critical').length
    
    // Calculate overall trend
    const increasingCount = items.filter(item => item.trend === 'increasing').length
    const decreasingCount = items.filter(item => item.trend === 'decreasing').length
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (increasingCount > decreasingCount) trend = 'increasing'
    else if (decreasingCount > increasingCount) trend = 'decreasing'
    
    // Calculate efficiency (simple metric based on consumption vs capacity)
    const efficiency = Math.max(0, Math.min(100, 100 - (highConsumers / items.length) * 100))
    
    return {
      zoneName: zoneConfig?.displayName || zone,
      zoneId: zoneConfig?.id || zone.toLowerCase(),
      totalConsumption,
      averageMonthly,
      meterCount: items.length,
      highConsumers,
      trend,
      efficiency
    }
  })
}

// Determine consumption status based on patterns
const determineConsumptionStatus = (
  monthlyData: Record<string, number>, 
  type: string
): 'normal' | 'high' | 'low' | 'critical' => {
  const values = Object.values(monthlyData)
  const average = values.reduce((sum, val) => sum + val, 0) / values.length
  const max = Math.max(...values)
  
  // Different thresholds based on meter type
  let highThreshold: number
  let criticalThreshold: number
  
  switch (type) {
    case 'Zone Bulk':
      highThreshold = 3000
      criticalThreshold = 5000
      break
    case 'Residential (Villa)':
      highThreshold = 150
      criticalThreshold = 300
      break
    case 'Residential (Apart)':
      highThreshold = 50
      criticalThreshold = 100
      break
    case 'Retail':
      highThreshold = 200
      criticalThreshold = 400
      break
    default:
      highThreshold = 100
      criticalThreshold = 200
  }
  
  if (max > criticalThreshold) return 'critical'
  if (average > highThreshold) return 'high'
  if (average < 5) return 'low'
  return 'normal'
}

// Calculate consumption trend over time
const calculateConsumptionTrend = (monthlyData: Record<string, number>): 'increasing' | 'decreasing' | 'stable' => {
  const values = MONTH_COLUMNS.map(month => monthlyData[month] || 0)
  
  // Compare recent 3 months vs previous 3 months
  const recent = values.slice(-3)
  const previous = values.slice(-6, -3)
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length
  const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length
  
  const changePercent = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0
  
  if (changePercent > 10) return 'increasing'
  if (changePercent < -10) return 'decreasing'
  return 'stable'
}

// Get consumption data for chart visualization
export const getConsumptionChartData = (data: WaterConsumptionData[], zoneId?: string) => {
  let filteredData = data
  
  if (zoneId) {
    const zoneConfig = Object.values(WATER_ZONE_CONFIGS).find(config => config.id === zoneId)
    if (zoneConfig) {
      filteredData = data.filter(item => item.zone === zoneConfig.name)
    }
  }
  
  // Aggregate by month
  return MONTH_COLUMNS.map(month => {
    const monthConsumption = filteredData.reduce((sum, item) => {
      return sum + (item.monthlyData[month] || 0)
    }, 0)
    
    return {
      month: month.replace('-', ' '),
      consumption: monthConsumption,
      period: month.includes('24') ? '2024' : '2025'
    }
  })
}

// Get top consumers for a specific zone
export const getTopConsumers = (data: WaterConsumptionData[], zoneId: string, limit: number = 10) => {
  const zoneConfig = Object.values(WATER_ZONE_CONFIGS).find(config => config.id === zoneId)
  if (!zoneConfig) return []
  
  return data
    .filter(item => item.zone === zoneConfig.name)
    .sort((a, b) => b.totalConsumption - a.totalConsumption)
    .slice(0, limit)
}

// Export data to CSV format
export const exportWaterDataToCSV = (data: WaterConsumptionData[]): string => {
  const headers = [
    'Meter Label',
    'Account Number', 
    'Zone',
    'Type',
    'Parent Meter',
    'Total Consumption',
    'Average Monthly',
    'Status',
    'Trend',
    ...MONTH_COLUMNS
  ]
  
  const rows = data.map(item => [
    item.meterLabel,
    item.acctNumber,
    item.zone,
    item.type,
    item.parentMeter,
    item.totalConsumption.toFixed(2),
    item.averageMonthly.toFixed(2),
    item.status,
    item.trend,
    ...MONTH_COLUMNS.map(month => item.monthlyData[month] || 0)
  ])
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
}
