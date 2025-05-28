"use client"

import React, { useState, useMemo } from "react"
import { Droplets, TrendingUp, AlertTriangle, Activity, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell 
} from "recharts"
import { 
  MetricCard, 
  ModuleHeader, 
  FilterBar, 
  StatusBadge, 
  LoadingSkeleton,
  EmptyState 
} from "@/components/shared"
import { 
  useSearchAndFilter, 
  useSorting,
  useNotifications 
} from "@/hooks"
import { WaterAnalysisData, DashboardMetric, ZoneAlert } from "@/lib/types"
import { COLORS } from "@/lib/constants"
import { 
  WATER_ZONE_DATA, 
  ZONE_CONSUMPTION_TRENDS, 
  ZONE_PERFORMANCE_METRICS,
  MONTHLY_ZONE_AGGREGATE,
  ZONE_ALERTS 
} from "@/lib/water-zone-data"

interface WaterAnalysisProps {
  isDarkMode?: boolean
}

export const WaterAnalysisModule: React.FC<WaterAnalysisProps> = ({ isDarkMode = false }) => {
  const [activeTab, setActiveTab] = useState("overview")
  const { addNotification } = useNotifications()

  // Water zone data (Zone Bulks only - 4300336 & 4300338 excluded)
  const waterZoneData = WATER_ZONE_DATA

  // Search and filtering
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    filteredData
  } = useSearchAndFilter(waterZoneData, ['meterLabel', 'zone', 'location'], {
    status: (item, value) => item.status === value,
    zone: (item, value) => item.zone.toLowerCase().includes(value.toLowerCase())
  })

  // Sorting
  const { sortedData, sortField, sortOrder, toggleSort } = useSorting(filteredData, {
    field: 'totalConsumption',
    order: 'desc'
  })

  // Calculate metrics for Zone Bulks
  const metrics: DashboardMetric[] = useMemo(() => {
    const totalConsumption = waterZoneData.reduce((sum, zone) => sum + zone.totalConsumption, 0)
    const averageConsumption = totalConsumption / waterZoneData.length
    const criticalZones = waterZoneData.filter(zone => zone.status === 'critical').length
    const activeZones = waterZoneData.filter(zone => zone.status === 'operational').length

    return [
      {
        id: 'total-consumption',
        title: 'Total Zone Consumption',
        value: totalConsumption.toLocaleString(),
        unit: 'm³',
        icon: 'Droplets',
        color: COLORS.info,
        change: 12.3,
        changeType: 'increase'
      },
      {
        id: 'active-zones',
        title: 'Active Zone Bulks',
        value: activeZones,
        unit: 'zones',
        icon: 'Activity',
        color: COLORS.success
      },
      {
        id: 'average-consumption',
        title: 'Average Zone Consumption',
        value: Math.round(averageConsumption).toLocaleString(),
        unit: 'm³',
        icon: 'BarChart3',
        color: COLORS.primary,
        change: -2.1,
        changeType: 'decrease'
      },
      {
        id: 'critical-alerts',
        title: 'Critical Alerts',
        value: ZONE_ALERTS.filter(alert => alert.type === 'critical' && !alert.resolved).length,
        icon: 'AlertTriangle',
        color: COLORS.error
      }
    ]
  }, [waterZoneData])

  // Chart data for zone consumption trends
  const trendChartData = useMemo(() => {
    return MONTHLY_ZONE_AGGREGATE.map(item => ({
      month: item.month,
      consumption: item.total,
      zones: item.zones
    }))
  }, [])

  // Zone comparison data
  const zoneComparisonData = useMemo(() => {
    return waterZoneData.map(zone => ({
      name: zone.location.replace('Zone ', 'Z'),
      consumption: zone.totalConsumption,
      average: zone.averageMonthly
    })).sort((a, b) => b.consumption - a.consumption)
  }, [waterZoneData])

  const pieChartColors = [COLORS.primary, COLORS.info, COLORS.success, COLORS.warning, COLORS.error, COLORS.teal]

  // Zone status distribution
  const statusDistribution = useMemo(() => {
    const distribution = waterZoneData.reduce((acc, zone) => {
      acc[zone.status] = (acc[zone.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(distribution).map(([status, count], index) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: pieChartColors[index]
    }))
  }, [waterZoneData])

  const renderZoneDetailsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <th className="text-left p-3 font-semibold">Zone</th>
            <th className="text-left p-3 font-semibold">Meter Label</th>
            <th className="text-left p-3 font-semibold">Total Consumption (m³)</th>
            <th className="text-left p-3 font-semibold">Monthly Average (m³)</th>
            <th className="text-left p-3 font-semibold">Current Status</th>
            <th className="text-left p-3 font-semibold">Trend</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((zone) => {
            const trend = ZONE_CONSUMPTION_TRENDS.find(t => t.zone === zone.location)
            return (
              <tr 
                key={zone.id} 
                className={`border-b ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'} transition-colors`}
              >
                <td className="p-3 font-medium">{zone.location}</td>
                <td className="p-3 text-sm">{zone.meterLabel}</td>
                <td className="p-3 font-mono text-right">{zone.totalConsumption.toLocaleString()}</td>
                <td className="p-3 font-mono text-right">{Math.round(zone.averageMonthly).toLocaleString()}</td>
                <td className="p-3">
                  <StatusBadge status={zone.status} />
                </td>
                <td className="p-3">
                  <Badge 
                    variant={
                      trend?.trend === 'increasing' ? 'destructive' :
                      trend?.trend === 'decreasing' ? 'success' :
                      trend?.trend === 'critical' ? 'destructive' : 'default'
                    }
                    className="text-xs"
                  >
                    {trend?.trend || 'stable'}
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Module Header with Metrics */}
      <ModuleHeader
        title="Water Analysis - Zone Details"
        description="Zone bulk water consumption monitoring and analysis (Entries 4300336 & 4300338 excluded)"
        metrics={metrics}
        isDarkMode={isDarkMode}
        actions={
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {ZONE_PERFORMANCE_METRICS.totalZones} Zone Bulks
            </Badge>
          </div>
        }
      />

      {/* Active Alerts */}
      {ZONE_ALERTS.filter(alert => !alert.resolved).length > 0 && (
        <Card className={`border-l-4 border-l-orange-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-orange-50 border-orange-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-orange-500 mt-1" size={20} />
              <div>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Active Zone Alerts
                </h4>
                <div className="mt-2 space-y-1">
                  {ZONE_ALERTS.filter(alert => !alert.resolved).map(alert => (
                    <p key={alert.id} className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className="font-medium">{alert.zone}:</span> {alert.message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          { id: 'status', label: 'Status', value: '' },
          { id: 'zone', label: 'Zone', value: '' }
        ]}
        selectedFilters={Object.entries(filters).map(([k, v]) => `${k}:${v}`)}
        onFilterChange={setFilter}
        onExport={() => console.log('Export zone data')}
        isDarkMode={isDarkMode}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zones">Zone Details</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consumption Trends Chart */}
            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                  Monthly Zone Consumption Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="consumption" 
                      stroke={COLORS.info} 
                      strokeWidth={3}
                      name="Total Consumption (m³)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Zone Comparison Chart */}
            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                  Zone Consumption Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={zoneComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="consumption" fill={COLORS.primary} name="Total Consumption (m³)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Zone Status Distribution */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                Zone Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="space-y-6">
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                Zone Bulk Details
              </CardTitle>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Comprehensive view of all zone bulk meters (excluding entries 4300336 & 4300338)
              </p>
            </CardHeader>
            <CardContent>
              {renderZoneDetailsTable()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                Zone Consumption Trends Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ZONE_CONSUMPTION_TRENDS.map((trend, index) => (
                  <div 
                    key={trend.zone}
                    className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {trend.zone}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Jan '24:</span>
                        <span className="font-mono">{trend.jan24.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Current:</span>
                        <span className="font-mono">{trend.current.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Trend:</span>
                        <Badge 
                          variant={
                            trend.trend === 'increasing' ? 'destructive' :
                            trend.trend === 'decreasing' ? 'success' :
                            trend.trend === 'critical' ? 'destructive' : 'default'
                          }
                          className="text-xs"
                        >
                          {trend.trend}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Total Zones:</span>
                    <span className="font-semibold">{ZONE_PERFORMANCE_METRICS.totalZones}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Total Consumption:</span>
                    <span className="font-semibold">{ZONE_PERFORMANCE_METRICS.totalConsumption.toLocaleString()} m³</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Highest Consumer:</span>
                    <span className="font-semibold">{ZONE_PERFORMANCE_METRICS.highestConsumer}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Lowest Consumer:</span>
                    <span className="font-semibold">{ZONE_PERFORMANCE_METRICS.lowestConsumer}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Critical Zones:</span>
                    <span className="font-semibold text-red-500">{ZONE_PERFORMANCE_METRICS.criticalZones.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                    <h4 className="font-semibold text-blue-600 mb-1">Zone 5 Performance</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Highest consuming zone with variable consumption patterns
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                    <h4 className="font-semibold text-red-600 mb-1">Village Square Alert</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Zero consumption detected - requires immediate attention
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <h4 className="font-semibold text-yellow-600 mb-1">Zone 3A Growth</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      227% consumption increase since Jan '24
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WaterAnalysisModule
