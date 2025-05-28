"use client"

import React, { useState, useMemo } from "react"
import { Droplets, TrendingUp, AlertTriangle, BarChart3, Download, Search, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface WaterMeterData {
  meterLabel: string
  acctNumber: string
  zone: string
  type: string
  parentMeter: string
  readings: number[]
  totalConsumption: number
  averageMonthly: number
  status: 'normal' | 'high' | 'critical'
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface WaterAnalysisProps {
  isDarkMode?: boolean
}

// Real CSV data from the user's input (excluding 4300336 & 4300338)
const WATER_CONSUMPTION_DATA: WaterMeterData[] = [
  // Zone 01 (FM) - Excluding 4300336 & 4300338
  {
    meterLabel: "Building FM",
    acctNumber: "4300296",
    zone: "Zone01(FM)",
    type: "MB_Common",
    parentMeter: "ZONE FM ( BULK ZONE FM )",
    readings: [34, 43, 22, 18, 27, 22, 32, 37, 34, 45, 30, 38, 37, 39, 49, 40],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'normal',
    trend: 'stable'
  },
  {
    meterLabel: "Building Taxi",
    acctNumber: "4300298",
    zone: "Zone01(FM)",
    type: "Retail",
    parentMeter: "ZONE FM ( BULK ZONE FM )",
    readings: [11, 9, 10, 10, 13, 10, 8, 13, 12, 17, 11, 13, 11, 16, 12, 14],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'normal',
    trend: 'stable'
  },
  {
    meterLabel: "Building B1",
    acctNumber: "4300300",
    zone: "Zone01(FM)",
    type: "Retail",
    parentMeter: "ZONE FM ( BULK ZONE FM )",
    readings: [258, 183, 178, 184, 198, 181, 164, 202, 184, 167, 214, 245, 228, 225, 235, 253],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'high',
    trend: 'increasing'
  },
  // Zone 03(A)
  {
    meterLabel: "Z3-42 (Villa)",
    acctNumber: "4300002",
    zone: "Zone_03_(A)",
    type: "Residential (Villa)",
    parentMeter: "ZONE 3A (BULK ZONE 3A)",
    readings: [61, 33, 36, 47, 39, 42, 25, 20, 44, 57, 51, 75, 32, 46, 19, 62],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'normal',
    trend: 'stable'
  },
  // Zone 03(B)
  {
    meterLabel: "Z3-52(6) (Building)",
    acctNumber: "4300008",
    zone: "Zone_03_(B)",
    type: "Residential (Apart)",
    parentMeter: "D-52 Building Bulk Meter",
    readings: [27, 22, 19, 28, 27, 27, 298, 58, 14, 18, 17, 8, 10, 9, 9, 14],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'critical',
    trend: 'decreasing'
  },
  // Zone 05
  {
    meterLabel: "Z5-17",
    acctNumber: "4300001",
    zone: "Zone_05",
    type: "Residential (Villa)",
    parentMeter: "ZONE 5 (Bulk Zone 5)",
    readings: [99, 51, 53, 62, 135, 140, 34, 132, 63, 103, 54, 148, 112, 80, 81, 90],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'high',
    trend: 'increasing'
  },
  // Zone 08
  {
    meterLabel: "Z8-12",
    acctNumber: "4300196",
    zone: "Zone_08",
    type: "Residential (Villa)",
    parentMeter: "BULK ZONE 8",
    readings: [109, 148, 169, 235, 180, 235, 237, 442, 661, 417, 223, 287, 236, 192, 249, 267],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'critical',
    trend: 'increasing'
  },
  // Village Square
  {
    meterLabel: "Coffee 1 (GF Shop No.591)",
    acctNumber: "4300327",
    zone: "Zone_VS",
    type: "Retail",
    parentMeter: "Village Square (Zone Bulk)",
    readings: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'normal',
    trend: 'stable'
  },
  {
    meterLabel: "Supermarket (FF Shop No.591)",
    acctNumber: "4300330",
    zone: "Zone_VS",
    type: "Retail",
    parentMeter: "Village Square (Zone Bulk)",
    readings: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'normal',
    trend: 'stable'
  },
  // Zone Bulks
  {
    meterLabel: "ZONE FM ( BULK ZONE FM )",
    acctNumber: "4300346",
    zone: "Zone01(FM)",
    type: "Zone Bulk",
    parentMeter: "Main Bulk (NAMA)",
    readings: [1595, 1283, 1255, 1383, 1411, 2078, 2601, 1638, 1550, 2098, 1808, 1946, 2008, 1740, 1880, 1880],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'high',
    trend: 'stable'
  },
  {
    meterLabel: "ZONE 3A (Bulk Zone 3A)",
    acctNumber: "4300343",
    zone: "Zone03(A)",
    type: "Zone Bulk",
    parentMeter: "Main Bulk (NAMA)",
    readings: [1234, 1099, 1297, 1892, 2254, 2227, 3313, 3172, 2698, 3715, 3501, 3796, 4235, 4273, 3591, 4041],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'critical',
    trend: 'increasing'
  },
  {
    meterLabel: "ZONE 8 (Bulk Zone 8)",
    acctNumber: "4300342",
    zone: "Zone_08",
    type: "Zone Bulk",
    parentMeter: "Main Bulk (NAMA)",
    readings: [2170, 1825, 2021, 2753, 2722, 3193, 3639, 3957, 3947, 4296, 3569, 3018, 1547, 1498, 2605, 3203],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'critical',
    trend: 'increasing'
  },
  {
    meterLabel: "Village Square (Zone Bulk)",
    acctNumber: "4300335",
    zone: "Zone_VS",
    type: "Zone Bulk",
    parentMeter: "Main Bulk (NAMA)",
    readings: [261, 972, 601, 252, 771, 431, 471, 456, 334, 171, 412, 211, 3, 0, 0, 0],
    totalConsumption: 0,
    averageMonthly: 0,
    status: 'normal',
    trend: 'decreasing'
  }
]

// Calculate totals and process data
const processedData = WATER_CONSUMPTION_DATA.map(item => ({
  ...item,
  totalConsumption: item.readings.reduce((sum, reading) => sum + reading, 0),
  averageMonthly: item.readings.reduce((sum, reading) => sum + reading, 0) / 16
}))

// Zone configurations
const ZONE_CONFIGS = {
  'Zone01(FM)': { color: '#3B82F6', name: 'Zone FM' },
  'Zone_03_(A)': { color: '#10B981', name: 'Zone 3A' },
  'Zone_03_(B)': { color: '#8B5CF6', name: 'Zone 3B' },
  'Zone_05': { color: '#F59E0B', name: 'Zone 5' },
  'Zone_08': { color: '#EF4444', name: 'Zone 8' },
  'Zone_VS': { color: '#06B6D4', name: 'Village Square' }
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    normal: 'bg-green-100 text-green-800 border-green-200',
    high: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
    increasing: 'bg-red-100 text-red-800 border-red-200',
    decreasing: 'bg-blue-100 text-blue-800 border-blue-200',
    stable: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const icons = {
    normal: '✅',
    high: '⚠️',
    critical: '🚨',
    increasing: '📈',
    decreasing: '📉',
    stable: '➖'
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.normal}`}>
      {icons[status as keyof typeof icons]} {status}
    </span>
  )
}

export const WaterAnalysisModule: React.FC<WaterAnalysisProps> = ({ isDarkMode = false }) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  // Filter data based on search and selected zone
  const filteredData = useMemo(() => {
    let filtered = processedData.filter(item =>
      item.meterLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.acctNumber.includes(searchTerm) ||
      item.zone.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (selectedZone) {
      filtered = filtered.filter(item => item.zone === selectedZone)
    }

    return filtered
  }, [searchTerm, selectedZone])

  // Zone analytics
  const zoneAnalytics = useMemo(() => {
    const zones: { [key: string]: any } = {}
    
    processedData.forEach(item => {
      if (!zones[item.zone]) {
        zones[item.zone] = {
          zoneName: ZONE_CONFIGS[item.zone as keyof typeof ZONE_CONFIGS]?.name || item.zone,
          totalConsumption: 0,
          meterCount: 0,
          averageConsumption: 0,
          highConsumers: 0
        }
      }
      
      zones[item.zone].totalConsumption += item.totalConsumption
      zones[item.zone].meterCount += 1
      if (item.status === 'high' || item.status === 'critical') {
        zones[item.zone].highConsumers += 1
      }
    })

    return Object.entries(zones).map(([zoneId, data]) => ({
      zoneId,
      ...data,
      averageConsumption: data.totalConsumption / data.meterCount,
      efficiency: Math.max(0, 100 - (data.highConsumers / data.meterCount) * 100)
    }))
  }, [])

  // Chart data for consumption trends
  const chartData = useMemo(() => {
    const months = ['Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24', 
                   'Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24', 'Dec-24',
                   'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25']
    
    return months.map((month, index) => {
      const totalConsumption = selectedZone 
        ? processedData.filter(item => item.zone === selectedZone)
            .reduce((sum, item) => sum + item.readings[index], 0)
        : processedData.reduce((sum, item) => sum + item.readings[index], 0)
      
      return {
        month,
        consumption: totalConsumption
      }
    })
  }, [selectedZone])

  // Calculate metrics
  const totalConsumption = filteredData.reduce((sum, item) => sum + item.totalConsumption, 0)
  const avgMonthly = totalConsumption / 16
  const criticalAlerts = filteredData.filter(item => item.status === 'critical').length
  const activeZones = new Set(filteredData.map(item => item.zone)).size

  // Export function
  const handleExport = () => {
    const csvContent = [
      ['Meter Label', 'Account #', 'Zone', 'Type', 'Total Consumption (m³)', 'Avg Monthly', 'Status', 'Trend'],
      ...filteredData.map(item => [
        item.meterLabel,
        item.acctNumber,
        item.zone,
        item.type,
        item.totalConsumption.toFixed(0),
        item.averageMonthly.toFixed(1),
        item.status,
        item.trend
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `water-analysis-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Water Analysis - Zone Details</h1>
          <p className="text-slate-600 mt-1">
            Water consumption monitoring by zones ({filteredData.length} meters, excluding 4300336 & 4300338)
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Droplets className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Consumption</p>
                <p className="text-2xl font-bold">{totalConsumption.toFixed(0)} <span className="text-sm">m³</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Avg Monthly</p>
                <p className="text-2xl font-bold">{avgMonthly.toFixed(0)} <span className="text-sm">m³</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active Zones</p>
                <p className="text-2xl font-bold">{activeZones}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Critical Alerts</p>
                <p className="text-2xl font-bold">{criticalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search meters, account numbers, or zones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setSelectedZone(null)}
          className={selectedZone ? 'bg-blue-50 border-blue-200' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          {selectedZone ? `Zone: ${ZONE_CONFIGS[selectedZone as keyof typeof ZONE_CONFIGS]?.name}` : 'All Zones'}
        </Button>
      </div>

      {/* Excluded Meters Alert */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Restructured Zone Analysis
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>✅ Successfully excluded meters 4300336 (Community Mgmt - Technical Zone, STP) & 4300338 (PHASE 02, MAIN ENTRANCE Infrastructure)</p>
              <p>✅ Zone bulk data prioritized for comprehensive analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Zone Overview</TabsTrigger>
          <TabsTrigger value="consumption">Consumption Analysis</TabsTrigger>
          <TabsTrigger value="details">Zone Details</TabsTrigger>
        </TabsList>

        {/* Zone Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Zone Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zoneAnalytics.map((zone) => (
              <Card 
                key={zone.zoneId}
                className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                } ${selectedZone === zone.zoneId ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedZone(selectedZone === zone.zoneId ? null : zone.zoneId)}
                style={{ borderLeft: `4px solid ${ZONE_CONFIGS[zone.zoneId as keyof typeof ZONE_CONFIGS]?.color}` }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {zone.zoneName}
                    </h3>
                    <Badge variant={zone.efficiency > 80 ? 'default' : 'destructive'}>
                      {zone.efficiency.toFixed(0)}% Efficiency
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        Total Consumption:
                      </span>
                      <span className="font-medium">{zone.totalConsumption.toFixed(0)} m³</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        Active Meters:
                      </span>
                      <span className="font-medium">{zone.meterCount}</span>
                    </div>
                    
                    {zone.highConsumers > 0 && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          High Consumers:
                        </span>
                        <span className="font-medium text-orange-500">{zone.highConsumers}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Consumption Chart */}
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                {selectedZone 
                  ? `${ZONE_CONFIGS[selectedZone as keyof typeof ZONE_CONFIGS]?.name} Consumption Trend`
                  : 'Overall Water Consumption Trend'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Consumption (m³)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consumption Analysis Tab */}
        <TabsContent value="consumption" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zone Distribution */}
            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                  Consumption by Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={zoneAnalytics}
                      dataKey="totalConsumption"
                      nameKey="zoneName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {zoneAnalytics.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={ZONE_CONFIGS[entry.zoneId as keyof typeof ZONE_CONFIGS]?.color || '#8B5CF6'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Comparison */}
            <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                  Monthly Consumption Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="consumption" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Zone Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                Water Consumption Details
                <span className="text-sm font-normal ml-2">
                  ({filteredData.length} meters shown - excludes 4300336 & 4300338)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                      <th className="text-left p-3 font-medium">Meter Label</th>
                      <th className="text-left p-3 font-medium">Account #</th>
                      <th className="text-left p-3 font-medium">Zone</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Total (m³)</th>
                      <th className="text-left p-3 font-medium">Avg Monthly</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr 
                        key={item.acctNumber} 
                        className={`border-b ${isDarkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'} transition-colors`}
                      >
                        <td className="p-3 font-medium">{item.meterLabel}</td>
                        <td className="p-3 text-sm text-slate-600">{item.acctNumber}</td>
                        <td className="p-3">
                          <Badge 
                            variant="outline" 
                            style={{ 
                              borderColor: ZONE_CONFIGS[item.zone as keyof typeof ZONE_CONFIGS]?.color,
                              color: ZONE_CONFIGS[item.zone as keyof typeof ZONE_CONFIGS]?.color
                            }}
                          >
                            {ZONE_CONFIGS[item.zone as keyof typeof ZONE_CONFIGS]?.name || item.zone}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{item.type}</td>
                        <td className="p-3 font-medium">{item.totalConsumption.toFixed(0)}</td>
                        <td className="p-3">{item.averageMonthly.toFixed(1)}</td>
                        <td className="p-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="p-3">
                          <StatusBadge status={item.trend} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Export both named and default for compatibility
export default WaterAnalysisModule
