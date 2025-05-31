// ===============================
// ELECTRICITY SYSTEM TYPES
// ===============================

// Enhanced Electricity Data Types for Comprehensive Database Structure
export interface ElectricityConsumption {
  [month: string]: number;
}

export interface ElectricityUnit {
  id: number;
  slNo: number;
  zone: string;
  type: string;
  muscatBayNumber: string;
  unitNumber: string; // Municipality unit number
  unitName: string;
  category: string;
  meterAccountNo: string;
  consumption: ElectricityConsumption;
  totalConsumption: number;
  averageConsumption: number;
  peakConsumption: number;
  lowestConsumption: number;
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
}

// Database Schema Interfaces
export interface ElectricityUnitCreate {
  slNo: number;
  zone: string;
  type: string;
  muscatBayNumber: string;
  unitNumber: string;
  unitName: string;
  meterAccountNo: string;
  category?: string;
  isActive?: boolean;
}

export interface ElectricityUnitUpdate {
  id: number;
  zone?: string;
  type?: string;
  muscatBayNumber?: string;
  unitNumber?: string;
  unitName?: string;
  meterAccountNo?: string;
  category?: string;
  isActive?: boolean;
}

export interface ConsumptionRecord {
  id: number;
  unitId: number;
  month: string;
  year: number;
  consumption: number;
  cost: number;
  billingDate: Date;
  readingDate: Date;
  meterReading: number;
  previousReading: number;
  isEstimated: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsumptionRecordCreate {
  unitId: number;
  month: string;
  year: number;
  consumption: number;
  cost?: number;
  billingDate?: Date;
  readingDate?: Date;
  meterReading?: number;
  previousReading?: number;
  isEstimated?: boolean;
  notes?: string;
}

// Enhanced Analytics Types
export interface ConsumptionAnalytics {
  unitId: number;
  unitName: string;
  totalConsumption: number;
  averageMonthlyConsumption: number;
  peakMonth: string;
  peakConsumption: number;
  lowestMonth: string;
  lowestConsumption: number;
  consumptionTrend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  estimatedAnnualCost: number;
  category: string;
  zone: string;
  type: string;
}

export interface MonthlyTrendData {
  month: string;
  year: number;
  totalConsumption: number;
  unitCount: number;
  averagePerUnit: number;
  cost: number;
  peakUnit: string;
  peakConsumption: number;
}

export interface CategorySummary {
  category: string;
  unitCount: number;
  totalConsumption: number;
  averageConsumption: number;
  percentage: number;
  cost: number;
}

export interface ZoneSummary {
  zone: string;
  unitCount: number;
  totalConsumption: number;
  averageConsumption: number;
  categories: string[];
  cost: number;
}

// Query and Filter Types
export interface ElectricityFilters {
  zone?: string;
  category?: string;
  type?: string;
  unitName?: string;
  meterAccountNo?: string;
  month?: string;
  year?: number;
  minConsumption?: number;
  maxConsumption?: number;
  isActive?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ElectricitySortOptions {
  field: 'unitName' | 'consumption' | 'zone' | 'category' | 'lastUpdated' | 'totalConsumption';
  direction: 'asc' | 'desc';
}

export interface ElectricityPaginationOptions {
  page: number;
  limit: number;
  sortBy?: ElectricitySortOptions;
  filters?: ElectricityFilters;
}

// API Response Types
export interface ElectricityResponse<T> {
  data: T;
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  filters: ElectricityFilters;
  timestamp: Date;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    index: number;
    error: string;
    data: any;
  }>;
  totalProcessed: number;
}

// Chart and Visualization Types
export interface ConsumptionChartData {
  name: string;
  consumption: number;
  cost: number;
  month: string;
  year: number;
  category?: string;
  zone?: string;
}

export interface TopConsumerData {
  rank: number;
  unitId: number;
  unitName: string;
  consumption: number;
  percentage: number;
  cost: number;
  zone: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  monthlyData: ElectricityConsumption;
}

// Database Configuration Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  connectionLimit?: number;
  timeout?: number;
}

// Migration Types
export interface Migration {
  id: string;
  name: string;
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
  executedAt?: Date;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Export utility types
export type ElectricityDataKeys = keyof ElectricityUnit;
export type ConsumptionKeys = keyof ConsumptionRecord;
export type ElectricityCreateInput = Omit<ElectricityUnit, 'id' | 'totalConsumption' | 'averageConsumption' | 'peakConsumption' | 'lowestConsumption' | 'createdAt' | 'lastUpdated'>;
export type ElectricityUpdateInput = Partial<ElectricityCreateInput> & { id: number };
