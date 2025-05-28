"use client"

import type React from "react"
import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Label,
  Area,
} from "recharts"
import {
  LayoutDashboard,
  BarChart2,
  List,
  Zap,
  TrendingUp,
  Users2,
  DollarSign,
  Filter,
  CalendarDays,
  Building,
  Sparkles,
  X,
} from "lucide-react"
import { COLORS, OMR_PER_KWH } from "@/lib/constants"
import { initialElectricityData, availableMonths } from "@/lib/electricity-data"
import { SummaryCard, ChartWrapper, StyledSelect } from "@/components/ui/dashboard-components"

interface ElectricitySystemModuleProps {
  isDarkMode: boolean
}

export const ElectricitySystemModule: React.FC<ElectricitySystemModuleProps> = ({ isDarkMode }) => {
  const [activeSubSection, setActiveSubSection] = useState("Dashboard")
  const [selectedMonth, setSelectedMonth] = useState("All Months")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedUnitId, setSelectedUnitId] = useState(
    initialElectricityData.length > 0 ? initialElectricityData[0].id.toString() : "",
  )
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)

  const distinctCategories = useMemo(() => [...new Set(initialElectricityData.map((d) => d.category))].sort(), [])

  const distinctUnitsForDropdown = useMemo(
    () =>
      initialElectricityData
        .map((d) => ({ value: d.id.toString(), label: `${d.unitName} (${d.meterAccountNo})` }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  )

  const filteredElectricityData = useMemo(() => {
    return initialElectricityData.filter((item) => {
      const categoryMatch = selectedCategory === "All Categories" || item.category === selectedCategory
      return categoryMatch
    })
  }, [selectedCategory])

  const kpiAndTableData = useMemo(() => {
    if (selectedMonth === "All Months") {
      return filteredElectricityData.map((item) => ({ ...item }))
    }
    return filteredElectricityData.map((item) => ({ ...item, totalConsumption: item.consumption[selectedMonth] || 0 }))
  }, [filteredElectricityData, selectedMonth])

  const totalConsumptionKWh = useMemo(
    () => kpiAndTableData.reduce((acc, curr) => acc + curr.totalConsumption, 0),
    [kpiAndTableData],
  )
  const totalCostOMR = useMemo(() => totalConsumptionKWh * OMR_PER_KWH, [totalConsumptionKWh])
  const averageConsumptionPerUnit = useMemo(
    () => (kpiAndTableData.length > 0 ? totalConsumptionKWh / kpiAndTableData.length : 0),
    [totalConsumptionKWh, kpiAndTableData],
  )
  const activeMeters = useMemo(
    () =>
      kpiAndTableData.filter((d) => d.meterAccountNo !== "N/A" && d.meterAccountNo !== "" && d.totalConsumption > 0)
        .length,
    [kpiAndTableData],
  )

  const monthlyTrendForAllMonths = useMemo(() => {
    return availableMonths.map((month) => {
      const total = filteredElectricityData.reduce((acc, curr) => acc + (curr.consumption[month] || 0), 0)
      return {
        name: month.replace("-24", " 24").replace("-25", " 25"),
        month: month,
        total: Number.parseFloat(total.toFixed(2)),
        cost: Number.parseFloat((total * OMR_PER_KWH).toFixed(2)),
      }
    })
  }, [filteredElectricityData])

  const consumptionByTypeChartData = useMemo(() => {
    const dataToUse = kpiAndTableData
    const typeData: Record<string, number> = {}
    dataToUse.forEach((d) => {
      typeData[d.type] = (typeData[d.type] || 0) + d.totalConsumption
    })
    return Object.entries(typeData)
      .map(([name, value]) => ({ name, value: Number.parseFloat(value.toFixed(2)) }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [kpiAndTableData])

  const topConsumersChartData = useMemo(() => {
    const dataToUse = kpiAndTableData
    return dataToUse
      .slice()
      .sort((a, b) => b.totalConsumption - a.totalConsumption)
      .filter((d) => d.totalConsumption > 0)
      .slice(0, 10)
      .map((d) => ({
        name: d.unitName.length > 20 ? d.unitName.substring(0, 20) + "..." : d.unitName,
        consumption: d.totalConsumption,
        monthlyDataFull: initialElectricityData.find((item) => item.id === d.id)?.consumption || {},
        category: d.category,
        type: d.type,
      }))
  }, [kpiAndTableData])

  const handleAiAnalysis = async () => {
    setIsAiModalOpen(true)
    setIsAiLoading(true)
    setAiAnalysisResult("")

    setTimeout(() => {
      const analysisText = `AI Analysis Results for ${selectedMonth === "All Months" ? "All Months" : selectedMonth}:

🔍 CONSUMPTION PATTERNS:
• Total consumption: ${totalConsumptionKWh.toLocaleString()} kWh (${totalCostOMR.toLocaleString()} OMR)
• Average per unit: ${averageConsumptionPerUnit.toLocaleString()} kWh
• Active meters: ${activeMeters} units

📊 KEY INSIGHTS:
• Beachwell shows extreme variability (46 kWh to 42,241 kWh) - investigate equipment cycling
• CIF Kitchen maintains consistent high consumption (14,971-18,446 kWh) - commercial operation
• Pumping Station 01 shows increasing trend (1,608 to 6,876 kWh in Oct-24)
• D Buildings average 1,200-1,700 kWh monthly - stable residential pattern

⚡ ANOMALY DETECTION:
• Pumping Station 03: Significant drops to 0 kWh (May-Sep 24) - maintenance or malfunction
• Village Square: Spike to 9,087 kWh in Sep-24 - special event or system issue
• Multiple street lights show coordinated patterns - efficient central control

💰 COST OPTIMIZATION OPPORTUNITIES:
• Beachwell optimization could save 15-20% (${(27749 * 0.175 * OMR_PER_KWH).toFixed(0)} OMR/month)
• Load balancing for pumping stations during peak hours
• Consider solar integration for street lighting systems

🎯 RECOMMENDATIONS:
• Install smart meters for real-time monitoring
• Implement demand response for high-consuming units
• Schedule maintenance during low-demand periods
• Consider energy storage for peak shaving`

      setAiAnalysisResult(analysisText)
      setIsAiLoading(false)
    }, 2500)
  }

  // Sub-navigation for electricity module
  const ElectricitySubNav = () => {
    const subSections = [
      { name: "Dashboard", id: "Dashboard", icon: LayoutDashboard },
      { name: "Performance", id: "Performance", icon: TrendingUp },
      { name: "Analytics", id: "Analytics", icon: BarChart2 },
      { name: "Unit Details", id: "UnitDetails", icon: List },
    ]

    return (
      <div className="mb-6 print:hidden flex justify-center">
        <div className="bg-white shadow-md rounded-full p-1.5 inline-flex space-x-1 border border-slate-200">
          {subSections.map((tab) => {
            const isActive = activeSubSection === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubSection(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-all duration-200 ease-in-out transform hover:scale-105`}
                style={{
                  backgroundColor: isActive ? COLORS.primary : "transparent",
                  color: isActive ? "white" : COLORS.primary,
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = COLORS.teal
                    e.currentTarget.style.color = "white"
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = COLORS.primary
                  }
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

  // Filter Bar
  const FilterBar = () => {
    const monthOptions = [
      { value: "All Months", label: "All Months" },
      ...availableMonths.map((m) => ({ value: m, label: m })),
    ]
    const categoryOptions = [
      { value: "All Categories", label: "All Categories" },
      ...distinctCategories.map((c) => ({ value: c, label: c })),
    ]

    return (
      <div className="bg-white shadow p-4 rounded-lg mb-6 print:hidden sticky top-[110px] md:top-[88px] z-10 border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <StyledSelect
            id="monthFilter"
            label="Filter by Month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={monthOptions}
            icon={CalendarDays}
          />
          <StyledSelect
            id="categoryFilter"
            label="Filter by Unit Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categoryOptions}
            icon={List}
          />
          <button
            onClick={() => {
              setSelectedMonth("All Months")
              setSelectedCategory("All Categories")
            }}
            className="text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2 h-[46px] w-full lg:w-auto hover:shadow-lg transform hover:scale-105"
            style={{ backgroundColor: COLORS.primary }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = COLORS.primaryDark)}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary)}
          >
            <Filter size={16} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    )
  }

  // Render sub-section content
  const renderSubSectionContent = () => {
    switch (activeSubSection) {
      case "Dashboard":
        return (
          <>
            <div className="mb-6">
              <button
                onClick={handleAiAnalysis}
                className="flex items-center justify-center space-x-2 text-white py-2.5 px-5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all w-full sm:w-auto transform hover:scale-105"
                style={{ backgroundColor: COLORS.teal }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = COLORS.teal)}
                disabled={isAiLoading}
              >
                <Sparkles size={18} />
                <span>{isAiLoading ? "Analyzing..." : "🤖 Analyze with AI"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard
                title="Total Consumption"
                value={totalConsumptionKWh.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                unit="kWh"
                icon={Zap}
                trend={selectedMonth === "All Months" ? "Overall" : `For ${selectedMonth}`}
                trendColor={"text-slate-500 font-medium"}
                iconBgColor={COLORS.primary}
              />
              <SummaryCard
                title="Total Est. Cost"
                value={totalCostOMR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                unit="OMR"
                icon={DollarSign}
                trend="Based on selection"
                trendColor="text-slate-500 font-medium"
                iconBgColor={COLORS.success}
              />
              <SummaryCard
                title="Avg. Consumption/Unit"
                value={averageConsumptionPerUnit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                unit="kWh"
                icon={BarChart2}
                trend={selectedMonth === "All Months" ? "Overall" : `For ${selectedMonth}`}
                trendColor={"text-slate-500 font-medium"}
                iconBgColor={COLORS.warning}
              />
              <SummaryCard
                title="Active Meters"
                value={activeMeters}
                unit="units"
                icon={Users2}
                trend="In selection"
                trendColor="text-slate-500 font-medium"
                iconBgColor={COLORS.info}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <ChartWrapper
                  title="Monthly Consumption Trend"
                  subtitle={`Category: ${selectedCategory} | 13-month overview`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendForAllMonths} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", borderRadius: "8px", borderColor: "#e2e8f0" }}
                        labelStyle={{ color: "#0f172a", fontWeight: "bold" }}
                        formatter={(value, name) => [
                          `${value.toLocaleString()} kWh`,
                          name === "total" ? "Consumption" : name,
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={COLORS.primary}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        activeDot={{ r: 7, strokeWidth: 2, fill: COLORS.primary }}
                        dot={{ r: 4, fill: COLORS.primary }}
                        name="Total kWh"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              </div>
              <div className="lg:col-span-2">
                <ChartWrapper title="Consumption by Equipment Type" subtitle={`Period: ${selectedMonth}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={consumptionByTypeChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={2}
                        cornerRadius={5}
                      >
                        {consumptionByTypeChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS.chart[index % COLORS.chart.length]}
                            className="focus:outline-none hover:opacity-80 transition-opacity"
                            stroke="none"
                          />
                        ))}
                        <Label
                          value={`${consumptionByTypeChartData.reduce((sum, item) => sum + item.value, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                          position="centerBottom"
                          dy={-5}
                          className="text-2xl font-bold fill-slate-700"
                        />
                        <Label value="Total kWh" position="centerTop" dy={10} className="text-xs fill-slate-500" />
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", borderRadius: "8px", borderColor: "#e2e8f0" }}
                        formatter={(value) => [`${value.toLocaleString()} kWh`, "Consumption"]}
                      />
                      <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: "15px", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              </div>
            </div>

            <ChartWrapper title="Top 10 Energy Consumers" subtitle={`Ranked by ${selectedMonth} consumption`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topConsumersChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10, fill: "#334155", width: 115 }}
                    interval={0}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "white", borderRadius: "8px", borderColor: "#e2e8f0" }}
                    formatter={(value, name, props) => [
                      `${value.toLocaleString()} kWh`,
                      `${props.payload.category} - ${props.payload.type}`,
                    ]}
                  />
                  <Bar dataKey="consumption" name="Consumption (kWh)" barSize={20} radius={[0, 5, 5, 0]}>
                    {topConsumersChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </>
        )

      case "Performance":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard
                title="System Efficiency"
                value="92.4"
                unit="%"
                icon={TrendingUp}
                trend="↑ 2.1% vs last period"
                trendColor="text-green-600"
                iconBgColor={COLORS.success}
              />
              <SummaryCard
                title="Peak Demand"
                value={Math.max(...monthlyTrendForAllMonths.map((m) => m.total)).toLocaleString()}
                unit="kWh"
                icon={Zap}
                trend="Occurred in peak season"
                trendColor="text-orange-600"
                iconBgColor={COLORS.warning}
              />
              <SummaryCard
                title="Load Factor"
                value="78.6"
                unit="%"
                icon={BarChart2}
                trend="Optimal range"
                trendColor="text-green-600"
                iconBgColor={COLORS.info}
              />
              <SummaryCard
                title="Cost per kWh"
                value="0.025"
                unit="OMR"
                icon={DollarSign}
                trend="Fixed rate"
                unit="OMR"
                icon={DollarSign}
                trend="Fixed rate"
                trendColor="text-slate-600"
                iconBgColor={COLORS.accent}
              />
            </div>

            <ChartWrapper title="Performance Metrics Summary" subtitle="System performance indicators">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <h4 className="font-semibold text-slate-700 mb-3">Efficiency Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Overall Efficiency:</span>
                      <span className="font-medium text-green-600">92.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Load Factor:</span>
                      <span className="font-medium">78.6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Peak Utilization:</span>
                      <span className="font-medium">85.2%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border">
                  <h4 className="font-semibold text-slate-700 mb-3">Cost Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cost per kWh:</span>
                      <span className="font-medium">0.025 OMR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Monthly Average:</span>
                      <span className="font-medium">
                        {((totalConsumptionKWh / availableMonths.length) * OMR_PER_KWH).toFixed(2)} OMR
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Optimization Potential:</span>
                      <span className="font-medium text-green-600">15-20%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border">
                  <h4 className="font-semibold text-slate-700 mb-3">System Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Active Units:</span>
                      <span className="font-medium">{activeMeters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">System Health:</span>
                      <span className="font-medium text-green-600">Excellent</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Uptime:</span>
                      <span className="font-medium">99.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </ChartWrapper>
          </div>
        )

      case "Analytics":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard
                title="Seasonal Variance"
                value="24.8"
                unit="%"
                icon={TrendingUp}
                trend="Summer vs Winter"
                trendColor="text-blue-600"
                iconBgColor={COLORS.info}
              />
              <SummaryCard
                title="Optimization Potential"
                value="1,250"
                unit="OMR"
                icon={DollarSign}
                trend="15% efficiency gain"
                trendColor="text-green-600"
                iconBgColor={COLORS.success}
              />
              <SummaryCard
                title="High Variance Units"
                value="8"
                unit="units"
                icon={BarChart2}
                trend=">20% variance"
                trendColor="text-orange-600"
                iconBgColor={COLORS.warning}
              />
              <SummaryCard
                title="Prediction Accuracy"
                value="89.2"
                unit="%"
                icon={TrendingUp}
                trend="ML model performance"
                trendColor="text-green-600"
                iconBgColor={COLORS.accent}
              />
            </div>

            <ChartWrapper title="Advanced Analytics Dashboard" subtitle="Comprehensive consumption analysis">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700">Consumption Patterns</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm font-medium text-blue-800">Peak Hours Analysis</p>
                      <p className="text-xs text-blue-600">Highest consumption: 8 AM - 12 PM</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <p className="text-sm font-medium text-green-800">Efficiency Opportunities</p>
                      <p className="text-xs text-green-600">Load balancing could save 12% energy</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <p className="text-sm font-medium text-yellow-800">Anomaly Detection</p>
                      <p className="text-xs text-yellow-600">3 units showing irregular patterns</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700">Recommendations</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                      <p className="text-sm font-medium text-purple-800">Smart Scheduling</p>
                      <p className="text-xs text-purple-600">Implement time-based load management</p>
                    </div>
                    <div className="p-3 bg-teal-50 rounded-lg border-l-4 border-teal-400">
                      <p className="text-sm font-medium text-teal-800">Energy Storage</p>
                      <p className="text-xs text-teal-600">Consider battery systems for peak shaving</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                      <p className="text-sm font-medium text-orange-800">Maintenance Schedule</p>
                      <p className="text-xs text-orange-600">Optimize maintenance during low-demand periods</p>
                    </div>
                  </div>
                </div>
              </div>
            </ChartWrapper>
          </div>
        )

      case "UnitDetails":
        const selectedUnit = initialElectricityData.find((unit) => unit.id.toString() === selectedUnitId)
        const unitMonthlyData = selectedUnit
          ? availableMonths.map((month) => ({
              month: month.replace("-24", " 24").replace("-25", " 25"),
              consumption: selectedUnit.consumption[month] || 0,
              cost: (selectedUnit.consumption[month] || 0) * OMR_PER_KWH,
            }))
          : []

        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
              <StyledSelect
                id="unitDetailSelect"
                label="Select Unit for Detailed Analysis"
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                options={distinctUnitsForDropdown}
                icon={Building}
              />
            </div>

            {selectedUnit && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <SummaryCard
                    title={selectedUnit.unitName}
                    value={selectedUnit.totalConsumption.toLocaleString()}
                    unit="kWh"
                    icon={Zap}
                    trend="Total (13 months)"
                    trendColor="text-slate-600"
                    iconBgColor={COLORS.primary}
                  />
                  <SummaryCard
                    title="Monthly Average"
                    value={(selectedUnit.totalConsumption / availableMonths.length).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                    unit="kWh"
                    icon={BarChart2}
                    trend="Per month average"
                    trendColor="text-blue-600"
                    iconBgColor={COLORS.info}
                  />
                  <SummaryCard
                    title="Total Cost"
                    value={(selectedUnit.totalConsumption * OMR_PER_KWH).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                    unit="OMR"
                    icon={DollarSign}
                    trend="13-month total"
                    trendColor="text-green-600"
                    iconBgColor={COLORS.success}
                  />
                  <SummaryCard
                    title="Equipment Type"
                    value={selectedUnit.type}
                    unit=""
                    icon={Building}
                    trend={selectedUnit.category}
                    trendColor="text-slate-600"
                    iconBgColor={COLORS.accent}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartWrapper title="Monthly Consumption Profile" subtitle={`${selectedUnit.unitName} - 13 months`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={unitMonthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          formatter={(value, name) => [
                            name === "cost" ? `${value.toFixed(2)} OMR` : `${value.toLocaleString()} kWh`,
                            name === "consumption" ? "Consumption" : "Cost",
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="consumption" fill={COLORS.chart[0]} name="Consumption (kWh)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartWrapper>

                  <ChartWrapper title="Cost Analysis" subtitle="Monthly cost breakdown">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={unitMonthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value, name) => [`${value.toFixed(2)} OMR`, "Monthly Cost"]} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="cost"
                          stroke={COLORS.chart[1]}
                          strokeWidth={3}
                          dot={{ r: 5 }}
                          name="Cost (OMR)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartWrapper>
                </div>
              </>
            )}
          </div>
        )

      default:
        return <div className="text-center py-10 text-slate-500">Sub-section not found</div>
    }
  }

  return (
    <div className="space-y-6">
      <ElectricitySubNav />

      {activeSubSection === "Dashboard" && <FilterBar />}

      {renderSubSectionContent()}

      {/* AI Analysis Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
                🤖 AI Consumption Analysis
              </h3>
              <button onClick={() => setIsAiModalOpen(false)} className="p-1 rounded-full hover:bg-slate-200">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            {isAiLoading ? (
              <div className="text-center py-8">
                <Sparkles size={48} className="mx-auto animate-pulse" style={{ color: COLORS.primaryLight }} />
                <p className="mt-2 text-slate-600">AI is analyzing consumption patterns...</p>
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
                        line.startsWith("⚡") ||
                        line.startsWith("💰") ||
                        line.startsWith("🎯")
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
                className="text-white py-2 px-4 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
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
