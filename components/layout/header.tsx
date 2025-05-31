'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Download, 
  Settings, 
  Moon, 
  Sun, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

// ===============================
// HEADER COMPONENT
// ===============================

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  isDarkMode, 
  toggleDarkMode, 
  isCollapsed 
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');

  return (
    <div className="bg-white shadow-md p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 print:hidden border-b border-slate-200">
      <div className="mb-3 md:mb-0">
        <h1 className="text-2xl font-bold text-slate-800">Operations Dashboard</h1>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-slate-500">Muscat Bay Utilities & Services Overview</p>
          <div className="flex items-center space-x-1">
            {connectionStatus === 'online' ? (
              <>
                <Wifi size={14} className="text-green-500" />
                <span className="text-xs text-green-600">Online</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-red-500" />
                <span className="text-xs text-red-600">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-5">
        {/* Search */}
        <div className="relative">
          <Search 
            size={20} 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" 
          />
          <input 
            type="text" 
            placeholder="Search systems..." 
            className={cn(
              "pl-11 pr-4 py-2.5 w-full sm:w-48 md:w-72 border border-slate-300 rounded-lg",
              "focus:ring-2 outline-none text-sm transition-all"
            )}
            style={{ '--tw-ring-color': COLORS.primaryLight }} 
          />
        </div>

        {/* Action Buttons */}
        <button 
          className="p-2.5 rounded-lg hover:bg-slate-100 transition-colors group hidden sm:block" 
          title="Export Data"
        > 
          <Download size={22} className="text-slate-600 group-hover:text-slate-800" /> 
        </button>
        
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 rounded-lg hover:bg-slate-100 transition-colors group hidden md:block" 
          title="Toggle Theme"
        > 
          {isDarkMode ? 
            <Sun size={22} className="text-slate-600 group-hover:text-slate-800" /> : 
            <Moon size={22} className="text-slate-600 group-hover:text-slate-800" />
          }
        </button>
        
        <button 
          className="p-2.5 rounded-lg hover:bg-slate-100 transition-colors group hidden lg:block" 
          title="Settings"
        > 
          <Settings size={22} className="text-slate-600 group-hover:text-slate-800" /> 
        </button>

        {/* Notifications */}
        <button 
          className="p-2.5 rounded-lg hover:bg-slate-100 relative transition-colors group" 
          title="Notifications"
        > 
          <Bell size={22} className="text-slate-600 group-hover:text-slate-800" /> 
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <img 
            src={`https://placehold.co/40x40/${COLORS.primary.substring(1)}/FFFFFF?text=MB&font=Inter`} 
            alt="User Avatar" 
            className="w-10 h-10 rounded-full border-2 transition-all" 
            style={{ borderColor: COLORS.primaryLight }} 
            onMouseOver={(e) => e.currentTarget.style.borderColor = COLORS.primary} 
            onMouseOut={(e) => e.currentTarget.style.borderColor = COLORS.primaryLight} 
          />
          <div className="hidden md:block"> 
            <span className="text-sm text-slate-700 font-semibold block">Muscat Bay Admin</span> 
            <span className="text-xs text-slate-500">Administrator</span> 
          </div>
          <ChevronDown 
            size={18} 
            className="text-slate-500 group-hover:text-slate-800 transition-colors hidden md:block" 
          />
        </div>
      </div>
    </div>
  );
};
