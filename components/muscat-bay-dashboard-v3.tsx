'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ElectricitySystemModule } from '@/components/modules/electricity-system-v3';
import { WaterAnalysisModule } from '@/components/modules/water-analysis-v2';
import { STPPlantModule } from '@/components/modules/stp-plant';
import { ContractorTrackerModule } from '@/components/modules/contractor-tracker';
import { EmptyState } from '@/components/shared/ui-components';
import { COLORS } from '@/lib/constants';
import { Columns } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===============================
// MAIN DASHBOARD APPLICATION
// ===============================

const MuscatBayDashboard: React.FC = () => {
  // Application state
  const [activeMainSection, setActiveMainSection] = useState('ElectricitySystem');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handlers
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Render main content based on active section
  const renderMainContent = () => {
    switch(activeMainSection) {
      case 'ElectricitySystem':
        return <ElectricitySystemModule isDarkMode={isDarkMode} />;
      case 'WaterAnalysis': 
        return <WaterAnalysisModule />;
      case 'STPPlant': 
        return <STPPlantModule />;
      case 'ContractorTracker': 
        return <ContractorTrackerModule />;
      default: 
        return (
          <div className="flex-1 p-8 space-y-8"> 
            <EmptyState
              icon={<Columns size={48} style={{color: COLORS.primaryLight}} />}
              title="Module Not Found"
              description="The requested module could not be found. Please select a valid section from the navigation."
            />
          </div>
        );
    }
  };

  return (
    <div className={cn(
      "flex min-h-screen font-inter transition-colors duration-300",
      isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
    )}>
      {/* Custom CSS for text selection */}
      <style jsx global>{`
        ::selection { 
          background-color: ${COLORS.primaryLight}; 
          color: white; 
        }
      `}</style>
      
      {/* Sidebar */}
      <Sidebar 
        activeMainSection={activeMainSection} 
        setActiveMainSection={setActiveMainSection} 
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-h-screen overflow-y-auto">
        {/* Header */}
        <Header 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode}
          isCollapsed={isCollapsed}
        />
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 p-6 md:p-8 space-y-6 md:space-y-8",
          isDarkMode ? 'bg-slate-900' : ''
        )}>
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default MuscatBayDashboard;
