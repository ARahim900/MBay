"use client"

import { useState, useEffect, useMemo } from "react"
import {
  AreaChart,
  Area,
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
  ComposedChart,
} from "recharts"
import {
  Activity,
  AlertTriangle,
  Beaker,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  Droplet,
  Filter,
  FlaskConical,
  HardDrive,
  LayoutDashboard,
  Settings,
  Sparkles,
  ThermometerSun,
  Timer,
  Waves,
  X,
  Zap,
} from "lucide-react"
import { COLORS } from "@/lib/constants"
import {
  calculateSTPPerformanceIndicators,
  getOverallPlantStatus,
  getSTPAlarms,
  getSTPChemicals,
  getSTPCompliance,
  getSTPEquipment,
  getSTPHistoricalData,
  getSTPZones,
  type STPAlarm,
  type STPChemical,
  type STPCompliance,
  type STPEquipment,
  type STPPlantData,
  type STPZone,
} from "@/lib/stp-data"

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

const StatusBadge = ({ status }) => {
  let color = ""
  let bgColor = ""

  switch (status) {
    case "Normal":
    case "Operational":
    case "Compliant":
      color = "text-green-800"
      bgColor = "bg-green-100"
      break
    case "Warning":
      color = "text-yellow-800"
      bgColor = "bg-yellow-100"
      break
    case "Critical":
    case "Fault":
    case "Non-compliant":
      color = "text-red-800"
      bgColor = "bg-red-100"
      break
    case "Maintenance":
      color = "text-blue-800"
      bgColor = "bg-blue-100"
      break
    default:
      color = "text-gray-800"
      bgColor = "bg-gray-100"
  }

  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color} ${bgColor}`}>{status}</span>
}

// ===============================
// MAIN STP PLANT COMPONENT
// ===============================

export const STPPlantModule = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dateRangeFilter, setDateRangeFilter] = useState("last7days")
  const [equipmentFilterType, setEquipmentFilterType] = useState("all")
  const [zoneFilterType, setZoneFilterType] = useState("all")
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Load STP data
  const [isLoading, setIsLoading] = useState(true)
  const [stpData, setStpData] = useState<STPPlantData[]>([])
  const [stpEquipment, setStpEquipment] = useState<STPEquipment[]>([])
  const [stpZones, setStpZones] = useState<STPZone[]>([])
  const [stpChemicals, setStpChemicals] = useState<STPChemical[]>([])
  const [stpAlarms, setStpAlarms] = useState<STPAlarm[]>([])
  const [stpCompliance, setStpCompliance] = useState<STPCompliance[]>([])

  // Load all STP data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Simulate API calls with a small delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const historicalData = getSTPHistoricalData()
        const equipment = getSTPEquipment()
        const zones = getSTPZones()
        const chemicals = getSTPChemicals()
        const alarms = getSTPAlarms()
        const compliance = getSTPCompliance()

        setStpData(historicalData)
        setStpEquipment(equipment)
        setStpZones(zones)
        setStpChemicals(chemicals)
        setStpAlarms(alarms)
        setStpCompliance(compliance)
      } catch (error) {
        console.error("Error loading STP data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Calculate performance indicators
  const performanceIndicators = useMemo(() => {
    return calculateSTPPerformanceIndicators(stpData)
  }, [stpData])

  // Get overall plant status
  const overallPlantStatus = useMemo(() => {
    if (!performanceIndicators?.latestData) return "Unknown"
    return getOverallPlantStatus(performanceIndicators.latestData, stpEquipment, stpZones, stpAlarms)
  }, [performanceIndicators, stpEquipment, stpZones, stpAlarms])

  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (!stpData.length) return []

    switch (dateRangeFilter) {
      case "last7days":
        return stpData.slice(-7)
      case "last14days":
        return stpData.slice(-14)
      case "last30days":
        return stpData
      default:
        return stpData.slice(-7)
    }
  }, [stpData, dateRangeFilter])

  // Filter equipment based on type
  const filteredEquipment = useMemo(() => {
    if (equipmentFilterType === "all") return stpEquipment
    return stpEquipment.filter((eq) => eq.type.toLowerCase().includes(equipmentFilterType.toLowerCase()))
  }, [stpEquipment, equipmentFilterType])

  // Filter zones based on type
  const filteredZones = useMemo(() => {
    if (zoneFilterType === "all") return stpZones
    return stpZones.filter((zone) => zone.type === zoneFilterType)
  }, [stpZones, zoneFilterType])

  // AI Analysis Handler
  const handleAiAnalysis = async () => {
    setIsAiModalOpen(true)
    setIsAiLoading(true)
    setAiAnalysisResult("")

    setTimeout(() => {
      const efficiency = performanceIndicators?.bodEfficiency || 0
      const waterRecovery = performanceIndicators?.waterRecoveryRate || 0

      setAiAnalysisResult(`AI Analysis Results for STP Plant:

🔍 OPERATIONAL OVERVIEW:
• Average inflow: ${performanceIndicators?.avgInflowWeek.toFixed(1)} m³/day
• Average outflow: ${performanceIndicators?.avgOutflowWeek.toFixed(1)} m³/day
• Water recovery rate: ${waterRecovery.toFixed(1)}%
• System uptime: ${performanceIndicators?.uptime.toFixed(1)}%

📊 TREATMENT PERFORMANCE:
• BOD removal efficiency: ${efficiency.toFixed(1)}%
• TSS removal efficiency: ${performanceIndicators?.tssEfficiency.toFixed(1)}%
• Energy efficiency: ${(performanceIndicators?.energyEfficiency || 0).toFixed(2)} m³/kWh
• Overall compliance rate: ${((stpCompliance.filter((c) => c.status === "Compliant").length / stpCompliance.length) * 100).toFixed(1)}%

⚠️ CRITICAL ISSUES:
• ${stpZones.filter((z) => z.status === "Fault").length} process zones in fault state
• ${stpEquipment.filter((eq) => eq.status === "Fault").length} equipment units requiring immediate attention
• ${stpAlarms.filter((a) => a.type === "Critical" && !a.acknowledged).length} unacknowledged critical alarms
• Sludge handling system showing decreased performance (65% efficiency)

🧪 CHEMICAL MANAGEMENT:
• Chlorine usage: ${performanceIndicators?.chemicalUsage.Chlorine.toFixed(1)} kg/day
• Current polymer stock at ${stpChemicals.find((c) => c.name === "Polymer")?.currentStock || 0} kg (${Math.round((stpChemicals.find((c) => c.name === "Polymer")?.currentStock || 0) / (stpChemicals.find((c) => c.name === "Polymer")?.usageRate || 1))} days remaining)
• Chemical dosing optimization could improve efficiency by 8-12%

💡 RECOMMENDATIONS:
• Schedule maintenance for the Sludge Dewatering Centrifuge (C-501)
• Investigate UV disinfection system - UV transmittance below optimal levels
• Optimize aeration control to reduce energy consumption
• Implement automated chemical dosing based on influent quality
• Conduct preventive maintenance on RAS pumps within next 15 days`)

      setIsAiLoading(false)
    }, 2500)
  }

  // Sub-navigation for STP Plant module
  const STPSubNav = () => {
    const subSections = [
      { name: "Dashboard", id: "dashboard", icon: LayoutDashboard },
      { name: "Process Monitoring", id: "process", icon: Activity },
      { name: "Equipment Status", id: "equipment", icon: HardDrive },
      { name: "Compliance & Reports", id: "compliance", icon: CheckCircle },
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
    const dateRangeOptions = [
      { value: "last7days", label: "Last 7 Days" },
      { value: "last14days", label: "Last 14 Days" },
      { value: "last30days", label: "Last 30 Days" },
    ]

    return (
      <div className="bg-white shadow p-4 rounded-lg mb-6 print:hidden sticky top-[110px] md:top-[88px] z-10 border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <StyledSelect
            id="dateRangeFilter"
            label="Date Range"
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            options={dateRangeOptions}
            icon={Calendar}
            disabled={isLoading}
          />

          {activeTab === "equipment" && (
            <StyledSelect
              id="equipmentTypeFilter"
              label="Equipment Type"
              value={equipmentFilterType}
              onChange={(e) => setEquipmentFilterType(e.target.value)}
              options={[
                { value: "all", label: "All Equipment Types" },
                { value: "pump", label: "Pumps" },
                { value: "blower", label: "Blowers" },
                { value: "screen", label: "Screens" },
                { value: "uv", label: "UV Systems" },
                { value: "dosing", label: "Dosing Systems" },
                { value: "centrifuge", label: "Centrifuges" },
              ]}
              icon={HardDrive}
              disabled={isLoading}
            />
          )}

          {activeTab === "process" && (
            <StyledSelect
              id="zoneTypeFilter"
              label="Process Zone"
              value={zoneFilterType}
              onChange={(e) => setZoneFilterType(e.target.value)}
              options={[
                { value: "all", label: "All Zones" },
                { value: "Primary", label: "Primary Treatment" },
                { value: "Secondary", label: "Secondary Treatment" },
                { value: "Tertiary", label: "Tertiary Treatment" },
                { value: "Disinfection", label: "Disinfection" },
                { value: "Sludge", label: "Sludge Handling" },
              ]}
              icon={Building2}
              disabled={isLoading}
            />
          )}

          <button
            onClick={() => {
              setDateRangeFilter("last7days")
              setEquipmentFilterType("all")
              setZoneFilterType("all")
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner size={64} />
        <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: COLORS.primary }}>
          Loading STP Plant Management System
        </h2>
        <p className="text-slate-500">Fetching operational data...</p>
      </div>
    )
  }

  // Render the selected tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardSection
            performanceIndicators={performanceIndicators}
            overallPlantStatus={overallPlantStatus}
            filteredData={filteredData}
            stpAlarms={stpAlarms}
            stpZones={stpZones}
          />
        )
      case "process":
        return (
          <ProcessSection
            performanceIndicators={performanceIndicators}
            filteredData={filteredData}
            filteredZones={filteredZones}
            stpChemicals={stpChemicals}
          />
        )
      case "equipment":
        return <EquipmentSection filteredEquipment={filteredEquipment} stpZones={stpZones} />
      case "compliance":
        return (
          <ComplianceSection
            stpCompliance={stpCompliance}
            filteredData={filteredData}
            performanceIndicators={performanceIndicators}
          />
        )
      default:
        return (
          <DashboardSection
            performanceIndicators={performanceIndicators}
            overallPlantStatus={overallPlantStatus}
            filteredData={filteredData}
            stpAlarms={stpAlarms}
            stpZones={stpZones}
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      <STPSubNav />
      <FilterBar />

      {activeTab === "dashboard" && (
        <div className="mb-6">
          <button
            onClick={handleAiAnalysis}
            disabled={isAiLoading}
            className="flex items-center justify-center space-x-2 text-white py-2.5 px-5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all w-full sm:w-auto transform hover:scale-105"
            style={{ backgroundColor: COLORS.primary }}
            onMouseOver={(e) => !isAiLoading && (e.currentTarget.style.backgroundColor = COLORS.primaryDark)}
            onMouseOut={(e) => !isAiLoading && (e.currentTarget.style.backgroundColor = COLORS.primary)}
          >
            <Sparkles size={18} />
            <span>{isAiLoading ? "Analyzing..." : "🤖 AI Plant Analysis"}</span>
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
                🤖 AI Plant Analysis
              </h3>
              <button onClick={() => setIsAiModalOpen(false)} className="p-1 rounded-full hover:bg-slate-200">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            {isAiLoading ? (
              <div className="text-center py-8">
                <Sparkles size={48} className="mx-auto animate-pulse" style={{ color: COLORS.primaryLight }} />
                <p className="mt-2 text-slate-600">AI is analyzing STP plant data...</p>
              </div>
            ) : (
              <div className="text-sm text-slate-700 space-y-3 whitespace-pre-wrap leading-relaxed">
                {aiAnalysisResult ? (
                  aiAnalysisResult.split("\n").map((line, index) => (
                    <p
                      key={index}
                      className={
                        line.startsWith("🔍") ||
                        line.startsWith("📊") ||
                        line.startsWith("⚠️") ||
                        line.startsWith("🧪") ||
                        line.startsWith("💡")
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

// ===== DASHBOARD SECTION =====
const DashboardSection = ({ performanceIndicators, overallPlantStatus, filteredData, stpAlarms, stpZones }) => {
  if (!performanceIndicators) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500">No data available for the selected date range.</p>
      </div>
    )
  }

  // Prepare chart data
  const flowTrendData = filteredData.map((item) => ({
    date: item.date,
    inflow: item.inflow,
    outflow: item.outflow,
    recovery: (item.outflow / item.inflow) * 100,
  }))

  const qualityTrendData = filteredData.map((item) => ({
    date: item.date,
    bod: item.bod,
    cod: item.cod,
    tss: item.tss,
    turbidity: item.turbidity,
  }))

  const statusData = [
    { name: "Normal", value: performanceIndicators.statusCounts.Normal },
    { name: "Warning", value: performanceIndicators.statusCounts.Warning },
    { name: "Critical", value: performanceIndicators.statusCounts.Critical },
    { name: "Maintenance", value: performanceIndicators.statusCounts.Maintenance },
  ]

  const zoneStatusData = [
    { name: "Operational", value: stpZones.filter((z) => z.status === "Operational").length },
    { name: "Warning", value: stpZones.filter((z) => z.status === "Warning").length },
    { name: "Fault", value: stpZones.filter((z) => z.status === "Fault").length },
    { name: "Maintenance", value: stpZones.filter((z) => z.status === "Maintenance").length },
    { name: "Offline", value: stpZones.filter((z) => z.status === "Offline").length },
  ]

  // Colors for status charts
  const statusColors = {
    Normal: COLORS.success,
    Warning: COLORS.warning,
    Critical: COLORS.error,
    Maintenance: COLORS.info,
    Operational: COLORS.success,
    Fault: COLORS.error,
    Offline: COLORS.chart[5],
  }

  return (
    <div className="space-y-6">
      {/* Plant Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Plant Status"
          value={overallPlantStatus}
          unit=""
          trend="Current operational status"
          trendColor={
            overallPlantStatus === "Normal"
              ? "text-green-600"
              : overallPlantStatus === "Warning"
                ? "text-yellow-600"
                : overallPlantStatus === "Maintenance"
                  ? "text-blue-600"
                  : "text-red-600"
          }
          icon={Activity}
          iconBgColor={
            overallPlantStatus === "Normal"
              ? COLORS.success
              : overallPlantStatus === "Warning"
                ? COLORS.warning
                : overallPlantStatus === "Maintenance"
                  ? COLORS.info
                  : COLORS.error
          }
        />
        <SummaryCard
          title="Average Inflow"
          value={performanceIndicators.avgInflowWeek.toFixed(1)}
          unit="m³/day"
          trend={`${(performanceIndicators.avgInflowWeek - performanceIndicators.avgInflowMonth).toFixed(1)} vs monthly avg`}
          trendColor={
            performanceIndicators.avgInflowWeek > performanceIndicators.avgInflowMonth
              ? "text-blue-600"
              : "text-green-600"
          }
          icon={Waves}
          iconBgColor={COLORS.info}
        />
        <SummaryCard
          title="Average Outflow"
          value={performanceIndicators.avgOutflowWeek.toFixed(1)}
          unit="m³/day"
          trend={`${(performanceIndicators.avgOutflowWeek - performanceIndicators.avgOutflowMonth).toFixed(1)} vs monthly avg`}
          trendColor={
            performanceIndicators.avgOutflowWeek > performanceIndicators.avgOutflowMonth
              ? "text-green-600"
              : "text-yellow-600"
          }
          icon={Droplet}
          iconBgColor={COLORS.success}
        />
        <SummaryCard
          title="Water Recovery"
          value={performanceIndicators.waterRecoveryRate.toFixed(1)}
          unit="%"
          trend={`${performanceIndicators.waterRecoveryRate > 90 ? "Excellent" : performanceIndicators.waterRecoveryRate > 80 ? "Good" : "Needs improvement"}`}
          trendColor={
            performanceIndicators.waterRecoveryRate > 90
              ? "text-green-600"
              : performanceIndicators.waterRecoveryRate > 80
                ? "text-yellow-600"
                : "text-red-600"
          }
          icon={Beaker}
          iconBgColor={COLORS.accent}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard
          title="Treatment Efficiency"
          value={performanceIndicators.bodEfficiency.toFixed(1)}
          unit="%"
          trend="BOD removal efficiency"
          trendColor="text-green-600"
          icon={FlaskConical}
          iconBgColor={COLORS.chart[2]}
        />
        <SummaryCard
          title="Energy Consumption"
          value={performanceIndicators.latestData.energyConsumption.toFixed(0)}
          unit="kWh/day"
          trend={`${performanceIndicators.energyEfficiency.toFixed(2)} m³/kWh efficiency`}
          trendColor="text-yellow-600"
          icon={Zap}
          iconBgColor={COLORS.chart[3]}
        />
        <SummaryCard
          title="System Uptime"
          value={performanceIndicators.uptime.toFixed(1)}
          unit="%"
          trend="Last 30 days"
          trendColor={performanceIndicators.uptime > 95 ? "text-green-600" : "text-yellow-600"}
          icon={Timer}
          iconBgColor={COLORS.chart[4]}
        />
      </div>

      {/* Flow Trend Chart */}
      <ChartWrapper title="Daily Flow Trend" subtitle="Inflow and outflow with recovery rate">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={flowTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: "#64748b" }}
              label={{ value: "Flow (m³/day)", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#64748b" }}
              label={{ value: "Recovery Rate (%)", angle: 90, position: "insideRight", fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) => [
                name === "recovery" ? `${value.toFixed(1)}%` : `${value.toFixed(1)} m³/day`,
                name === "inflow" ? "Inflow" : name === "outflow" ? "Outflow" : "Recovery Rate",
              ]}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="inflow" fill={COLORS.info} name="Inflow" barSize={20} />
            <Bar yAxisId="left" dataKey="outflow" fill={COLORS.success} name="Outflow" barSize={20} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="recovery"
              stroke={COLORS.accent}
              strokeWidth={2}
              name="Recovery Rate"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Plant Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Plant Operational Status" subtitle="Last 30 days status distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={statusColors[entry.name] || COLORS.chart[0]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} days`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Process Zones Status" subtitle="Current status of treatment zones">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={zoneStatusData.filter((item) => item.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {zoneStatusData.map((entry) => (
                  <Cell key={entry.name} fill={statusColors[entry.name] || COLORS.chart[1]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} zones`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Water Quality Trends */}
      <ChartWrapper title="Water Quality Parameters" subtitle="Key quality indicators trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={qualityTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip formatter={(value, name) => [`${value} mg/L`, name.toUpperCase()]} />
            <Legend />
            <Line type="monotone" dataKey="bod" stroke={COLORS.success} strokeWidth={2} name="BOD" />
            <Line type="monotone" dataKey="cod" stroke={COLORS.primary} strokeWidth={2} name="COD" />
            <Line type="monotone" dataKey="tss" stroke={COLORS.warning} strokeWidth={2} name="TSS" />
            <Line type="monotone" dataKey="turbidity" stroke={COLORS.info} strokeWidth={2} name="Turbidity" />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Active Alarms */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
          <AlertTriangle className="mr-2" size={20} style={{ color: COLORS.error }} />
          Active Alarms & Alerts
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-100">
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Time
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Message
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stpAlarms
                .filter((alarm) => !alarm.resolvedAt)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 5)
                .map((alarm) => (
                  <tr
                    key={alarm.id}
                    className={
                      alarm.type === "Critical" ? "bg-red-50" : alarm.type === "Warning" ? "bg-yellow-50" : "bg-blue-50"
                    }
                  >
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {new Date(alarm.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alarm.type === "Critical"
                            ? "bg-red-100 text-red-800"
                            : alarm.type === "Warning"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {alarm.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">{alarm.location}</td>
                    <td className="py-3 px-4 text-sm text-slate-900">{alarm.message}</td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alarm.acknowledged ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {alarm.acknowledged ? "Acknowledged" : "New"}
                      </span>
                    </td>
                  </tr>
                ))}
              {stpAlarms.filter((alarm) => !alarm.resolvedAt).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    No active alarms
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ===== PROCESS SECTION =====
const ProcessSection = ({ performanceIndicators, filteredData, filteredZones, stpChemicals }) => {
  const [selectedProcessZone, setSelectedProcessZone] = useState("")

  // Prepare data for charts
  const chemicalUsageData = filteredData.map((item) => ({
    date: item.date,
    ...item.chemicalUsage,
  }))

  const processParametersData = filteredData.map((item) => ({
    date: item.date,
    pH: item.pH,
    turbidity: item.turbidity,
    tds: item.tds,
    dissolvedOxygen: item.dissolvedOxygen,
  }))

  // Filter zones for detailed view
  const selectedZone = filteredZones.find((zone) => zone.id === selectedProcessZone)

  return (
    <div className="space-y-6">
      {/* Process KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="BOD Removal"
          value={performanceIndicators.bodEfficiency.toFixed(1)}
          unit="%"
          trend={
            performanceIndicators.bodEfficiency > 90
              ? "Excellent"
              : performanceIndicators.bodEfficiency > 80
                ? "Good"
                : "Needs improvement"
          }
          trendColor={
            performanceIndicators.bodEfficiency > 90
              ? "text-green-600"
              : performanceIndicators.bodEfficiency > 80
                ? "text-yellow-600"
                : "text-red-600"
          }
          icon={FlaskConical}
          iconBgColor={COLORS.success}
        />
        <SummaryCard
          title="TSS Removal"
          value={performanceIndicators.tssEfficiency.toFixed(1)}
          unit="%"
          trend={
            performanceIndicators.tssEfficiency > 90
              ? "Excellent"
              : performanceIndicators.tssEfficiency > 80
                ? "Good"
                : "Needs improvement"
          }
          trendColor={
            performanceIndicators.tssEfficiency > 90
              ? "text-green-600"
              : performanceIndicators.tssEfficiency > 80
                ? "text-yellow-600"
                : "text-red-600"
          }
          icon={Beaker}
          iconBgColor={COLORS.info}
        />
        <SummaryCard
          title="Process Zones"
          value={filteredZones.length}
          unit="zones"
          trend={`${filteredZones.filter((z) => z.status === "Operational").length} operational`}
          trendColor="text-blue-600"
          icon={Building2}
          iconBgColor={COLORS.accent}
        />
        <SummaryCard
          title="Latest pH"
          value={performanceIndicators.latestData.pH.toFixed(1)}
          unit="pH"
          trend={
            performanceIndicators.latestData.pH > 8 || performanceIndicators.latestData.pH < 6.5
              ? "Outside optimal range"
              : "Within optimal range"
          }
          trendColor={
            performanceIndicators.latestData.pH > 8 || performanceIndicators.latestData.pH < 6.5
              ? "text-yellow-600"
              : "text-green-600"
          }
          icon={ThermometerSun}
          iconBgColor={COLORS.chart[3]}
        />
      </div>

      {/* Process Parameter Trends */}
      <ChartWrapper title="Process Parameter Trends" subtitle="Key operational parameters">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processParametersData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="pH"
              stroke={COLORS.chart[0]}
              strokeWidth={2}
              name="pH"
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="turbidity"
              stroke={COLORS.chart[1]}
              strokeWidth={2}
              name="Turbidity (NTU)"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="tds"
              stroke={COLORS.chart[2]}
              strokeWidth={2}
              name="TDS (mg/L)"
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="dissolvedOxygen"
              stroke={COLORS.chart[4]}
              strokeWidth={2}
              name="DO (mg/L)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Chemical Usage */}
      <ChartWrapper title="Chemical Usage Trends" subtitle="Daily chemical consumption">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chemicalUsageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              label={{ value: "Usage (kg/day)", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip formatter={(value, name) => [`${value.toFixed(1)} kg`, name]} />
            <Legend />
            <Area
              type="monotone"
              dataKey="Chlorine"
              stackId="1"
              stroke={COLORS.info}
              fill={COLORS.info}
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="Polymer"
              stackId="1"
              stroke={COLORS.primary}
              fill={COLORS.primary}
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="Alum"
              stackId="1"
              stroke={COLORS.warning}
              fill={COLORS.warning}
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="Caustic Soda"
              stackId="1"
              stroke={COLORS.success}
              fill={COLORS.success}
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Process Zones Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Process Zones Overview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-100">
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Zone
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Flow Rate
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Retention
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredZones.map((zone) => (
                <tr key={zone.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium text-slate-900">{zone.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{zone.type}</td>
                  <td className="py-3 px-4 text-sm">
                    <StatusBadge status={zone.status} />
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900">{zone.flowRate} m³/day</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{zone.retention} hours</td>
                  <td className="py-3 px-4 text-sm">
                    <button
                      onClick={() => setSelectedProcessZone(zone.id === selectedProcessZone ? "" : zone.id)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-xs font-medium"
                    >
                      {zone.id === selectedProcessZone ? "Hide Details" : "View Details"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Zone Details */}
      {selectedZone && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">
            {selectedZone.name} Details
            <span className="ml-3">
              <StatusBadge status={selectedZone.status} />
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-slate-700 mb-3">Zone Parameters</h4>
              <div className="space-y-2">
                {Object.entries(selectedZone.parameters).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-slate-50 rounded">
                    <span className="text-slate-700">{key}</span>
                    <span className="font-medium text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-slate-700 mb-3">Zone Equipment</h4>
              <div className="space-y-2">
                {selectedZone.equipment.length > 0 ? (
                  selectedZone.equipment.map((eqId) => (
                    <div key={eqId} className="p-2 bg-slate-50 rounded">
                      <span className="text-slate-900 font-medium">{eqId}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No equipment assigned to this zone</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chemical Inventory */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
          <Beaker className="mr-2" size={20} style={{ color: COLORS.primary }} />
          Chemical Inventory
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-100">
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Chemical
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Usage Rate
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Days Remaining
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Last Delivery
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stpChemicals.map((chem) => {
                const daysRemaining = Math.round(chem.currentStock / chem.usageRate)
                let status = "Normal"
                if (daysRemaining <= 7) status = "Critical"
                else if (daysRemaining <= 14) status = "Warning"

                return (
                  <tr key={chem.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{chem.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {chem.currentStock} {chem.unit}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {chem.usageRate} {chem.unit}/day
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">{daysRemaining} days</td>
                    <td className="py-3 px-4 text-sm text-slate-900">{chem.lastDelivery}</td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ===== EQUIPMENT SECTION =====
const EquipmentSection = ({ filteredEquipment, stpZones }) => {
  const [selectedEquipment, setSelectedEquipment] = useState("")

  // Helper to find zone name for equipment
  const getZoneName = (equipment) => {
    const zone = stpZones.find((z) => z.equipment.includes(equipment.id))
    return zone ? zone.name : "Unassigned"
  }

  // Filter equipment for detailed view
  const equipmentDetails = filteredEquipment.find((eq) => eq.id === selectedEquipment)

  // Prepare data for equipment status chart
  const equipmentStatusData = [
    { name: "Operational", value: filteredEquipment.filter((e) => e.status === "Operational").length },
    { name: "Warning", value: filteredEquipment.filter((e) => e.status === "Warning").length },
    { name: "Fault", value: filteredEquipment.filter((e) => e.status === "Fault").length },
    { name: "Maintenance", value: filteredEquipment.filter((e) => e.status === "Maintenance").length },
    { name: "Offline", value: filteredEquipment.filter((e) => e.status === "Offline").length },
  ].filter((item) => item.value > 0)

  // Colors for status
  const statusColors = {
    Operational: COLORS.success,
    Warning: COLORS.warning,
    Fault: COLORS.error,
    Maintenance: COLORS.info,
    Offline: COLORS.chart[5],
  }

  // Equipment efficiency data
  const equipmentEfficiencyData = filteredEquipment
    .filter((eq) => eq.efficiency && eq.status !== "Offline")
    .sort((a, b) => a.efficiency - b.efficiency)
    .map((eq) => ({
      name: eq.name.length > 25 ? eq.name.substring(0, 25) + "..." : eq.name,
      efficiency: eq.efficiency,
      fullName: eq.name,
      status: eq.status,
    }))

  return (
    <div className="space-y-6">
      {/* Equipment KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Equipment"
          value={filteredEquipment.length}
          unit="units"
          trend={`${filteredEquipment.filter((e) => e.status === "Operational").length} operational`}
          trendColor="text-green-600"
          icon={HardDrive}
          iconBgColor={COLORS.primary}
        />
        <SummaryCard
          title="Equipment Requiring Attention"
          value={filteredEquipment.filter((e) => e.status === "Fault" || e.status === "Warning").length}
          unit="units"
          trend="Faults or warnings"
          trendColor="text-yellow-600"
          icon={AlertTriangle}
          iconBgColor={COLORS.warning}
        />
        <SummaryCard
          title="Average Efficiency"
          value={(filteredEquipment.reduce((sum, eq) => sum + eq.efficiency, 0) / filteredEquipment.length).toFixed(1)}
          unit="%"
          trend="All equipment"
          trendColor="text-blue-600"
          icon={Activity}
          iconBgColor={COLORS.info}
        />
        <SummaryCard
          title="Scheduled Maintenance"
          value={
            filteredEquipment.filter(
              (e) => new Date(e.nextMaintenance) <= new Date(new Date().setDate(new Date().getDate() + 30)),
            ).length
          }
          unit="units"
          trend="Due in next 30 days"
          trendColor="text-purple-600"
          icon={Settings}
          iconBgColor={COLORS.accent}
        />
      </div>

      {/* Equipment Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Equipment Status Distribution" subtitle="Current status of all equipment">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={equipmentStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {equipmentStatusData.map((entry) => (
                  <Cell key={entry.name} fill={statusColors[entry.name] || COLORS.chart[0]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} units`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Equipment Efficiency Ranking" subtitle="Performance comparison">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={equipmentEfficiencyData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={150} />
              <Tooltip formatter={(value, name, props) => [`${value}%`, props.payload.fullName]} />
              <Bar dataKey="efficiency" radius={[0, 4, 4, 0]}>
                {equipmentEfficiencyData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      entry.status === "Operational"
                        ? COLORS.success
                        : entry.status === "Warning"
                          ? COLORS.warning
                          : entry.status === "Maintenance"
                            ? COLORS.info
                            : COLORS.error
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Equipment List */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Equipment Overview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-100">
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Next Maintenance
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEquipment.map((equipment) => (
                <tr key={equipment.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-mono text-slate-900">{equipment.id}</td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900">{equipment.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{equipment.type}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{getZoneName(equipment)}</td>
                  <td className="py-3 px-4 text-sm">
                    <StatusBadge status={equipment.status} />
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900">{equipment.nextMaintenance}</td>
                  <td className="py-3 px-4 text-sm">
                    <button
                      onClick={() => setSelectedEquipment(equipment.id === selectedEquipment ? "" : equipment.id)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-xs font-medium"
                    >
                      {equipment.id === selectedEquipment ? "Hide Details" : "View Details"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Equipment Details */}
      {equipmentDetails && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">
            {equipmentDetails.name} Details
            <span className="ml-3">
              <StatusBadge status={equipmentDetails.status} />
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-slate-700 mb-3">Specifications</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-2 p-2 bg-slate-50 rounded">
                  <span className="text-slate-700">Manufacturer</span>
                  <span className="font-medium text-slate-900">{equipmentDetails.manufacturer}</span>
                </div>
                <div className="grid grid-cols-2 p-2 bg-slate-50 rounded">
                  <span className="text-slate-700">Model</span>
                  <span className="font-medium text-slate-900">{equipmentDetails.model}</span>
                </div>
                <div className="grid grid-cols-2 p-2 bg-slate-50 rounded">
                  <span className="text-slate-700">Installation Date</span>
                  <span className="font-medium text-slate-900">{equipmentDetails.installationDate}</span>
                </div>
                <div className="grid grid-cols-2 p-2 bg-slate-50 rounded">
                  <span className="text-slate-700">Runtime</span>
                  <span className="font-medium text-slate-900">{equipmentDetails.runtime.toLocaleString()} hours</span>
                </div>
                <div className="grid grid-cols-2 p-2 bg-slate-50 rounded">
                  <span className="text-slate-700">Efficiency</span>
                  <span className="font-medium text-slate-900">{equipmentDetails.efficiency}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-slate-700 mb-3">Maintenance</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-2 p-2 bg-slate-50 rounded">
                  <span className="text-slate-700">Last Maintenance</span>
                  <span className="font-medium text-slate-900">{equipmentDetails.lastMaintenance}</span>
                </div>
                <div className="grid grid-cols-2 p-2 bg-slate-50 rounded">
                  <span className="text-slate-700">Next Maintenance</span>
                  <span className="font-medium text-slate-900">{equipmentDetails.nextMaintenance}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-slate-700 block mb-1">Active Alerts</span>
                  {equipmentDetails.alerts.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {equipmentDetails.alerts.map((alert, i) => (
                        <li key={i} className="text-red-600 text-sm">
                          {alert}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-green-600 text-sm">No active alerts</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== COMPLIANCE SECTION =====
const ComplianceSection = ({ stpCompliance, filteredData, performanceIndicators }) => {
  // Group compliance data by date
  const complianceByDate = stpCompliance.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = {
        date: item.date,
        parameters: [],
      }
    }
    acc[item.date].parameters.push(item)
    return acc
  }, {})

  // Prepare chart data
  const complianceData = Object.values(complianceByDate).map((day) => {
    const total = day.parameters.length
    const compliant = day.parameters.filter((p) => p.status === "Compliant").length
    return {
      date: day.date,
      complianceRate: (compliant / total) * 100,
      compliant,
      total,
    }
  })

  // Calculate compliance by parameter
  const parameterCompliance = stpCompliance.reduce((acc, item) => {
    if (!acc[item.parameter]) {
      acc[item.parameter] = {
        parameter: item.parameter,
        unit: item.unit,
        limit: item.limit,
        samples: 0,
        compliant: 0,
        rate: 0,
      }
    }
    acc[item.parameter].samples++
    if (item.status === "Compliant") {
      acc[item.parameter].compliant++
    }
    acc[item.parameter].rate = (acc[item.parameter].compliant / acc[item.parameter].samples) * 100
    return acc
  }, {})

  // Prepare parameter compliance chart data
  const parameterComplianceData = Object.values(parameterCompliance).map((param) => ({
    name: param.parameter,
    rate: param.rate,
    unit: param.unit,
    limit: param.limit,
    samples: param.samples,
  }))

  return (
    <div className="space-y-6">
      {/* Compliance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Overall Compliance"
          value={((stpCompliance.filter((c) => c.status === "Compliant").length / stpCompliance.length) * 100).toFixed(
            1,
          )}
          unit="%"
          trend={`${stpCompliance.filter((c) => c.status === "Compliant").length} of ${stpCompliance.length} parameters`}
          trendColor="text-green-600"
          icon={CheckCircle}
          iconBgColor={COLORS.success}
        />
        <SummaryCard
          title="BOD Compliance"
          value={(parameterCompliance["BOD"]?.rate || 0).toFixed(1)}
          unit="%"
          trend={`Limit: ${parameterCompliance["BOD"]?.limit || 10} mg/L`}
          trendColor="text-blue-600"
          icon={Beaker}
          iconBgColor={COLORS.info}
        />
        <SummaryCard
          title="TSS Compliance"
          value={(parameterCompliance["TSS"]?.rate || 0).toFixed(1)}
          unit="%"
          trend={`Limit: ${parameterCompliance["TSS"]?.limit || 15} mg/L`}
          trendColor="text-blue-600"
          icon={FlaskConical}
          iconBgColor={COLORS.primary}
        />
        <SummaryCard
          title="Non-Compliant Samples"
          value={stpCompliance.filter((c) => c.status === "Non-compliant").length}
          unit="samples"
          trend="Requiring attention"
          trendColor="text-red-600"
          icon={AlertTriangle}
          iconBgColor={COLORS.error}
        />
      </div>

      {/* Compliance Trend Chart */}
      <ChartWrapper title="Compliance Rate Trend" subtitle="Percentage of samples meeting compliance requirements">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={complianceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: "#64748b" }}
              domain={[0, 100]}
              label={{
                value: "Compliance Rate (%)",
                angle: -90,
                position: "insideLeft",
                fill: "#64748b",
                fontSize: 12,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: "#64748b" }}
              label={{ value: "Samples", angle: 90, position: "insideRight", fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) => [
                name === "complianceRate" ? `${value.toFixed(1)}%` : value,
                name === "complianceRate"
                  ? "Compliance Rate"
                  : name === "compliant"
                    ? "Compliant Samples"
                    : "Total Samples",
              ]}
            />
            <Legend />
            <Bar yAxisId="right" dataKey="total" fill={COLORS.primary} name="Total Samples" opacity={0.3} />
            <Bar yAxisId="right" dataKey="compliant" fill={COLORS.success} name="Compliant Samples" />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="complianceRate"
              stroke={COLORS.info}
              strokeWidth={3}
              dot={{ r: 6 }}
              name="Compliance Rate"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Parameter Compliance Chart */}
      <ChartWrapper title="Parameter-Specific Compliance" subtitle="Compliance rate by parameter">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={parameterComplianceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              domain={[0, 100]}
              label={{
                value: "Compliance Rate (%)",
                angle: -90,
                position: "insideLeft",
                fill: "#64748b",
                fontSize: 12,
              }}
            />
            <Tooltip
              formatter={(value, name, props) => [
                `${value.toFixed(1)}%`,
                `${props.payload.name} (Limit: ${props.payload.limit} ${props.payload.unit})`,
              ]}
            />
            <Legend />
            <Bar
              dataKey="rate"
              fill={COLORS.success}
              name="Compliance Rate"
              radius={[4, 4, 0, 0]}
              label={{
                position: "top",
                formatter: (value) => `${value.toFixed(0)}%`,
                fill: "#64748b",
                fontSize: 12,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Compliance Samples */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Compliance Sampling Results</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-100">
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Parameter
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Measured
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Limit
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Unit
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stpCompliance.map((compliance) => (
                <tr
                  key={compliance.id}
                  className={compliance.status === "Non-compliant" ? "bg-red-50" : "hover:bg-slate-50"}
                >
                  <td className="py-3 px-4 text-sm text-slate-900">{compliance.date}</td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900">{compliance.parameter}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{compliance.measured}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{compliance.limit}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{compliance.unit}</td>
                  <td className="py-3 px-4 text-sm">
                    <StatusBadge status={compliance.status} />
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900">{compliance.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulatory Framework */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Regulatory Framework</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-700">Regulatory Requirements</h4>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded border-l-4 border-blue-400">
                <p className="text-sm font-medium text-slate-800">Treated Water Quality Standards</p>
                <p className="text-xs text-slate-600 mt-1">
                  The plant must comply with local water quality regulations for treated effluent discharge.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded border-l-4 border-green-400">
                <p className="text-sm font-medium text-slate-800">Monitoring and Reporting</p>
                <p className="text-xs text-slate-600 mt-1">
                  Regular sampling and testing required with monthly reporting to regulatory authorities.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded border-l-4 border-purple-400">
                <p className="text-sm font-medium text-slate-800">Discharge Permits</p>
                <p className="text-xs text-slate-600 mt-1">
                  Operating in accordance with discharge permit #STP-MB-2023-01.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-700">Parameter Limits</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-200 rounded-lg">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="py-2 px-3 text-left text-xs font-medium text-slate-600 uppercase">Parameter</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-slate-600 uppercase">Limit</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-slate-600 uppercase">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 text-xs text-slate-900">BOD</td>
                    <td className="py-2 px-3 text-xs text-slate-900">10</td>
                    <td className="py-2 px-3 text-xs text-slate-900">mg/L</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-xs text-slate-900">COD</td>
                    <td className="py-2 px-3 text-xs text-slate-900">40</td>
                    <td className="py-2 px-3 text-xs text-slate-900">mg/L</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-xs text-slate-900">TSS</td>
                    <td className="py-2 px-3 text-xs text-slate-900">15</td>
                    <td className="py-2 px-3 text-xs text-slate-900">mg/L</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-xs text-slate-900">pH</td>
                    <td className="py-2 px-3 text-xs text-slate-900">6.5-8.5</td>
                    <td className="py-2 px-3 text-xs text-slate-900">pH</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-xs text-slate-900">Total Coliforms</td>
                    <td className="py-2 px-3 text-xs text-slate-900">200</td>
                    <td className="py-2 px-3 text-xs text-slate-900">CFU/100mL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default STPPlantModule
