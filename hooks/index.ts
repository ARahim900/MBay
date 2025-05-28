import { useState, useEffect, useCallback, useMemo } from "react"
import { ApiResponse, PaginationInfo } from "@/lib/types"
import { PAGINATION_DEFAULTS, REFRESH_INTERVALS } from "@/lib/config/modules"

// Generic Data Fetching Hook
export function useDataFetching<T>(
  endpoint: string,
  moduleId: keyof typeof PAGINATION_DEFAULTS,
  options?: {
    autoRefresh?: boolean
    refreshInterval?: number
    dependencies?: any[]
  }
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // In a real app, replace with actual API call
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const result: ApiResponse<T[]> = await response.json()
      
      if (result.success) {
        setData(result.data)
        setLastUpdated(new Date())
      } else {
        throw new Error(result.message || 'Failed to fetch data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...(options?.dependencies || [])])

  // Auto-refresh functionality
  useEffect(() => {
    if (!options?.autoRefresh) return

    const interval = options.refreshInterval || REFRESH_INTERVALS[moduleId] || 60000
    const timer = setInterval(fetchData, interval)

    return () => clearInterval(timer)
  }, [fetchData, options?.autoRefresh, options?.refreshInterval, moduleId])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  }
}

// Pagination Hook
export function usePagination<T>(
  data: T[],
  moduleId: keyof typeof PAGINATION_DEFAULTS
) {
  const defaults = PAGINATION_DEFAULTS[moduleId]
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(defaults.itemsPerPage)

  const paginationInfo: PaginationInfo = useMemo(() => {
    const totalItems = data.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage
    }
  }, [data.length, currentPage, itemsPerPage])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, itemsPerPage])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationInfo.totalPages)))
  }, [paginationInfo.totalPages])

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  return {
    paginatedData,
    paginationInfo,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage
  }
}

// Search and Filter Hook
export function useSearchAndFilter<T>(
  data: T[],
  searchFields: (keyof T)[],
  filterConfig?: Record<string, (item: T, value: string) => boolean>
) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})

  const filteredData = useMemo(() => {
    let result = data

    // Apply search
    if (searchTerm) {
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field]
          if (value == null) return false
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply filters
    if (filterConfig) {
      Object.entries(filters).forEach(([filterKey, filterValue]) => {
        if (filterValue && filterConfig[filterKey]) {
          result = result.filter(item => filterConfig[filterKey](item, filterValue))
        }
      })
    }

    return result
  }, [data, searchTerm, filters, searchFields, filterConfig])

  const setFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchTerm('')
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
    filteredData
  }
}

// Sorting Hook
export function useSorting<T>(data: T[], defaultSort?: { field: keyof T; order: 'asc' | 'desc' }) {
  const [sortField, setSortField] = useState<keyof T | null>(defaultSort?.field || null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSort?.order || 'asc')

  const sortedData = useMemo(() => {
    if (!sortField) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      let comparison = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal)
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime()
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })
  }, [data, sortField, sortOrder])

  const toggleSort = useCallback((field: keyof T) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }, [sortField, sortOrder])

  return {
    sortedData,
    sortField,
    sortOrder,
    toggleSort
  }
}

// Local Storage Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key)
        return item ? JSON.parse(item) : initialValue
      }
      return initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}

// Dark Mode Hook
export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false)

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [setIsDarkMode])

  // Apply dark mode class to html element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement
      if (isDarkMode) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
  }, [isDarkMode])

  return { isDarkMode, toggleDarkMode }
}

// Notification Hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: Date
    read: boolean
  }>>([])

  const addNotification = useCallback((
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string
  ) => {
    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    }
    
    setNotifications(prev => [notification, ...prev])
    
    // Auto-remove after 5 seconds for success/info
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        removeNotification(notification.id)
      }, 5000)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  return {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll
  }
}

// Export Hook
export function useExport() {
  const [exporting, setExporting] = useState(false)

  const exportToCSV = useCallback(async (data: any[], filename: string) => {
    setExporting(true)
    try {
      // Convert data to CSV
      const headers = Object.keys(data[0] || {})
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => JSON.stringify(row[header] || '')).join(',')
        )
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    } finally {
      setExporting(false)
    }
  }, [])

  const exportToPDF = useCallback(async (data: any[], filename: string) => {
    setExporting(true)
    try {
      // This would require a PDF library like jsPDF
      // Implementation depends on your specific needs
      console.log('PDF export not implemented yet')
    } catch (error) {
      console.error('PDF export failed:', error)
      throw error
    } finally {
      setExporting(false)
    }
  }, [])

  return {
    exporting,
    exportToCSV,
    exportToPDF
  }
}
