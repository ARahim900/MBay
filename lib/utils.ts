// ===============================
// UTILITY FUNCTIONS
// ===============================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ElectricityDataItem } from "./types";

// Tailwind CSS utility function
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===============================
// DATA PARSING UTILITIES
// ===============================

export const extractCategory = (unitName: string): string => {
  if (!unitName) return 'Other';
  const lowerUnitName = unitName.toLowerCase();
  
  if (lowerUnitName.includes('pumping station')) return 'Pumping Station';
  if (lowerUnitName.includes('lifting station')) return 'Lifting Station';
  if (lowerUnitName.includes('street light')) return 'Street Light';
  if (lowerUnitName.includes('irrigation tank')) return 'Irrigation Tank';
  if (lowerUnitName.includes('actuator db')) return 'Actuator DB';
  if (lowerUnitName.includes('apartment')) return 'Apartment';
  if (lowerUnitName.includes('guard house') || 
      lowerUnitName.includes('security building') || 
      lowerUnitName.includes('rop building')) return 'Ancillary Building';
  if (lowerUnitName.includes('central park')) return 'Central Park';
  if (lowerUnitName.includes('village square')) return 'Village Square';
  if (lowerUnitName.includes('bank muscat')) return 'Commercial (Bank)';
  if (lowerUnitName.includes('cif kitchen')) return 'Commercial (Kitchen)';
  if (lowerUnitName.includes('landscape light')) return 'Landscape Light';
  if (lowerUnitName.includes('beachwell')) return 'Beachwell';
  if (lowerUnitName.includes('helipad')) return 'Helipad';
  
  return 'Other';
};

export const parseElectricityData = (rawData: string): ElectricityDataItem[] => {
  const lines = rawData.split('\n');
  const headerLine = lines[0].split('\t').map(h => h.trim());
  const dataLines = lines.slice(1);
  const monthsHeader = headerLine.slice(6);

  return dataLines.map((line, index) => {
    const values = line.split('\t');
    const unitName = values[4]?.trim() || 'N/A';
    
    const entry: ElectricityDataItem = {
      id: parseInt(values[0], 10) || index + 1,
      slNo: parseInt(values[0], 10) || index + 1,
      zone: values[1]?.trim() || 'N/A',
      type: values[2]?.trim() || 'N/A',
      muscatBayNumber: values[3]?.trim() || 'N/A',
      unitName: unitName,
      category: extractCategory(unitName),
      meterAccountNo: values[5]?.trim() || 'N/A',
      consumption: {},
      totalConsumption: 0,
    };

    let currentOverallTotal = 0;
    monthsHeader.forEach((month, i) => {
      const consumptionValue = parseFloat(values[6 + i]);
      entry.consumption[month] = isNaN(consumptionValue) ? 0 : consumptionValue;
      if (!isNaN(consumptionValue)) {
        currentOverallTotal += consumptionValue;
      }
    });

    entry.totalConsumption = parseFloat(currentOverallTotal.toFixed(2));
    return entry;
  });
};

// ===============================
// FORMATTING UTILITIES
// ===============================

export const formatNumber = (value: number, options?: {
  decimals?: number;
  locale?: string;
  currency?: string;
}): string => {
  const { decimals = 0, locale = 'en-US', currency } = options || {};
  
  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// ===============================
// DATE UTILITIES
// ===============================

export const formatDate = (date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return dateObj.toLocaleDateString('en-US');
  }
};

export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return formatDate(dateObj);
};

// ===============================
// VALIDATION UTILITIES
// ===============================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

// ===============================
// ARRAY UTILITIES
// ===============================

export const sortArray = <T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const unique = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// ===============================
// LOCAL STORAGE UTILITIES
// ===============================

export const setLocalStorage = (key: string, value: any): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
};

// ===============================
// DEBOUNCE UTILITY
// ===============================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ===============================
// CHART UTILITIES
// ===============================

export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    '#6A5ACD', '#FFA07A', '#20B2AA', '#FF69B4', '#9370DB', 
    '#F08080', '#4682B4', '#32CD32', '#FF6347', '#4169E1'
  ];
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
};

export const calculateTrend = (
  current: number,
  previous: number
): { value: number; direction: 'up' | 'down' | 'same'; percentage: number } => {
  if (previous === 0) {
    return { value: current, direction: 'same', percentage: 0 };
  }
  
  const percentage = ((current - previous) / previous) * 100;
  const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'same';
  
  return {
    value: current - previous,
    direction,
    percentage: Math.abs(percentage)
  };
};
