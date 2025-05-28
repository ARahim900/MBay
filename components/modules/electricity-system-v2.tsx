"use client"

import React, { useState, useMemo } from "react"
import { Zap, TrendingUp, AlertTriangle, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { 
  MetricCard, 
  ModuleHeader, 
  FilterBar, 
  StatusBadge, 
  LoadingSkeleton,
  EmptyState 
} from "@/components/shared"
import { 
  useDataFetching, 
  usePagination, 
  useSearchAndFilter, 
  useSorting,
  useNotifications 
} from "@/hooks"
import { ElectricityData, DashboardMetric } from "@/lib/types"
import { COLORS, OMR_PER_KWH } from "@/lib/constants"
import { ALERT_THRESHOLDS } from "@/lib/config/modules"

interface ElectricitySystemProps {
  isDarkMode?: boolean
}

export const ElectricitySystemModule: React.FC<ElectricitySystemProps> = ({ isDarkMode = false }) => {
  const [activeTab, setActiveTab] = useState("overview")
  const { addNotification } = useNotifications()
  
  // Data fetching with auto-refresh
  const { 
    data: electricityData, 
    loading, 
    error, 
    lastUpdated, 
    refetch 
  } = useDataFetching<ElectricityData>('/api/electricity', 'electricity', {
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds
  })

  // Search and filtering
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    filteredData
  } = useSearchAndFilter(electricityData, ['location'], {
    status: (item, value) => item.status === value,
    location: (item, value) => item.location.toLowerCase().includes(value.toLowerCase())
  })

  // Sorting
  const { sortedData, sortField, sortOrder, toggleSort } = useSorting(filteredData, {
    field: 'timestamp',
    order: 'desc'
  })

  // Pagination
  const { paginatedData, paginationInfo, goToPage, nextPage, prevPage } = usePagination(
    sortedData,
    'electricity'
  )

  // Calculate metrics
  const metrics: DashboardMetric[] = useMemo(() => {
    if (!electricityData.length) return []

    const totalPower = electricityData.reduce((sum, item) => sum + item.power, 0)
    const averageVoltage = electricityData.reduce((sum, item) => sum + item.voltage, 0) / electricityData.length
    const totalCost = electricityData.reduce((sum, item) => sum + item.cost, 0)
    const criticalCount = electricityData.filter(item => item.status === 'critical').length

    return [
      {
        id: 'total-power',
        title: 'Total Power Consumption',
        value: totalPower.toFixed(1),
        unit: 'kW',
        icon: 'Zap',
        color: COLORS.warning,
        change: 12.5,
        changeType: 'increase'
      },
      {
        id: 'average-voltage',
        title: 'Average Voltage',
        value: averageVoltage.toFixed(1),
        unit: 'V',
        icon: 'TrendingUp',
        color: COLORS.success
      },
      {
        id: 'total-cost',
        title: 'Monthly Cost',
        value: totalCost.toFixed(2),
        unit: 'OMR',
        icon: 'DollarSign',
        color: COLORS.primary,
        change: -5.2,
        changeType: 'decrease'
      },
      {
        id: 'critical-alerts',
        title: 'Critical Alerts',
        value: criticalCount,
        icon: 'AlertTriangle',
        color: COLORS.error
      }
    ]
  }, [electricityData])

  // Chart data preparation
  const chartData = useMemo(() => {
    return electricityData
      .slice(-24) // Last 24 hours
      .map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        power: item.power,
        voltage: item.voltage,
        cost: item.cost
      }))
  }, [electricityData])

  // Alert checking
  React.useEffect(() => {
    electricityData.forEach(item => {
      const thresholds = ALERT_THRESHOLDS.electricity
      
      if (item.voltage < thresholds.voltage.min || item.voltage > thresholds.voltage.max) {
        addNotification('warning', 'Voltage Alert', 
          `Voltage at ${item.location} is ${item.voltage}V (Normal: ${thresholds.voltage.min}-${thresholds.voltage.max}V)`
        )
      }
      
      if (item.power > thresholds.power.max) {
        addNotification('error', 'Power Overload', 
          `Power consumption at ${item.location} exceeds ${thresholds.power.max}kW`
        )
      }
    })
  }, [electricityData, addNotification])

  if (loading) {
    return <LoadingSkeleton type="card" count={4} isDarkMode={isDarkMode} />
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Error Loading Electricity Data"
        description={error}
        action={{
          label: "Retry",
          onClick: refetch
        }}
        isDarkMode={isDarkMode}
      />
    )
  }

  if (!electricityData.length) {
    return (
      <EmptyState
        icon={Zap}
        title="No Electricity Data"
        description="No electricity monitoring data is currently available."
        isDarkMode={isDarkMode}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Module Header with Metrics */}
      <ModuleHeader
        title="Electricity System"
        description="Real-time power infrastructure monitoring and management"
        metrics={metrics}
        isDarkMode={isDarkMode}
        actions={
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">
              Last updated: {lastUpdated?.toLocaleTimeString()}
            </span>
          </div>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          { id: 'status', label: 'Status', value: '' },
          { id: 'location', label: 'Location', value: '' }
        ]}
        selectedFilters={Object.entries(filters).map(([k, v]) => `${k}:${v}`)}
        onFilterChange={setFilter}
        onRefresh={refetch}
        onExport={() => console.log('Export electricity data')}
        isLoading={loading}
        isDarkMode={isDarkMode}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Power Consumption Chart */}
            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                  Power Consumption Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="power" 
                      stroke={COLORS.warning} 
                      strokeWidth={2}
                      name="Power (kW)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Voltage Chart */}
            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                  Voltage Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[200, 250]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="voltage" 
                      stroke={COLORS.success} 
                      strokeWidth={2}
                      name="Voltage (V)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Current Status Table */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                Current System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                      <th className="text-left p-2">Location</th>
                      <th className="text-left p-2">Voltage (V)</th>
                      <th className="text-left p-2">Current (A)</th>
                      <th className="text-left p-2">Power (kW)</th>
                      <th className="text-left p-2">Cost (OMR)</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                      >
                        <td className="p-2 font-medium">{item.location}</td>
                        <td className="p-2">{item.voltage.toFixed(1)}</td>
                        <td className="p-2">{item.current.toFixed(1)}</td>
                        <td className="p-2">{item.power.toFixed(1)}</td>
                        <td className="p-2">{item.cost.toFixed(3)}</td>
                        <td className="p-2">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime">
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                Real-time Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                  Real-time monitoring dashboard coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                Historical Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                  Historical data analysis coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                Advanced Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                  Advanced analytics and insights coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ElectricitySystemModule
