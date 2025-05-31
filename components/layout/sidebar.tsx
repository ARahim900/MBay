'use client';

import React from 'react';
import { Power, Menu, Zap, Droplets, Combine, UserCheck } from 'lucide-react';
import { COLORS, MAIN_SECTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

// ===============================
// SIDEBAR COMPONENT
// ===============================

interface SidebarProps {
  activeMainSection: string;
  setActiveMainSection: (section: string) => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeMainSection, 
  setActiveMainSection, 
  isCollapsed, 
  toggleSidebar, 
  isDarkMode 
}) => {
  const getIcon = (iconName: string) => {
    const iconMap = {
      Zap,
      Droplets,
      Combine,
      UserCheck,
    };
    return iconMap[iconName as keyof typeof iconMap] || Zap;
  };

  return (
    <div 
      className={cn(
        "text-slate-100 p-5 space-y-8 min-h-screen shadow-2xl print:hidden transition-all duration-300 ease-in-out relative",
        isCollapsed ? 'w-16' : 'w-64'
      )} 
      style={{
        backgroundColor: isDarkMode ? '#1e1e2e' : COLORS.primaryDark
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 bg-white rounded-full p-2 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200"
        style={{ color: COLORS.primary }}
      >
        <Menu size={16} />
      </button>

      {/* Logo */}
      <div className={cn(
        "text-3xl font-bold flex items-center space-x-3 text-white",
        isCollapsed ? 'justify-center' : ''
      )}>
        <Power 
          size={32} 
          style={{ color: COLORS.primaryLight }} 
          className="animate-pulse flex-shrink-0"
        /> 
        {!isCollapsed && <span>Muscat Bay OMS</span>}
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {MAIN_SECTIONS.map(section => {
          const IconComponent = getIcon(section.icon);
          const isActive = section.id === activeMainSection;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveMainSection(section.id)}
              className={cn(
                "w-full flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out group hover:text-white relative",
                isCollapsed ? 'justify-center' : 'space-x-3',
                isActive ? 'text-white' : 'text-white'
              )}
              style={isActive ? { backgroundColor: COLORS.primary, color: 'white' } : {color: 'white'}}
              onMouseOver={(e) => { 
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = COLORS.primaryLight; 
                  e.currentTarget.style.color = 'white'; 
                }
              }}
              onMouseOut={(e) => { 
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'; 
                  e.currentTarget.style.color = 'white';
                }
              }}
              title={isCollapsed ? section.name : ''}
            >
              <IconComponent 
                size={22} 
                className="group-hover:scale-110 transition-transform text-white flex-shrink-0" 
              />
              {!isCollapsed && <span className="font-medium">{section.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div 
          className="mt-auto p-4 bg-slate-700 bg-opacity-30 rounded-lg text-center border" 
          style={{borderColor: COLORS.primaryLight}}
        >
          <p className="text-sm" style={{color: COLORS.primaryLight}}>
            Operations Management Suite
          </p>
          <button 
            className="mt-3 w-full text-white py-2.5 px-4 rounded-lg text-sm font-semibold shadow-lg transition-all"
            style={{ backgroundColor: COLORS.primary }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryDark} 
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
          >
            Global Settings
          </button>
        </div>
      )}
    </div>
  );
};
