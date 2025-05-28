"use client"

import type React from "react"
import { ChevronDown } from "lucide-react"
import { COLORS } from "@/lib/constants"

interface SummaryCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ size?: number }>
  unit?: string
  trend?: string
  trendColor?: string
  iconBgColor?: string
  isLoading?: boolean
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  unit,
  trend,
  trendColor,
  iconBgColor,
  isLoading,
}) => {
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

interface ChartWrapperProps {
  title: string
  children: React.ReactNode
  subtitle?: string
  actions?: React.ReactNode
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({ title, children, subtitle, actions }) => (
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

interface StyledSelectProps {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Array<{ value: string; label: string }>
  id: string
  icon?: React.ComponentType<{ size?: number }>
  disabled?: boolean
}

export const StyledSelect: React.FC<StyledSelectProps> = ({
  label,
  value,
  onChange,
  options,
  id,
  icon: Icon,
  disabled,
}) => {
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
          className="appearance-none w-full p-2.5 pr-10 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:outline-none bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{
            "--tw-ring-color": COLORS.teal,
            borderColor: "rgb(203 213 225 / 1)",
            focusRingColor: COLORS.teal,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = COLORS.teal)}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgb(203 213 225 / 1)")}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3"
          style={{ color: COLORS.primary }}
        >
          {Icon ? <Icon size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: number
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24 }) => (
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
