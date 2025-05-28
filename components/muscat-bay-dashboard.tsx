"use client"

import { useState } from "react"
import { Columns } from "lucide-react"
import { COLORS } from "@/lib/constants"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ElectricitySystemModule } from "@/components/modules/electricity-system"
import { WaterAnalysisModule } from "@/components/modules/water-analysis"
import { STPPlantModule } from "@/components/modules/stp-plant"
import { ContractorTrackerModule } from "@/components/modules/contractor-tracker"

const MuscatBayDashboard = () => {
  const [activeMainSection, setActiveMainSection] = useState("ElectricitySystem")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  const renderMainContent = () => {
    switch (activeMainSection) {
      case "ElectricitySystem":
        return <ElectricitySystemModule isDarkMode={isDarkMode} />
      case "WaterAnalysis":
        return <WaterAnalysisModule />
      case "STPPlant":
        return <STPPlantModule />
      case "ContractorTracker":
        return <ContractorTrackerModule />
      default:
        return (
          <div className="flex-1 p-8 space-y-8">
            <div
              className="bg-white p-10 rounded-xl shadow-lg text-center border border-slate-200"
              style={{ backgroundColor: isDarkMode ? COLORS.navyLight : COLORS.white }}
            >
              <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-700"}`}>
                Module Not Found
              </h2>
              <p className={`${isDarkMode ? "text-slate-300" : "text-slate-500"}`}>
                The requested module could not be found.
              </p>
              <Columns size={48} className="mx-auto mt-6 text-slate-400" style={{ color: COLORS.teal }} />
            </div>
          </div>
        )
    }
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

      <Sidebar
        activeMainSection={activeMainSection}
        setActiveMainSection={setActiveMainSection}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
      />

      <div className="flex-1 flex flex-col max-h-screen overflow-y-auto">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} isCollapsed={isCollapsed} />

        <main className={`flex-1 p-6 md:p-8 space-y-6 md:space-y-8`}>{renderMainContent()}</main>
      </div>
    </div>
  )
}

export default MuscatBayDashboard
