// ===============================
// ELECTRICITY DATABASE UTILITIES
// ===============================

import { 
  ElectricityUnit, 
  ConsumptionRecord, 
  ElectricityUnitCreate,
  ElectricityUnitUpdate,
  ConsumptionRecordCreate,
  ElectricityFilters,
  ElectricityPaginationOptions,
  ElectricityResponse,
  BulkOperationResult,
  ConsumptionAnalytics,
  ValidationResult,
  ValidationError
} from '../types/electricity';

// Constants
export const OMR_PER_KWH = 0.025;
export const MONTHS_ORDER = [
  'November-24', 'December-24', 'January-25', 
  'February-25', 'March-25', 'April-25'
];

// ===============================
// DATA PARSING & TRANSFORMATION
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

export const parseElectricityData = (rawData: string): ElectricityUnit[] => {
  const lines = rawData.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headerLine = lines[0].split('\t').map(h => h.trim());
  const dataLines = lines.slice(1);
  const monthsHeader = headerLine.slice(6); // Months start from index 6

  return dataLines.map((line, index) => {
    const values = line.split('\t').map(v => v.trim());
    const unitName = values[4] || 'N/A';
    const consumption: { [month: string]: number } = {};
    
    let totalConsumption = 0;
    const consumptionValues: number[] = [];
    
    monthsHeader.forEach((month, i) => {
      const consumptionValue = parseFloat(values[6 + i]) || 0;
      consumption[month] = consumptionValue;
      totalConsumption += consumptionValue;
      if (consumptionValue > 0) {
        consumptionValues.push(consumptionValue);
      }
    });

    const averageConsumption = consumptionValues.length > 0 
      ? consumptionValues.reduce((a, b) => a + b, 0) / consumptionValues.length 
      : 0;
    
    const peakConsumption = consumptionValues.length > 0 
      ? Math.max(...consumptionValues) 
      : 0;
    
    const lowestConsumption = consumptionValues.length > 0 
      ? Math.min(...consumptionValues) 
      : 0;

    return {
      id: parseInt(values[0]) || index + 1,
      slNo: parseInt(values[0]) || index + 1,
      zone: values[1] || 'N/A',
      type: values[2] || 'N/A',
      muscatBayNumber: values[3] || 'N/A',
      unitNumber: values[4] || 'N/A', // Municipality unit number
      unitName: unitName,
      category: extractCategory(unitName),
      meterAccountNo: values[5] || 'N/A',
      consumption,
      totalConsumption: parseFloat(totalConsumption.toFixed(2)),
      averageConsumption: parseFloat(averageConsumption.toFixed(2)),
      peakConsumption: parseFloat(peakConsumption.toFixed(2)),
      lowestConsumption: parseFloat(lowestConsumption.toFixed(2)),
      isActive: true,
      lastUpdated: new Date(),
      createdAt: new Date()
    };
  });
};

// ===============================
// DATA VALIDATION
// ===============================

export const validateElectricityUnit = (data: ElectricityUnitCreate): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.unitName || data.unitName.trim().length === 0) {
    errors.push({ field: 'unitName', message: 'Unit name is required', value: data.unitName });
  }

  if (!data.zone || data.zone.trim().length === 0) {
    errors.push({ field: 'zone', message: 'Zone is required', value: data.zone });
  }

  if (!data.type || data.type.trim().length === 0) {
    errors.push({ field: 'type', message: 'Type is required', value: data.type });
  }

  if (data.slNo && (data.slNo < 1 || data.slNo > 99999)) {
    errors.push({ field: 'slNo', message: 'Serial number must be between 1 and 99999', value: data.slNo });
  }

  if (data.meterAccountNo && data.meterAccountNo.length > 100) {
    errors.push({ field: 'meterAccountNo', message: 'Meter account number too long (max 100 characters)', value: data.meterAccountNo });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateConsumptionRecord = (data: ConsumptionRecordCreate): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.unitId || data.unitId < 1) {
    errors.push({ field: 'unitId', message: 'Valid unit ID is required', value: data.unitId });
  }

  if (!data.month || data.month.trim().length === 0) {
    errors.push({ field: 'month', message: 'Month is required', value: data.month });
  }

  if (!data.year || data.year < 2020 || data.year > 2030) {
    errors.push({ field: 'year', message: 'Year must be between 2020 and 2030', value: data.year });
  }

  if (data.consumption < 0) {
    errors.push({ field: 'consumption', message: 'Consumption cannot be negative', value: data.consumption });
  }

  if (data.consumption > 1000000) {
    errors.push({ field: 'consumption', message: 'Consumption value seems unrealistic (max 1,000,000 kWh)', value: data.consumption });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ===============================
// DATA TRANSFORMATION UTILITIES
// ===============================

export const transformToConsumptionRecords = (units: ElectricityUnit[]): ConsumptionRecordCreate[] => {
  const records: ConsumptionRecordCreate[] = [];

  units.forEach(unit => {
    Object.entries(unit.consumption).forEach(([month, consumption]) => {
      if (consumption > 0) {
        const year = month.includes('-24') ? 2024 : 2025;
        
        records.push({
          unitId: unit.id,
          month,
          year,
          consumption,
          cost: consumption * OMR_PER_KWH,
          isEstimated: false,
          readingDate: new Date(),
          billingDate: new Date()
        });
      }
    });
  });

  return records;
};

export const calculateAnalytics = (units: ElectricityUnit[]): ConsumptionAnalytics[] => {
  return units.map(unit => {
    const consumptionValues = Object.values(unit.consumption).filter(v => v > 0);
    const consumptionEntries = Object.entries(unit.consumption).filter(([_, v]) => v > 0);
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let trendPercentage = 0;

    if (consumptionEntries.length >= 2) {
      const firstHalf = consumptionEntries.slice(0, Math.floor(consumptionEntries.length / 2));
      const secondHalf = consumptionEntries.slice(Math.floor(consumptionEntries.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, [_, v]) => sum + v, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, [_, v]) => sum + v, 0) / secondHalf.length;
      
      trendPercentage = ((secondAvg - firstAvg) / firstAvg) * 100;
      
      if (trendPercentage > 5) trend = 'increasing';
      else if (trendPercentage < -5) trend = 'decreasing';
    }

    const peakEntry = consumptionEntries.reduce((max, current) => 
      current[1] > max[1] ? current : max, ['', 0]);
    
    const lowestEntry = consumptionEntries.reduce((min, current) => 
      current[1] < min[1] ? current : min, ['', Infinity]);

    return {
      unitId: unit.id,
      unitName: unit.unitName,
      totalConsumption: unit.totalConsumption,
      averageMonthlyConsumption: unit.averageConsumption,
      peakMonth: peakEntry[0],
      peakConsumption: peakEntry[1],
      lowestMonth: lowestEntry[0],
      lowestConsumption: lowestEntry[1] === Infinity ? 0 : lowestEntry[1],
      consumptionTrend: trend,
      trendPercentage: parseFloat(trendPercentage.toFixed(2)),
      estimatedAnnualCost: unit.totalConsumption * OMR_PER_KWH * 2, // Extrapolate from 6 months
      category: unit.category,
      zone: unit.zone,
      type: unit.type
    };
  });
};

// ===============================
// FILTERING & SORTING UTILITIES
// ===============================

export const applyFilters = (units: ElectricityUnit[], filters: ElectricityFilters): ElectricityUnit[] => {
  return units.filter(unit => {
    if (filters.zone && unit.zone !== filters.zone) return false;
    if (filters.category && unit.category !== filters.category) return false;
    if (filters.type && unit.type !== filters.type) return false;
    if (filters.unitName && !unit.unitName.toLowerCase().includes(filters.unitName.toLowerCase())) return false;
    if (filters.meterAccountNo && !unit.meterAccountNo.includes(filters.meterAccountNo)) return false;
    if (filters.isActive !== undefined && unit.isActive !== filters.isActive) return false;
    if (filters.minConsumption && unit.totalConsumption < filters.minConsumption) return false;
    if (filters.maxConsumption && unit.totalConsumption > filters.maxConsumption) return false;
    
    return true;
  });
};

export const applySorting = (units: ElectricityUnit[], sortBy?: { field: string; direction: 'asc' | 'desc' }): ElectricityUnit[] => {
  if (!sortBy) return units;

  const { field, direction } = sortBy;
  const multiplier = direction === 'asc' ? 1 : -1;

  return [...units].sort((a, b) => {
    const aValue = (a as any)[field];
    const bValue = (b as any)[field];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * multiplier;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * multiplier;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return (aValue.getTime() - bValue.getTime()) * multiplier;
    }

    return 0;
  });
};

export const applyPagination = <T>(items: T[], page: number, limit: number): { data: T[]; hasNext: boolean; hasPrev: boolean } => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: items.slice(startIndex, endIndex),
    hasNext: endIndex < items.length,
    hasPrev: page > 1
  };
};

// ===============================
// EXPORT UTILITIES
// ===============================

export const exportToCSV = (units: ElectricityUnit[]): string => {
  const headers = [
    'ID', 'SL No', 'Zone', 'Type', 'Unit Name', 'Category', 
    'Meter Account No', 'Total Consumption', 'Average Consumption',
    ...MONTHS_ORDER
  ];

  const rows = units.map(unit => [
    unit.id,
    unit.slNo,
    unit.zone,
    unit.type,
    unit.unitName,
    unit.category,
    unit.meterAccountNo,
    unit.totalConsumption,
    unit.averageConsumption,
    ...MONTHS_ORDER.map(month => unit.consumption[month] || 0)
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

export const exportToJSON = (units: ElectricityUnit[]): string => {
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    totalUnits: units.length,
    data: units
  }, null, 2);
};

// ===============================
// CHART DATA PREPARATION
// ===============================

export const prepareMonthlyTrendData = (units: ElectricityUnit[]) => {
  return MONTHS_ORDER.map(month => {
    const total = units.reduce((acc, unit) => acc + (unit.consumption[month] || 0), 0);
    return {
      name: month.replace('-24', '').replace('-25', ''),
      month,
      total: parseFloat(total.toFixed(2)),
      cost: parseFloat((total * OMR_PER_KWH).toFixed(2))
    };
  });
};

export const prepareCategoryData = (units: ElectricityUnit[]) => {
  const categoryData: { [key: string]: number } = {};
  const totalConsumption = units.reduce((acc, unit) => acc + unit.totalConsumption, 0);

  units.forEach(unit => {
    categoryData[unit.category] = (categoryData[unit.category] || 0) + unit.totalConsumption;
  });

  return Object.entries(categoryData)
    .map(([category, consumption]) => ({
      name: category,
      value: parseFloat(consumption.toFixed(2)),
      percentage: parseFloat(((consumption / totalConsumption) * 100).toFixed(1)),
      cost: parseFloat((consumption * OMR_PER_KWH).toFixed(2))
    }))
    .sort((a, b) => b.value - a.value);
};

export const prepareTopConsumersData = (units: ElectricityUnit[], limit: number = 10) => {
  return units
    .filter(unit => unit.totalConsumption > 0)
    .sort((a, b) => b.totalConsumption - a.totalConsumption)
    .slice(0, limit)
    .map((unit, index) => ({
      rank: index + 1,
      unitId: unit.id,
      unitName: unit.unitName,
      consumption: unit.totalConsumption,
      cost: parseFloat((unit.totalConsumption * OMR_PER_KWH).toFixed(2)),
      zone: unit.zone,
      category: unit.category,
      percentage: parseFloat(((unit.totalConsumption / units.reduce((sum, u) => sum + u.totalConsumption, 0)) * 100).toFixed(1)),
      trend: 'stable' as const, // Would be calculated based on historical data
      monthlyData: unit.consumption
    }));
};

// ===============================
// BULK OPERATIONS
// ===============================

export const validateBulkData = (units: ElectricityUnitCreate[]): BulkOperationResult => {
  let success = 0;
  let failed = 0;
  const errors: Array<{ index: number; error: string; data: any }> = [];

  units.forEach((unit, index) => {
    const validation = validateElectricityUnit(unit);
    
    if (validation.isValid) {
      success++;
    } else {
      failed++;
      errors.push({
        index,
        error: validation.errors.map(e => `${e.field}: ${e.message}`).join(', '),
        data: unit
      });
    }
  });

  return {
    success,
    failed,
    errors,
    totalProcessed: units.length
  };
};

// ===============================
// UTILITY FUNCTIONS
// ===============================

export const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)} OMR`;
};

export const formatConsumption = (kWh: number): string => {
  if (kWh >= 1000000) {
    return `${(kWh / 1000000).toFixed(1)}M kWh`;
  } else if (kWh >= 1000) {
    return `${(kWh / 1000).toFixed(1)}K kWh`;
  }
  return `${kWh.toFixed(1)} kWh`;
};

export const getMonthYear = (monthString: string): { month: string; year: number } => {
  const parts = monthString.split('-');
  const year = parseInt(`20${parts[1]}`);
  return { month: parts[0], year };
};

export const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
