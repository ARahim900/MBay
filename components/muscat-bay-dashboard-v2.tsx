"use client"

import React, { useState, Suspense, lazy } from "react"
import { Columns, AlertCircle } from "lucide-react"
import { MODULE_CONFIGS, ICON_MAP, NAVIGATION_ITEMS } from "@/lib/config/modules"
import { COLORS } from "@/lib/constants"
import { useDarkMode, useNotifications } from "@/hooks"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header" 
import { LoadingSkeleton, EmptyState } from "@/components/shared"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Lazy load modules for better performance
const ElectricitySystemModule = lazy(() => import("@/components/modules/electricity-system-v2"))
// IMPORTANT: Using NEW water-analysis-v2 component with meter exclusions (4300336 & 4300338)
const WaterAnalysisModuleV2 = lazy(() => import("@/components/modules/water-analysis-v2"))
const STPPlantModule = lazy(() => import("@/components/modules/stp-plant"))
const ContractorTrackerModule = lazy(() => import("@/components/modules/contractor-tracker"))

// Dashboard Overview Component
const DashboardOverview = lazy(() => 
  import("@/components/modules/dashboard-overview").catch(() => 
    // Fallback if dashboard overview doesn't exist
    ({ default: () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.values(MODULE_CONFIGS)
            .filter(module => module.enabled && module.id !== 'dashboard')
            .map(module => {
              const IconComponent = ICON_MAP[module.icon as keyof typeof ICON_MAP]
              return (
                <div
                  key={module.id}
                  className="p-6 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200 cursor-pointer"
                  style={{ borderLeft: `4px solid ${module.color}` }}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent size={24} style={{ color: module.color }} />
                    <div>
                      <h3 className="font-semibold text-slate-900">{module.name}</h3>
                      <p className="text-sm text-slate-600">{module.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    )})
  )
)

// Error Boundary Component
class ModuleErrorBoundary extends React.Component<
  { children: React.ReactNode; moduleName: string; isDarkMode: boolean },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.moduleName} module:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          icon={AlertCircle}
          title={`${this.props.moduleName} Module Error`}
          description={`Failed to load the ${this.props.moduleName} module. Please try refreshing the page.`}
          action={{
            label: "Reload Module",
            onClick: () => {
              this.setState({ hasError: false })
              window.location.reload()
            }
          }}
          isDarkMode={this.props.isDarkMode}
        />
      )
    }

    return this.props.children
  }
}

// Module Loading Fallback
const ModuleLoadingFallback: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <LoadingSkeleton type="card" count={3} isDarkMode={isDarkMode} />
)

const MuscatBayDashboard = () => {
  const [activeMainSection, setActiveMainSection] = useState("dashboard")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { notifications, unreadCount } = useNotifications()

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  // Get current module config
  const currentModule = Object.values(MODULE_CONFIGS).find(
    module => module.id === activeMainSection
  ) || MODULE_CONFIGS.dashboard

  const renderMainContent = () => {
    const ModuleComponent = () => {
      switch (activeMainSection) {
        case "dashboard":
          return <DashboardOverview isDarkMode={isDarkMode} />
        case "electricity":
          return <ElectricitySystemModule isDarkMode={isDarkMode} />
        case "water":
          return <WaterAnalysisModuleV2 isDarkMode={isDarkMode} />
        case "stp":
          return <STPPlantModule isDarkMode={isDarkMode} />
        case "contractors":
          return <ContractorTrackerModule isDarkMode={isDarkMode} />
        default:
          return (
            <EmptyState
              icon={Columns}
              title="Module Not Found"
              description={`The requested module "${activeMainSection}" could not be found.`}
              action={{
                label: "Go to Dashboard",
                onClick: () => setActiveMainSection("dashboard")
              }}
              isDarkMode={isDarkMode}
            />
          )
      }
    }

    return (
      <ModuleErrorBoundary moduleName={currentModule.name} isDarkMode={isDarkMode}>
        <Suspense fallback={<ModuleLoadingFallback isDarkMode={isDarkMode} />}>
          <ModuleComponent />
        </Suspense>
      </ModuleErrorBoundary>
    )
  }

  const mainBgColor = isDarkMode ? COLORS.navy : COLORS.offWhite1
  const selectionColor = isDarkMode ? COLORS.teal : COLORS.primaryLight

  return (
    <div
      className={`flex min-h-screen font-inter transition-colors duration-300`}
      style={{
        backgroundColor: mainBgColor,
        "--selection-bg": selectionColor,
        "--selection-text": "white",
      }}
    >
      <style>{`
        ::selection { 
          background-color: var(--selection-bg); 
          color: var(--selection-text); 
        }
        
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${isDarkMode ? COLORS.navyLight : "#f1f5f9"};
        }
        ::-webkit-scrollbar-thumb {
          background: ${COLORS.teal};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${COLORS.primary};
        }
      `}</style>

      {/* Enhanced Sidebar with new configuration */}
      <EnhancedSidebar
        activeMainSection={activeMainSection}
        setActiveMainSection={setActiveMainSection}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        navigationItems={NAVIGATION_ITEMS}
      />

      <div className="flex-1 flex flex-col max-h-screen overflow-y-auto">
        {/* Enhanced Header with notifications */}
        <EnhancedHeader 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
          isCollapsed={isCollapsed}
          currentModule={currentModule}
          notificationCount={unreadCount}
        />

        {/* Error Alerts */}
        {notifications.filter(n => n.type === 'error' && !n.read).length > 0 && (
          <div className="px-6 pt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {notifications.filter(n => n.type === 'error' && !n.read).length} critical alerts require attention
              </AlertDescription>
            </Alert>
          </div>
        )}

        <main className={`flex-1 p-6 md:p-8 space-y-6 md:space-y-8`}>
          {renderMainContent()}
        </main>
      </div>
    </div>
  )
}

// Enhanced Sidebar Component
const EnhancedSidebar: React.FC<{
  activeMainSection: string
  setActiveMainSection: (section: string) => void
  isCollapsed: boolean
  toggleSidebar: () => void
  isDarkMode: boolean
  navigationItems: typeof NAVIGATION_ITEMS
}> = ({ activeMainSection, setActiveMainSection, isCollapsed, toggleSidebar, isDarkMode, navigationItems }) => {
  const sidebarBg = isDarkMode ? COLORS.navy : COLORS.primary
  const hoverBg = isDarkMode ? COLORS.navyLight : COLORS.primaryLight

  return (
    <div
      className={`${isCollapsed ? "w-16" : "w-64"} text-slate-100 p-5 space-y-8 min-h-screen shadow-2xl print:hidden transition-all duration-300 ease-in-out relative`}
      style={{ backgroundColor: sidebarBg }}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 bg-white rounded-full p-2 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200"
        style={{ color: COLORS.primary }}
      >
        <Columns size={16} />
      </button>

      {/* Logo */}
      <div className={`flex items-center space-x-3 text-white ${isCollapsed ? "justify-center" : ""}`}>
        <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.gold + '20' }}>
          <Columns size={24} style={{ color: COLORS.gold }} className="animate-pulse" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-2xl font-bold leading-tight">Muscat Bay</span>
            <span className="text-sm font-medium opacity-90 -mt-1">Assets & Operations</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-6">
        {navigationItems.map((section) => (
          <div key={section.section} className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
                {section.section}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.filter(item => item.enabled).map((item) => {
                const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP]
                const isActive = item.id === activeMainSection
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMainSection(item.id)}
                    style={
                      isActive
                        ? { backgroundColor: COLORS.teal, color: COLORS.navy }
                        : { color: "white" }
                    }
                    className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} p-3 rounded-lg transition-all duration-200 ease-in-out group hover:text-white relative`}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = hoverBg
                        e.currentTarget.style.color = "white"
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent"
                        e.currentTarget.style.color = "white"
                      } else {
                        e.currentTarget.style.backgroundColor = COLORS.teal
                        e.currentTarget.style.color = COLORS.navy
                      }
                    }}
                    title={isCollapsed ? item.name : ""}
                  >
                    <IconComponent
                      size={20}
                      className={`group-hover:scale-110 transition-transform flex-shrink-0`}
                      style={{ color: isActive ? COLORS.navy : "white" }}
                    />
                    {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}

// Enhanced Header Component
const EnhancedHeader: React.FC<{
  isDarkMode: boolean
  toggleDarkMode: () => void
  isCollapsed: boolean
  currentModule: any
  notificationCount: number
}> = ({ isDarkMode, toggleDarkMode, isCollapsed, currentModule, notificationCount }) => {
  return (
    <header className={`p-6 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              System Online
            </span>
          </div>
          <div className="h-4 w-px bg-slate-300"></div>
          <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {currentModule.description}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {notificationCount > 0 && (
            <div className="relative">
              <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {notificationCount}
              </div>
            </div>
          )}
          
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default MuscatBayDashboard
