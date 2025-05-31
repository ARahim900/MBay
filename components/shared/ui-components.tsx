'use client';

import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { COLORS } from '@/lib/constants';
import { SummaryCardProps, ChartWrapperProps, StyledSelectProps } from '@/lib/types';
import { cn } from '@/lib/utils';

// ===============================
// SUMMARY CARD COMPONENT
// ===============================

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  icon, 
  unit, 
  trend, 
  trendColor, 
  iconBgColor, 
  isLoading 
}) => {
  const IconComponent = icon;
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-slate-100">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-slate-500 font-semibold text-md">{title}</h3>
        <div 
          className="p-3 rounded-full text-white shadow-md"
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
          {trend && (
            <p className={cn("text-xs sm:text-sm font-medium", trendColor)}>
              {trend}
            </p>
          )}
        </>
      )}
    </div>
  );
};

// ===============================
// CHART WRAPPER COMPONENT
// ===============================

export const ChartWrapper: React.FC<ChartWrapperProps> = ({ 
  title, 
  children, 
  subtitle, 
  actions 
}) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-semibold text-slate-700">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
    <div className="mt-4" style={{ height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

// ===============================
// STYLED SELECT COMPONENT
// ===============================

export const StyledSelect: React.FC<StyledSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  id, 
  icon: Icon, 
  disabled 
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
          className={cn(
            "appearance-none w-full p-2.5 pr-10 border border-slate-300 rounded-lg text-sm",
            "focus:ring-2 focus:outline-none bg-white text-slate-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "hover:border-slate-400 transition-colors"
          )}
          style={{ 
            '--tw-ring-color': COLORS.primaryLight, 
            borderColor: 'rgb(203 213 225 / 1)', 
            ringColor: COLORS.primaryLight 
          }} 
        >
          {options.map(option => ( 
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
  );
};

// ===============================
// LOADING SPINNER COMPONENT
// ===============================

export const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({ 
  size = 24, 
  className 
}) => (
  <div className={cn("flex justify-center items-center", className)}>
    <div 
      className="animate-spin rounded-full border-4 border-slate-200 border-t-primary" 
      style={{
        width: size,
        height: size,
        borderTopColor: COLORS.primary
      }}
    />
  </div>
);

// ===============================
// STATUS BADGE COMPONENT
// ===============================

export const StatusBadge: React.FC<{
  status: 'active' | 'completed' | 'pending' | 'on-hold' | 'good' | 'normal' | 'warning' | 'critical' | 'operational' | 'maintenance' | 'offline';
  children: React.ReactNode;
  className?: string;
}> = ({ status, children, className }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
      case 'operational':
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'on-hold':
      case 'maintenance':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      getStatusStyles(status),
      className
    )}>
      {children}
    </span>
  );
};

// ===============================
// PROGRESS BAR COMPONENT
// ===============================

export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  color?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  value, 
  max = 100, 
  color = COLORS.primary, 
  showPercentage = true, 
  size = 'md',
  className 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-slate-600">
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      <div className={cn("w-full bg-slate-200 rounded-full", sizeClasses[size])}>
        <div 
          className={cn("rounded-full transition-all duration-500", sizeClasses[size])}
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color 
          }}
        />
      </div>
    </div>
  );
};

// ===============================
// METRIC CARD COMPONENT
// ===============================

export const MetricCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'same';
    period?: string;
  };
  className?: string;
}> = ({ label, value, unit, change, className }) => {
  const getChangeColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getChangeIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <div className={cn("bg-slate-50 rounded-lg p-4", className)}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-slate-700 text-sm">{label}</h4>
          <p className="text-lg font-bold text-slate-800 mt-1">
            {value} {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
          </p>
        </div>
        {change && (
          <div className={cn("text-xs font-medium", getChangeColor(change.direction))}>
            <span className="mr-1">{getChangeIcon(change.direction)}</span>
            {Math.abs(change.value).toFixed(1)}%
            {change.period && <span className="text-slate-500 ml-1">{change.period}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

// ===============================
// EMPTY STATE COMPONENT
// ===============================

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, title, description, action, className }) => (
  <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
    {icon && <div className="mb-4 text-slate-400">{icon}</div>}
    <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
    {description && <p className="text-slate-500 mb-4 max-w-md">{description}</p>}
    {action && <div>{action}</div>}
  </div>
);
