import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, RefreshCw, Download, Plus } from "lucide-react"
import { COLORS } from "@/lib/constants"
import { DashboardMetric, FilterOption } from "@/lib/types"

// Reusable Metric Card Component  
interface MetricCardProps {
  metric: DashboardMetric
  isDarkMode?: boolean
  onClick?: () => void
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, isDarkMode, onClick }) => {
  const IconComponent = require("lucide-react")[metric.icon]
  
  return (
    <Card 
      className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {metric.title}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {metric.value} {metric.unit && <span className="text-sm font-normal">{metric.unit}</span>}
              </p>
              {metric.change && (
                <Badge 
                  variant={metric.changeType === 'increase' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                </Badge>
              )}
            </div>
          </div>
          <div className="p-3 rounded-full" style={{ backgroundColor: metric.color + '20' }}>
            <IconComponent size={24} style={{ color: metric.color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Module Header Component
interface ModuleHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  metrics?: DashboardMetric[]
  isDarkMode?: boolean
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  description,
  actions,
  metrics,
  isDarkMode
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h1>
          {description && (
            <p className={`mt-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} isDarkMode={isDarkMode} />
          ))}
        </div>
      )}
    </div>
  )
}

// Advanced Filter Bar Component
interface FilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: FilterOption[]
  selectedFilters?: string[]
  onFilterChange?: (filterId: string, value: string) => void
  onRefresh?: () => void
  onExport?: () => void
  onAdd?: () => void
  isLoading?: boolean
  isDarkMode?: boolean
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  filters = [],
  selectedFilters = [],
  onFilterChange,
  onRefresh,
  onExport,
  onAdd,
  isLoading,
  isDarkMode
}) => {
  return (
    <Card className={`p-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filters */}
        {filters.map((filter) => (
          <Select
            key={filter.id}
            value={selectedFilters.find(f => f.startsWith(filter.id))?.split(':')[1] || ''}
            onValueChange={(value) => onFilterChange?.(filter.id, value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All {filter.label}</SelectItem>
              {/* Add filter options dynamically */}
            </SelectContent>
          </Select>
        ))}
        
        {/* Actions */}
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          
          {onAdd && (
            <Button size="sm" onClick={onAdd} style={{ backgroundColor: COLORS.primary }}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

// Status Badge Component
interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant, size = 'default' }) => {
  const getVariant = () => {
    if (variant) return variant
    
    switch (status.toLowerCase()) {
      case 'active':
      case 'operational':
      case 'excellent':
      case 'normal':
        return 'success' as const
      case 'warning':
      case 'maintenance':
      case 'fair':
        return 'warning' as const
      case 'critical':
      case 'offline':
      case 'poor':
      case 'error':
        return 'destructive' as const
      default:
        return 'default' as const
    }
  }
  
  return (
    <Badge variant={getVariant()} className={size === 'sm' ? 'text-xs' : ''}>
      {status}
    </Badge>
  )
}

// Loading Skeleton Component
interface LoadingSkeletonProps {
  type: 'card' | 'table' | 'chart' | 'list'
  count?: number
  isDarkMode?: boolean
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type, 
  count = 1, 
  isDarkMode 
}) => {
  const baseClass = `animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded`
  
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="space-y-4">
            <div className={`h-4 ${baseClass} w-3/4`}></div>
            <div className={`h-8 ${baseClass} w-1/2`}></div>
            <div className={`h-4 ${baseClass} w-full`}></div>
          </div>
        )
      case 'table':
        return (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className={`h-4 ${baseClass} w-1/4`}></div>
                <div className={`h-4 ${baseClass} w-1/3`}></div>
                <div className={`h-4 ${baseClass} w-1/6`}></div>
                <div className={`h-4 ${baseClass} w-1/4`}></div>
              </div>
            ))}
          </div>
        )
      case 'chart':
        return <div className={`h-64 ${baseClass} w-full`}></div>
      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`h-10 w-10 ${baseClass} rounded-full`}></div>
                <div className="space-y-2 flex-1">
                  <div className={`h-4 ${baseClass} w-3/4`}></div>
                  <div className={`h-3 ${baseClass} w-1/2`}></div>
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return <div className={`h-20 ${baseClass} w-full`}></div>
    }
  }
  
  return (
    <Card className={`p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      {renderSkeleton()}
    </Card>
  )
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number; className?: string }>
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  isDarkMode?: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  isDarkMode
}) => {
  return (
    <Card className={`p-12 text-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col items-center space-y-4">
        {Icon && (
          <Icon size={48} className={isDarkMode ? 'text-slate-400' : 'text-slate-300'} />
        )}
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h3>
          <p className={`mt-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {description}
          </p>
        </div>
        {action && (
          <Button onClick={action.onClick} style={{ backgroundColor: COLORS.primary }}>
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  )
}
