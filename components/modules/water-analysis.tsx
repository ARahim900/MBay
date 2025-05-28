"use client"

import { useState, useEffect, useMemo } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Label,
} from "recharts"
import {
  ArrowDownRight,
  BarChart3,
  Calendar,
  Filter,
  Database,
  AlertTriangle,
  ChevronDown,
  X,
  Sparkles,
  Search,
  LayoutDashboard,
  Users2,
  Building,
  TrendingUp,
  Activity,
  Droplets,
  ArrowUpRight,
} from "lucide-react"
import { COLORS } from "@/lib/constants"
import {
  WATER_DATA_CSV_URL,
  AVAILABLE_MONTHS,
  parseCSVData,
  calculateZoneAnalysis,
  getUniqueZones,
  filterDataByZone,
  getConsumptionByType,
  getCustomerDetails,
  type WaterDataRow,
  getDCBreakdown,
  getCurrentMonthData,
  MONTHLY_TRENDS_DATA,
  getDetailedZoneAnalysis,
  getZoneMeterHierarchy,
} from "@/lib/water-data"

// ===============================
// SHARED COMPONENTS
// ===============================

const SummaryCard = ({ title, value, icon, unit, trend, trendColor, iconBgColor, isLoading }) => {
  const IconComponent = icon
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-slate-100">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-slate-500 font-semibold text-md">{title}</h3>
        <div
          className={`p-3 rounded-full text-white shadow-md`}
          style={{ backgroundColor: iconBgColor || COLORS.primary }}
        >
          <IconComponent size={22} />
        </div>
      </div>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
        </div>
      ) : (
        <>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1.5">
            {value} <span className="text-base font-medium text-slate-500">{unit}</span>
          </p>
          {trend && <p className={`text-xs sm:text-sm font-medium ${trendColor}`}>{trend}</p>}
        </>
      )}
    </div>
  )
}

const ChartWrapper = ({ title, children, subtitle, actions }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-semibold text-slate-700">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
    <div className="mt-4" style={{ height: "350px" }}>
      {children}
    </div>
  </div>
)

const StyledSelect = ({ label, value, onChange, options, id, icon: Icon, disabled = false }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="appearance-none w-full p-2.5 pr-10 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:outline-none bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            "--tw-ring-color": COLORS.primaryLight,
            borderColor: "rgb(203 213 225 / 1)",
            ringColor: COLORS.primaryLight,
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          {Icon ? <Icon size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
    </div>
  )
}

const LoadingSpinner = ({ size = 24 }) => (
  <div className="flex justify-center items-center">
    <div
      className="animate-spin rounded-full border-4 border-slate-200 border-t-primary"
      style={{
        width: size,
        height: size,
        borderTopColor: COLORS.primary,
      }}
    ></div>
  </div>
)

// ===============================
// MAIN WATER ANALYSIS COMPONENT
// ===============================

const WaterAnalysisDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [activeMonthFilter, setActiveMonthFilter] = useState("Apr-25")
  const [activeZoneFilter, setActiveZoneFilter] = useState("All Zones")
  const [waterData, setWaterData] = useState<WaterDataRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Load water data from CSV
  useEffect(() => {
    const loadWaterData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(WATER_DATA_CSV_URL)
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`)
        }

        const csvText = await response.text()
        const parsedData = parseCSVData(csvText)

        setWaterData(parsedData)
        console.log("Loaded water data:", parsedData.length, "records")
      } catch (err) {
        console.error("Error loading water data:", err)
        setError(err instanceof Error ? err.message : "Failed to load water data")
      } finally {
        setIsLoading(false)
      }
    }

    loadWaterData()
  }, [])

  // Calculate derived data using predefined trends
  const monthlyTrends = useMemo(() => {
    return MONTHLY_TRENDS_DATA
  }, [])

  const currentMonthData = useMemo(() => {
    return getCurrentMonthData(activeMonthFilter) || MONTHLY_TRENDS_DATA[MONTHLY_TRENDS_DATA.length - 1]
  }, [activeMonthFilter])

  const zoneAnalysis = useMemo(() => {
    if (!waterData.length) return []
    return calculateZoneAnalysis(waterData, activeMonthFilter)
  }, [waterData, activeMonthFilter])

  const uniqueZones = useMemo(() => {
    if (!waterData.length) return []
    return getUniqueZones(waterData)
  }, [waterData])

  const filteredData = useMemo(() => {
    return filterDataByZone(waterData, activeZoneFilter)
  }, [waterData, activeZoneFilter])

  const consumptionByType = useMemo(() => {
    if (!waterData.length) return []
    return getConsumptionByType(waterData, activeMonthFilter)
  }, [waterData, activeMonthFilter])

  const customerDetails = useMemo(() => {
    if (!waterData.length) return []
    return getCustomerDetails(waterData, activeZoneFilter, activeMonthFilter)
  }, [waterData, activeZoneFilter, activeMonthFilter])

  const dcBreakdown = useMemo(() => {
    if (!waterData.length) return []
    return getDCBreakdown(waterData, activeMonthFilter)
  }, [waterData, activeMonthFilter])

  const detailedZoneAnalysis = useMemo(() => {
    if (!waterData.length) return []
    return getDetailedZoneAnalysis(waterData, activeMonthFilter)
  }, [waterData, activeMonthFilter])

  const zoneMeterHierarchy = useMemo(() => {
    if (!waterData.length || activeZoneFilter === "All Zones") return null
    return getZoneMeterHierarchy(waterData, activeZoneFilter, activeMonthFilter)
  }, [waterData, activeZoneFilter, activeMonthFilter])

  // AI Analysis Handler
  const handleAiAnalysis = async () => {
    if (!currentMonthData) return

    setIsAiModalOpen(true)
    setIsAiLoading(true)
    setAiAnalysisResult("")

    setTimeout(() => {
      const efficiency = currentMonthData.efficiency.toFixed(1)
      const totalLoss = currentMonthData.totalLoss.toLocaleString()
      const lossPercentage = ((currentMonthData.totalLoss / currentMonthData.A) * 100).toFixed(1)

      // Find highest loss zone
      const highestLossZone = zoneAnalysis.reduce(
        (max, zone) => (zone.lossPercentage > max.lossPercentage ? zone : max),
        zoneAnalysis[0] || { zone: "N/A", lossPercentage: 0 },
      )

      setAiAnalysisResult(`AI Analysis Results for Water System - ${activeMonthFilter}:

🔍 SYSTEM OVERVIEW (A-B-C Model):
• A (Main Bulk Supply): ${currentMonthData.A.toLocaleString()} m³
• B (Zone Distribution + DC): ${currentMonthData.B.toLocaleString()} m³
• C (Individual Consumption + DC): ${currentMonthData.C.toLocaleString()} m³
• System efficiency: ${efficiency}% (C/A ratio)

📊 LOSS ANALYSIS:
• Stage 1 Loss (A-B): ${Math.abs(currentMonthData.lossStage1).toLocaleString()} m³ ${currentMonthData.lossStage1 < 0 ? "(Negative - Possible measurement error)" : ""}
• Stage 2 Loss (B-C): ${currentMonthData.lossStage2.toLocaleString()} m³
• Total Loss (A-C): ${totalLoss} m³ (${lossPercentage}% of supply)

⚡ KEY INSIGHTS:
• ${currentMonthData.lossStage2 > Math.abs(currentMonthData.lossStage1) ? "Distribution network losses exceed transmission losses" : "Transmission losses are significant"}
• ${currentMonthData.lossStage1 < 0 ? "Negative Stage 1 loss indicates possible measurement discrepancies or data collection issues" : "Stage 1 losses are within normal range"}
• ${efficiency > 85 ? "System efficiency is excellent" : efficiency > 70 ? "System efficiency is good" : efficiency > 60 ? "System efficiency needs improvement" : "System efficiency is poor"}
• Highest loss zone: ${highestLossZone.zone} (${highestLossZone.lossPercentage.toFixed(1)}%)

💰 RECOMMENDATIONS:
• ${currentMonthData.lossStage1 < 0 ? "Investigate measurement accuracy between A and B points" : "Focus on transmission infrastructure improvements"}
• Implement real-time monitoring for B-C loss reduction
• Consider pressure management systems in high-loss zones
• Regular calibration of measurement equipment
• Implement leak detection programs in distribution networks`)

      setIsAiLoading(false)
    }, 2500)
  }

  // Sub-navigation for water module
  const WaterSubNav = () => {
    const subSections = [
      { name: "Overview", id: "overview", icon: LayoutDashboard },
      { name: "Zone Analysis", id: "zone-analysis", icon: Building },
      { name: "Type Analysis", id: "type-analysis", icon: BarChart3 },
      { name: "Customer Details", id: "customer-details", icon: Users2 },
    ]

    return (
      <div className="mb-6 print:hidden flex justify-center">
        <div className="bg-white shadow-md rounded-full p-1.5 inline-flex space-x-1 border border-slate-200">
          {subSections.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-all duration-200 ease-in-out transform hover:scale-105`}
                style={{
                  backgroundColor: isActive ? COLORS.primary : "transparent",
                  color: isActive ? "white" : COLORS.primaryDark,
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = COLORS.primaryLight
                  if (!isActive) e.currentTarget.style.color = "white"
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent"
                  if (!isActive) e.currentTarget.style.color = COLORS.primaryDark
                }}
              >
                <tab.icon size={18} style={{ color: isActive ? "white" : COLORS.primary }} />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Filter Bar Component
  const FilterBar = () => {
    const monthOptions = AVAILABLE_MONTHS.map((month) => ({
      value: month,
      label: month.replace("-", " "),
    })).reverse() // Show newest first

    const zoneOptions = [
      { value: "All Zones", label: "All Zones" },
      ...uniqueZones.map((zone) => ({ value: zone, label: zone })),
    ]

    return (
      <div className="bg-white shadow p-4 rounded-lg mb-6 print:hidden sticky top-[110px] md:top-[88px] z-10 border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <StyledSelect
            id="monthFilter"
            label="Filter by Month"
            value={activeMonthFilter}
            onChange={(e) => setActiveMonthFilter(e.target.value)}
            options={monthOptions}
            icon={Calendar}
            disabled={isLoading}
          />
          <StyledSelect
            id="zoneFilter"
            label="Filter by Zone"
            value={activeZoneFilter}
            onChange={(e) => setActiveZoneFilter(e.target.value)}
            options={zoneOptions}
            icon={Building}
            disabled={isLoading}
          />
          <button
            onClick={() => {
              setActiveMonthFilter("Apr-25")
              setActiveZoneFilter("All Zones")
            }}
            disabled={isLoading}
            className="text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 h-[46px] w-full lg:w-auto hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: COLORS.primaryDark }}
            onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = COLORS.primary)}
            onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = COLORS.primaryDark)}
          >
            <Filter size={16} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-800">Data Loading Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner size={64} />
        <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: COLORS.primary }}>
          Loading Water Management System
        </h2>
        <p className="text-slate-500">Fetching real-time water data...</p>
      </div>
    )
  }

  // Render the selected tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewSection
            currentMonthData={currentMonthData}
            monthlyTrends={monthlyTrends}
            zoneAnalysis={zoneAnalysis}
            consumptionByType={consumptionByType}
            activeMonthFilter={activeMonthFilter}
            dcBreakdown={dcBreakdown}
          />
        )
      case "zone-analysis":
        return (
          <ZoneAnalysisSection
            zoneAnalysis={zoneAnalysis}
            monthlyTrends={monthlyTrends}
            activeMonthFilter={activeMonthFilter}
            activeZoneFilter={activeZoneFilter}
            detailedZoneAnalysis={detailedZoneAnalysis}
            zoneMeterHierarchy={zoneMeterHierarchy}
          />
        )
      case "type-analysis":
        return (
          <TypeAnalysisSection
            consumptionByType={consumptionByType}
            waterData={waterData}
            activeMonthFilter={activeMonthFilter}
          />
        )
      case "customer-details":
        return (
          <CustomerDetailsSection
            customerDetails={customerDetails}
            activeMonthFilter={activeMonthFilter}
            activeZoneFilter={activeZoneFilter}
          />
        )
      default:
        return (
          <OverviewSection
            currentMonthData={currentMonthData}
            monthlyTrends={monthlyTrends}
            zoneAnalysis={zoneAnalysis}
            consumptionByType={consumptionByType}
            activeMonthFilter={activeMonthFilter}
            dcBreakdown={dcBreakdown}
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      <WaterSubNav />
      <FilterBar />

      {activeTab === "overview" && (
        <div className="mb-6">
          <button
            onClick={handleAiAnalysis}
            disabled={!currentMonthData || isAiLoading}
            className="flex items-center justify-center space-x-2 text-white py-2.5 px-5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: COLORS.primary }}
            onMouseOver={(e) => !isAiLoading && (e.currentTarget.style.backgroundColor = COLORS.primaryDark)}
            onMouseOut={(e) => !isAiLoading && (e.currentTarget.style.backgroundColor = COLORS.primary)}
          >
            <Sparkles size={18} />
            <span>{isAiLoading ? "Analyzing..." : "🤖 AI Water System Analysis"}</span>
          </button>
        </div>
      )}

      {renderTabContent()}

      {/* AI Analysis Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
                🤖 AI Water System Analysis
              </h3>
              <button onClick={() => setIsAiModalOpen(false)} className="p-1 rounded-full hover:bg-slate-200">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            {isAiLoading ? (
              <div className="text-center py-8">
                <Sparkles size={48} className="mx-auto animate-pulse" style={{ color: COLORS.primaryLight }} />
                <p className="mt-2 text-slate-600">AI is analyzing water system data...</p>
              </div>
            ) : (
              <div className="text-sm text-slate-700 space-y-3 whitespace-pre-wrap leading-relaxed">
                {aiAnalysisResult ? (
                  aiAnalysisResult.split("\n").map((line, index) => (
                    <p
                      key={index}
                      className={
                        line.startsWith("🔍") || line.startsWith("📊") || line.startsWith("⚡") || line.startsWith("💰")
                          ? "font-semibold text-slate-800 mt-4"
                          : line.startsWith("•")
                            ? "ml-4 text-slate-600"
                            : ""
                      }
                    >
                      {line}
                    </p>
                  ))
                ) : (
                  <p>No analysis available or an error occurred.</p>
                )}
              </div>
            )}
            <div className="mt-6 text-right">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: COLORS.primary }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = COLORS.primaryDark)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary)}
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== OVERVIEW SECTION =====
const OverviewSection = ({
  currentMonthData,
  monthlyTrends,
  zoneAnalysis,
  consumptionByType,
  activeMonthFilter,
  dcBreakdown,
}) => {
  if (!currentMonthData) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500">No data available for the selected month.</p>
      </div>
    )
  }

  const efficiency = currentMonthData.efficiency

  return (
    <div className="space-y-6">
      {/* Updated KPI Cards as per your specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard
          title="A (Main Bulk Supply)"
          value={currentMonthData.A.toLocaleString()}
          unit="m³"
          trend={`Total water supply for ${activeMonthFilter}`}
          trendColor="text-blue-600"
          icon={Database}
          iconBgColor={COLORS.info}
        />
        <SummaryCard
          title="B (Zone + DC)"
          value={currentMonthData.B.toLocaleString()}
          unit="m³"
          trend={`Zone distribution + DC for ${activeMonthFilter}`}
          trendColor="text-orange-600"
          icon={Building}
          iconBgColor={COLORS.warning}
        />
        <SummaryCard
          title="C (Individual + DC)"
          value={currentMonthData.C.toLocaleString()}
          unit="m³"
          trend={`End user consumption + DC for ${activeMonthFilter}`}
          trendColor="text-green-600"
          icon={Users2}
          iconBgColor={COLORS.success}
        />
        <SummaryCard
          title="Stage 1 Loss (A-B)"
          value={Math.abs(currentMonthData.lossStage1).toLocaleString()}
          unit="m³"
          trend={
            currentMonthData.lossStage1 < 0
              ? "Negative loss - Check measurements"
              : `${((Math.abs(currentMonthData.lossStage1) / currentMonthData.A) * 100).toFixed(1)}% of total supply`
          }
          trendColor={currentMonthData.lossStage1 < 0 ? "text-purple-600" : "text-red-600"}
          icon={currentMonthData.lossStage1 < 0 ? ArrowUpRight : ArrowDownRight}
          iconBgColor={currentMonthData.lossStage1 < 0 ? COLORS.accent : COLORS.chart[0]}
        />
        <SummaryCard
          title="Stage 2 Loss (B-C)"
          value={currentMonthData.lossStage2.toLocaleString()}
          unit="m³"
          trend={`${((currentMonthData.lossStage2 / currentMonthData.B) * 100).toFixed(1)}% of zone distribution`}
          trendColor="text-red-600"
          icon={ArrowDownRight}
          iconBgColor={COLORS.error}
        />
        <SummaryCard
          title="Total Loss (A-C)"
          value={currentMonthData.totalLoss.toLocaleString()}
          unit="m³"
          trend={`${((currentMonthData.totalLoss / currentMonthData.A) * 100).toFixed(1)}% of total supply`}
          trendColor="text-red-600"
          icon={AlertTriangle}
          iconBgColor={COLORS.chart[1]}
        />
      </div>

      {/* System Efficiency Card */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <SummaryCard
          title="System Efficiency (C/A)"
          value={efficiency.toFixed(1)}
          unit="%"
          trend={
            efficiency > 85
              ? "Excellent efficiency"
              : efficiency > 70
                ? "Good efficiency"
                : efficiency > 60
                  ? "Needs improvement"
                  : "Poor efficiency"
          }
          trendColor={
            efficiency > 85
              ? "text-green-600"
              : efficiency > 70
                ? "text-yellow-600"
                : efficiency > 60
                  ? "text-orange-600"
                  : "text-red-600"
          }
          icon={Activity}
          iconBgColor={COLORS.primary}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends - Updated to show A, B, C */}
        <ChartWrapper
          title="Monthly Water Flow Trends (A-B-C Model)"
          subtitle="Main supply, zone distribution, and consumption"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  borderColor: "#e2e8f0",
                }}
                formatter={(value, name) => [`${value.toLocaleString()} m³`, name]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey="A"
                stroke={COLORS.info}
                strokeWidth={3}
                dot={{ r: 3 }}
                name="A (Main Bulk)"
              />
              <Line
                type="monotone"
                dataKey="B"
                stroke={COLORS.warning}
                strokeWidth={3}
                dot={{ r: 3 }}
                name="B (Zone + DC)"
              />
              <Line
                type="monotone"
                dataKey="C"
                stroke={COLORS.success}
                strokeWidth={3}
                dot={{ r: 3 }}
                name="C (Individual + DC)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* System Efficiency Trend */}
        <ChartWrapper title="System Efficiency Trend (C/A)" subtitle="Monthly efficiency percentage">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis
                domain={[0, 100]}
                label={{ value: "Efficiency %", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  borderColor: "#e2e8f0",
                }}
                formatter={(value) => [`${value.toFixed(1)}%`, "Efficiency (C/A)"]}
              />
              <Area
                type="monotone"
                dataKey="efficiency"
                stroke={COLORS.accent}
                fillOpacity={1}
                fill="url(#colorEfficiency)"
                name="System Efficiency"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Loss Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Loss Analysis */}
        <div className="lg:col-span-3">
          <ChartWrapper title="Water Loss Analysis (A-B-C Model)" subtitle="Stage 1 vs Stage 2 losses over time">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    borderColor: "#e2e8f0",
                  }}
                  formatter={(value, name) => [`${value.toLocaleString()} m³`, name]}
                />
                <Legend />
                <Bar dataKey="lossStage1" fill={COLORS.chart[0]} name="Stage 1 Loss (A-B)" />
                <Bar dataKey="lossStage2" fill={COLORS.chart[1]} name="Stage 2 Loss (B-C)" />
                <Line
                  type="monotone"
                  dataKey="totalLoss"
                  stroke={COLORS.error}
                  strokeWidth={2}
                  name="Total Loss (A-C)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>

        {/* Consumption by Type */}
        <div className="lg:col-span-2">
          <ChartWrapper title="Consumption by Type" subtitle={`For ${activeMonthFilter}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={consumptionByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {consumptionByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                  ))}
                  <Label
                    value={`${consumptionByType.reduce((sum, item) => sum + item.value, 0).toLocaleString()}`}
                    position="centerBottom"
                    dy={-5}
                    className="text-2xl font-bold fill-slate-700"
                  />
                  <Label value="Total m³" position="centerTop" dy={10} className="text-xs fill-slate-500" />
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value.toLocaleString()} m³`, "Consumption"]}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    borderColor: "#e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>
      </div>

      {/* Monthly Data Table */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Monthly Water Flow Summary (A-B-C Model)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-100">
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Month
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  A (Main Bulk)
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  B (Zone + DC)
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  C (Individual + DC)
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Loss Stage 1 (A-B)
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Loss Stage 2 (B-C)
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Total Loss (A-C)
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Efficiency %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {monthlyTrends.map((trend) => (
                <tr
                  key={trend.month}
                  className={`hover:bg-slate-50 ${trend.month === activeMonthFilter ? "bg-blue-50" : ""}`}
                >
                  <td className="py-3 px-4 text-sm font-medium text-slate-900">{trend.month}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{trend.A.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{trend.B.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{trend.C.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`${trend.lossStage1 < 0 ? "text-purple-600" : "text-red-600"} font-medium`}>
                      {Math.abs(trend.lossStage1).toLocaleString()}
                      {trend.lossStage1 < 0 && " (-)"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-red-600 font-medium">{trend.lossStage2.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-red-600 font-medium">{trend.totalLoss.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trend.efficiency > 85
                          ? "bg-green-100 text-green-800"
                          : trend.efficiency > 70
                            ? "bg-yellow-100 text-yellow-800"
                            : trend.efficiency > 60
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {trend.efficiency.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone Loss Analysis */}
      <ChartWrapper title="Loss Percentage by Zone" subtitle={`For ${activeMonthFilter}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={zoneAnalysis.filter((zone) => zone.L2 > 0)}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis dataKey="zone" type="category" tick={{ fontSize: 12, fill: "#64748b" }} width={95} />
            <Tooltip
              formatter={(value) => [`${value.toFixed(1)}%`, "Loss Percentage"]}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                borderColor: "#e2e8f0",
              }}
            />
            <Bar dataKey="lossPercentage" fill={COLORS.error} radius={[0, 4, 4, 0]} name="Loss %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </div>
  )
}

// Keep the existing ZoneAnalysisSection, TypeAnalysisSection, and CustomerDetailsSection unchanged
// ... (rest of the sections remain the same)

// ===== ENHANCED ZONE ANALYSIS SECTION =====
const ZoneAnalysisSection = ({
  zoneAnalysis,
  monthlyTrends,
  activeMonthFilter,
  activeZoneFilter,
  detailedZoneAnalysis,
  zoneMeterHierarchy,
}) => {
  const [selectedZoneTab, setSelectedZoneTab] = useState("overview")

  const filteredZoneAnalysis =
    activeZoneFilter === "All Zones" ? zoneAnalysis : zoneAnalysis.filter((zone) => zone.zone === activeZoneFilter)

  const filteredDetailedAnalysis =
    activeZoneFilter === "All Zones"
      ? detailedZoneAnalysis
      : detailedZoneAnalysis.filter((zone) => zone.zone === activeZoneFilter)

  // Zone sub-navigation
  const ZoneSubNav = () => {
    const zoneTabs = [
      { name: "Overview", id: "overview", icon: LayoutDashboard },
      { name: "Bulk vs Individual", id: "bulk-individual", icon: Building },
      { name: "Meter Hierarchy", id: "hierarchy", icon: Users2 },
      { name: "Type Breakdown", id: "type-breakdown", icon: BarChart3 },
    ]

    return (
      <div className="mb-6 flex justify-center">
        <div className="bg-white shadow-md rounded-full p-1.5 inline-flex space-x-1 border border-slate-200">
          {zoneTabs.map((tab) => {
            const isActive = selectedZoneTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedZoneTab(tab.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-2 transition-all duration-200`}
                style={{
                  backgroundColor: isActive ? COLORS.primary : "transparent",
                  color: isActive ? "white" : COLORS.primaryDark,
                }}
              >
                <tab.icon size={16} style={{ color: isActive ? "white" : COLORS.primary }} />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderZoneTabContent = () => {
    switch (selectedZoneTab) {
      case "overview":
        return <ZoneOverviewTab filteredZoneAnalysis={filteredZoneAnalysis} activeMonthFilter={activeMonthFilter} />
      case "bulk-individual":
        return (
          <BulkIndividualTab
            filteredDetailedAnalysis={filteredDetailedAnalysis}
            activeMonthFilter={activeMonthFilter}
          />
        )
      case "hierarchy":
        return <MeterHierarchyTab zoneMeterHierarchy={zoneMeterHierarchy} />
      case "type-breakdown":
        return (
          <TypeBreakdownTab filteredDetailedAnalysis={filteredDetailedAnalysis} activeMonthFilter={activeMonthFilter} />
        )
      default:
        return <ZoneOverviewTab filteredZoneAnalysis={filteredZoneAnalysis} activeMonthFilter={activeMonthFilter} />
    }
  }

  return (
    <div className="space-y-6">
      <ZoneSubNav />
      {renderZoneTabContent()}
    </div>
  )
}

// Zone Overview Tab
const ZoneOverviewTab = ({ filteredZoneAnalysis, activeMonthFilter }) => (
  <div className="space-y-6">
    {/* Zone Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredZoneAnalysis.slice(0, 4).map((zone, index) => (
        <SummaryCard
          key={zone.zone}
          title={zone.zone}
          value={zone.lossPercentage.toFixed(1)}
          unit="%"
          trend={`${zone.totalLoss.toLocaleString()} m³ total loss`}
          trendColor={
            zone.lossPercentage > 50 ? "text-red-600" : zone.lossPercentage > 25 ? "text-yellow-600" : "text-green-600"
          }
          icon={Building}
          iconBgColor={COLORS.chart[index % COLORS.chart.length]}
        />
      ))}
    </div>

    {/* Zone Analysis Table */}
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
      <h3 className="text-xl font-semibold text-slate-700 mb-4">Zone Analysis Summary - {activeMonthFilter}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-slate-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-slate-100">
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">Zone</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                L1 Supply
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                L2 Distribution
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                L3 Consumption
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                Total Loss
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                Loss %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredZoneAnalysis.map((zone) => (
              <tr key={zone.zone} className="hover:bg-slate-50">
                <td className="py-3 px-4 text-sm font-medium text-slate-900">{zone.zone}</td>
                <td className="py-3 px-4 text-sm text-slate-900">{zone.L1.toLocaleString()}</td>
                <td className="py-3 px-4 text-sm text-slate-900">{zone.L2.toLocaleString()}</td>
                <td className="py-3 px-4 text-sm text-slate-900">{zone.L3.toLocaleString()}</td>
                <td className="py-3 px-4 text-sm text-slate-900">{zone.totalLoss.toLocaleString()}</td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      zone.lossPercentage > 50
                        ? "bg-red-100 text-red-800"
                        : zone.lossPercentage > 25
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {zone.lossPercentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Zone Performance Chart */}
    <ChartWrapper title="Zone Performance Comparison" subtitle={`Water flow and losses for ${activeMonthFilter}`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={filteredZoneAnalysis} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="zone" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              borderColor: "#e2e8f0",
            }}
            formatter={(value, name) => [
              name.includes("%") ? `${value.toFixed(1)}%` : `${value.toLocaleString()} m³`,
              name,
            ]}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="L2" fill={COLORS.info} name="L2 Distribution" />
          <Bar yAxisId="left" dataKey="L3" fill={COLORS.success} name="L3 Consumption" />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="lossPercentage"
            stroke={COLORS.error}
            strokeWidth={3}
            name="Loss %"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartWrapper>
  </div>
)

// Bulk vs Individual Tab
const BulkIndividualTab = ({ filteredDetailedAnalysis, activeMonthFilter }) => (
  <div className="space-y-6">
    {/* Bulk vs Individual Summary */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard
        title="Total Zones"
        value={filteredDetailedAnalysis.length.toLocaleString()}
        unit="zones"
        trend="Active zones with data"
        trendColor="text-blue-600"
        icon={Building}
        iconBgColor={COLORS.info}
      />
      <SummaryCard
        title="Total Bulk Consumption"
        value={filteredDetailedAnalysis.reduce((sum, zone) => sum + zone.bulkConsumption, 0).toLocaleString()}
        unit="m³"
        trend="Zone bulk meters total"
        trendColor="text-orange-600"
        icon={Database}
        iconBgColor={COLORS.warning}
      />
      <SummaryCard
        title="Total Individual Consumption"
        value={filteredDetailedAnalysis.reduce((sum, zone) => sum + zone.individualConsumption, 0).toLocaleString()}
        unit="m³"
        trend="Individual meters total"
        trendColor="text-green-600"
        icon={Users2}
        iconBgColor={COLORS.success}
      />
    </div>

    {/* Bulk vs Individual Comparison Chart */}
    <ChartWrapper title="Bulk vs Individual Consumption by Zone" subtitle={`Comparison for ${activeMonthFilter}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filteredDetailedAnalysis} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="zone" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              borderColor: "#e2e8f0",
            }}
            formatter={(value, name) => [`${value.toLocaleString()} m³`, name]}
          />
          <Legend />
          <Bar dataKey="bulkConsumption" fill={COLORS.warning} name="Bulk Meter (L2)" />
          <Bar dataKey="individualConsumption" fill={COLORS.success} name="Individual Meters (L3)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>

    {/* Detailed Zone Analysis Table */}
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
      <h3 className="text-xl font-semibold text-slate-700 mb-4">Bulk vs Individual Analysis - {activeMonthFilter}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-slate-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-slate-100">
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">Zone</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                Bulk Meter
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                Bulk Consumption
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                Individual Total
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                Meter Count
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                Loss (Bulk-Individual)
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                Loss %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredDetailedAnalysis.map((zone) => (
              <tr key={zone.zone} className="hover:bg-slate-50">
                <td className="py-3 px-4 text-sm font-medium text-slate-900">{zone.zone}</td>
                <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate" title={zone.bulkMeter}>
                  {zone.bulkMeter}
                </td>
                <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                  {zone.bulkConsumption.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm text-slate-900">{zone.individualConsumption.toLocaleString()}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{zone.individualMeters.length}</td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`font-medium ${zone.lossAnalysis.bulkToIndividual >= 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {Math.abs(zone.lossAnalysis.bulkToIndividual).toLocaleString()}
                    {zone.lossAnalysis.bulkToIndividual < 0 && " (-)"}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      zone.lossAnalysis.lossPercentage > 30
                        ? "bg-red-100 text-red-800"
                        : zone.lossAnalysis.lossPercentage > 15
                          ? "bg-yellow-100 text-yellow-800"
                          : zone.lossAnalysis.lossPercentage >= 0
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {Math.abs(zone.lossAnalysis.lossPercentage).toFixed(1)}%
                    {zone.lossAnalysis.lossPercentage < 0 && " (-)"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)

// Meter Hierarchy Tab
const MeterHierarchyTab = ({ zoneMeterHierarchy }) => {
  if (!zoneMeterHierarchy) {
    return (
      <div className="text-center py-10">
        <Building size={48} className="mx-auto text-slate-400 mb-4" />
        <p className="text-slate-500">Select a specific zone to view meter hierarchy</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bulk Meter Info */}
      {zoneMeterHierarchy.bulkMeter && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
          <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
            <Database className="mr-2" size={20} style={{ color: COLORS.primary }} />
            Bulk Meter (L2)
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600">Meter Label</p>
                <p className="font-medium text-slate-900">{zoneMeterHierarchy.bulkMeter.meterLabel}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Account Number</p>
                <p className="font-medium text-slate-900">{zoneMeterHierarchy.bulkMeter.acctNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Consumption</p>
                <p className="font-medium text-slate-900">
                  {zoneMeterHierarchy.bulkMeter.consumption.toLocaleString()} m³
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Building Meters */}
      {zoneMeterHierarchy.buildingMeters.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
          <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
            <Building className="mr-2" size={20} style={{ color: COLORS.warning }} />
            Building Meters ({zoneMeterHierarchy.buildingMeters.length})
          </h3>
          <div className="space-y-4">
            {zoneMeterHierarchy.buildingMeters.map((building, index) => (
              <div key={building.meterLabel} className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-slate-900">{building.meterLabel}</h4>
                  <span className="text-sm font-medium text-slate-600">{building.consumption.toLocaleString()} m³</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {building.individualMeters.map((meter) => (
                    <div key={meter.acctNumber} className="bg-slate-50 p-3 rounded">
                      <p className="text-sm font-medium text-slate-900 truncate" title={meter.meterLabel}>
                        {meter.meterLabel}
                      </p>
                      <p className="text-xs text-slate-600">{meter.type}</p>
                      <p className="text-sm font-medium text-slate-700">{meter.consumption.toLocaleString()} m³</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct Meters */}
      {zoneMeterHierarchy.directMeters.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
          <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
            <Users2 className="mr-2" size={20} style={{ color: COLORS.success }} />
            Direct Meters ({zoneMeterHierarchy.directMeters.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zoneMeterHierarchy.directMeters.map((meter) => (
              <div key={meter.acctNumber} className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium text-slate-900 truncate" title={meter.meterLabel}>
                  {meter.meterLabel}
                </p>
                <p className="text-sm text-slate-600">{meter.type}</p>
                <p className="text-sm text-slate-600">#{meter.acctNumber}</p>
                <p className="text-lg font-medium text-slate-900">{meter.consumption.toLocaleString()} m³</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Type Breakdown Tab
const TypeBreakdownTab = ({ filteredDetailedAnalysis, activeMonthFilter }) => (
  <div className="space-y-6">
    {filteredDetailedAnalysis.map((zone) => (
      <div key={zone.zone} className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">{zone.zone} - Type Breakdown</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Type Distribution Chart */}
          <div>
            <h4 className="text-lg font-medium text-slate-700 mb-3">Consumption by Type</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={zone.typeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="consumption"
                  label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                >
                  {zone.typeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value.toLocaleString()} m³`, "Consumption"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Type Details Table */}
          <div>
            <h4 className="text-lg font-medium text-slate-700 mb-3">Type Details</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-200 rounded-lg">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="py-2 px-3 text-left text-sm font-medium text-slate-600">Type</th>
                    <th className="py-2 px-3 text-left text-sm font-medium text-slate-600">Meters</th>
                    <th className="py-2 px-3 text-left text-sm font-medium text-slate-600">Consumption</th>
                    <th className="py-2 px-3 text-left text-sm font-medium text-slate-600">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {zone.typeBreakdown.map((type, index) => (
                    <tr key={type.type} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-sm text-slate-900">{type.type}</td>
                      <td className="py-2 px-3 text-sm text-slate-600">{type.meterCount}</td>
                      <td className="py-2 px-3 text-sm text-slate-900">{type.consumption.toLocaleString()}</td>
                      <td className="py-2 px-3 text-sm">
                        <div className="flex items-center">
                          <div className="w-12 bg-slate-200 rounded-full h-2 mr-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${type.percentage}%`,
                                backgroundColor: COLORS.chart[index % COLORS.chart.length],
                              }}
                            />
                          </div>
                          <span className="text-xs">{type.percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

// ===== TYPE ANALYSIS SECTION =====
const TypeAnalysisSection = ({ consumptionByType, waterData, activeMonthFilter }) => {
  // Calculate historical data for types
  const typeHistoricalData = useMemo(() => {
    const typeMap: Record<string, Record<string, number>> = {}

    waterData.forEach((row) => {
      if (row.label === "L3") {
        const type = row.type || "Unknown"
        if (!typeMap[type]) {
          typeMap[type] = {}
        }

        AVAILABLE_MONTHS.forEach((month) => {
          const value = row.monthlyData[month] || 0
          typeMap[type][month] = (typeMap[type][month] || 0) + value
        })
      }
    })

    return AVAILABLE_MONTHS.map((month) => {
      const monthData = { month }
      Object.keys(typeMap).forEach((type) => {
        monthData[type] = typeMap[type][month] || 0
      })
      return monthData
    })
  }, [waterData])

  return (
    <div className="space-y-6">
      {/* Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Consumption Distribution by Type" subtitle={`For ${activeMonthFilter}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={consumptionByType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {consumptionByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value.toLocaleString()} m³`, "Consumption"]}
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  borderColor: "#e2e8f0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Type Consumption Ranking" subtitle={`For ${activeMonthFilter}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={consumptionByType} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#64748b" }} width={115} />
              <Tooltip
                formatter={(value, name, props) => [
                  `${value.toLocaleString()} m³ (${props.payload.percentage.toFixed(1)}%)`,
                  "Consumption",
                ]}
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  borderColor: "#e2e8f0",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Consumption">
                {consumptionByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Historical Trends by Type */}
      <ChartWrapper title="Historical Consumption Trends by Type" subtitle="Monthly comparison across all types">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={typeHistoricalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                borderColor: "#e2e8f0",
              }}
              formatter={(value, name) => [`${value.toLocaleString()} m³`, name]}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            {consumptionByType.slice(0, 5).map((type, index) => (
              <Area
                key={type.name}
                type="monotone"
                dataKey={type.name}
                stackId="1"
                stroke={COLORS.chart[index % COLORS.chart.length]}
                fill={COLORS.chart[index % COLORS.chart.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Type Details Table */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Consumption Type Details - {activeMonthFilter}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-100">
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Consumption (m³)
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {consumptionByType.map((type, index) => (
                <tr key={type.name} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium text-slate-900">{type.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{type.value.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">
                    <div className="flex items-center">
                      <div className="w-full bg-slate-200 rounded-full h-2 mr-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${type.percentage}%`,
                            backgroundColor: COLORS.chart[index % COLORS.chart.length],
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium">{type.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        type.name.includes("Residential")
                          ? "bg-blue-100 text-blue-800"
                          : type.name.includes("Commercial") || type.name.includes("Retail")
                            ? "bg-purple-100 text-purple-800"
                            : type.name.includes("Industrial")
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {type.name.includes("Residential")
                        ? "Residential"
                        : type.name.includes("Commercial") || type.name.includes("Retail")
                          ? "Commercial"
                          : type.name.includes("Industrial")
                            ? "Industrial"
                            : "Other"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ===== CUSTOMER DETAILS SECTION =====
const CustomerDetailsSection = ({ customerDetails, activeMonthFilter, activeZoneFilter }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const searchedCustomers = customerDetails.filter(
    (customer) =>
      customer.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.zone.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination
  const totalPages = Math.ceil(searchedCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCustomers = searchedCustomers.slice(startIndex, endIndex)

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeZoneFilter])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Customers"
          value={customerDetails.length.toLocaleString()}
          unit="accounts"
          trend={activeZoneFilter === "All Zones" ? "All zones" : activeZoneFilter}
          trendColor="text-blue-600"
          icon={Users2}
          iconBgColor={COLORS.info}
        />
        <SummaryCard
          title="Total Consumption"
          value={customerDetails.reduce((sum, c) => sum + c.consumption, 0).toLocaleString()}
          unit="m³"
          trend={`For ${activeMonthFilter}`}
          trendColor="text-green-600"
          icon={Droplets}
          iconBgColor={COLORS.success}
        />
        <SummaryCard
          title="Average per Customer"
          value={
            customerDetails.length > 0
              ? Math.round(
                  customerDetails.reduce((sum, c) => sum + c.consumption, 0) / customerDetails.length,
                ).toLocaleString()
              : "0"
          }
          unit="m³"
          trend="Monthly average"
          trendColor="text-purple-600"
          icon={TrendingUp}
          iconBgColor={COLORS.accent}
        />
        <SummaryCard
          title="High Consumers"
          value={customerDetails.filter((c) => c.consumption > 100).length.toLocaleString()}
          unit="accounts"
          trend=">100 m³/month"
          trendColor="text-orange-600"
          icon={AlertTriangle}
          iconBgColor={COLORS.warning}
        />
      </div>

      {/* Customer Details Table */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold text-slate-700">
            Customer Details - {activeZoneFilter} ({activeMonthFilter})
          </h3>
          <div className="relative w-full md:w-auto">
            <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers, accounts, or zones..."
              className="pl-11 pr-4 py-2.5 w-full sm:w-64 md:w-80 border border-slate-300 rounded-lg focus:ring-2 outline-none text-sm transition-all"
              style={{ "--tw-ring-color": COLORS.primaryLight }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-100">
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Account #
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Customer/Meter
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Zone
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Consumption (m³)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm font-mono text-slate-900">{customer.id}</td>
                    <td className="py-3 px-4 text-sm text-slate-900 max-w-xs truncate" title={customer.customer}>
                      {customer.customer}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">{customer.zone}</td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.type.includes("Residential")
                            ? "bg-blue-100 text-blue-800"
                            : customer.type.includes("Commercial") || customer.type.includes("Retail")
                              ? "bg-purple-100 text-purple-800"
                              : customer.type.includes("Industrial")
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {customer.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-full bg-slate-200 rounded-full h-2.5 mr-3">
                          <div
                            className="h-2.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (customer.consumption / Math.max(...customerDetails.map((c) => c.consumption))) * 100)}%`,
                              backgroundColor:
                                customer.consumption > 100
                                  ? COLORS.error
                                  : customer.consumption > 50
                                    ? COLORS.warning
                                    : customer.consumption > 0
                                      ? COLORS.success
                                      : "#e2e8f0",
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700 min-w-[60px] text-right">
                          {customer.consumption.toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    {searchTerm ? "No customers found matching your search criteria." : "No customer data available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-slate-600">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">{Math.min(endIndex, searchedCustomers.length)}</span> of{" "}
              <span className="font-medium">{searchedCustomers.length}</span> results
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i
                if (pageNum > totalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className="px-3 py-1 border rounded-md"
                    style={{
                      backgroundColor: currentPage === pageNum ? COLORS.primary : "white",
                      color: currentPage === pageNum ? "white" : "#64748b",
                      borderColor: currentPage === pageNum ? COLORS.primary : "#cbd5e1",
                    }}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Consumers Chart */}
      <ChartWrapper title="Top 10 Water Consumers" subtitle={`Highest consumption for ${activeMonthFilter}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={customerDetails.slice(0, 10)}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis
              dataKey="customer"
              type="category"
              tick={{ fontSize: 10, fill: "#334155", width: 145 }}
              interval={0}
              width={150}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "white", borderRadius: "8px", borderColor: "#e2e8f0" }}
              formatter={(value, name, props) => [
                `${value.toLocaleString()} m³`,
                `${props.payload.zone} - ${props.payload.type}`,
              ]}
            />
            <Bar dataKey="consumption" name="Consumption (m³)" barSize={20} radius={[0, 5, 5, 0]}>
              {customerDetails.slice(0, 10).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </div>
  )
}

export const WaterAnalysisModule = WaterAnalysisDashboard
export default WaterAnalysisDashboard
