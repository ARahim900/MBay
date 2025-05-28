"use client"

import type React from "react"
import { useState } from "react"
import { Search, Bell, ChevronDown, Download, Settings, Moon, Sun, Wifi, WifiOff } from "lucide-react"
import { COLORS } from "@/lib/constants"

interface HeaderProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
  isCollapsed: boolean
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, isCollapsed }) => {
  const [connectionStatus, setConnectionStatus] = useState("online")

  const headerBg = isDarkMode ? COLORS.navy : COLORS.white
  const borderColor = isDarkMode ? COLORS.navyLight : "rgb(226 232 240)"

  return (
    <div
      className="shadow-md p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 print:hidden border-b"
      style={{ backgroundColor: headerBg, borderColor: borderColor }}
    >
      <div className="mb-3 md:mb-0">
        <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>Operations Dashboard</h1>
        <div className="flex items-center space-x-4">
          <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}>
            Muscat Bay Utilities & Services Overview
          </p>
          <div className="flex items-center space-x-1">
            {connectionStatus === "online" ? (
              <>
                <Wifi size={14} style={{ color: COLORS.success }} />
                <span className="text-xs" style={{ color: COLORS.success }}>
                  Online
                </span>
              </>
            ) : (
              <>
                <WifiOff size={14} style={{ color: COLORS.error }} />
                <span className="text-xs" style={{ color: COLORS.error }}>
                  Offline
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-5">
        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search systems..."
            className={`pl-11 pr-4 py-2.5 w-full sm:w-48 md:w-72 border rounded-lg focus:ring-2 outline-none text-sm transition-all ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                : "bg-white border-slate-300 text-slate-900"
            }`}
            style={{ "--tw-ring-color": COLORS.teal }}
          />
        </div>

        {/* Action Buttons */}
        <button
          className={`p-2.5 rounded-lg transition-colors group hidden sm:block ${
            isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
          }`}
          title="Export Data"
        >
          <Download size={22} style={{ color: COLORS.gold }} className="group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={toggleDarkMode}
          className={`p-2.5 rounded-lg transition-colors group hidden md:block ${
            isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
          }`}
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <Sun size={22} style={{ color: COLORS.gold }} className="group-hover:scale-110 transition-transform" />
          ) : (
            <Moon size={22} style={{ color: COLORS.primary }} className="group-hover:scale-110 transition-transform" />
          )}
        </button>

        <button
          className={`p-2.5 rounded-lg transition-colors group hidden lg:block ${
            isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
          }`}
          title="Settings"
        >
          <Settings size={22} style={{ color: COLORS.teal }} className="group-hover:scale-110 transition-transform" />
        </button>

        {/* Notifications */}
        <button
          className={`p-2.5 rounded-lg relative transition-colors group ${
            isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
          }`}
          title="Notifications"
        >
          <Bell size={22} style={{ color: COLORS.primary }} className="group-hover:scale-110 transition-transform" />
          <span
            className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2"
            style={{ backgroundColor: COLORS.error, borderColor: headerBg }}
          ></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <img
            src={`/placeholder.svg?height=40&width=40&text=MB`}
            alt="User Avatar"
            className="w-10 h-10 rounded-full border-2 transition-all"
            style={{ borderColor: COLORS.teal }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = COLORS.primary)}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = COLORS.teal)}
          />
          <div className="hidden md:block">
            <span className={`text-sm font-semibold block ${isDarkMode ? "text-white" : "text-slate-700"}`}>
              Muscat Bay Admin
            </span>
            <span className={`text-xs ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}>Administrator</span>
          </div>
          <ChevronDown
            size={18}
            className={`transition-colors hidden md:block ${isDarkMode ? "text-slate-300 group-hover:text-white" : "text-slate-500 group-hover:text-slate-800"}`}
          />
        </div>
      </div>
    </div>
  )
}
