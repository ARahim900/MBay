// ===============================
// ELECTRICITY DATABASE SERVICE
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
  ConsumptionAnalytics
} from '../types/electricity';
import { 
  validateElectricityUnit, 
  validateConsumptionRecord,
  applyFilters,
  applySorting,
  applyPagination,
  calculateAnalytics,
  transformToConsumptionRecords,
  validateBulkData
} from '../utils/electricity-db';
import { comprehensiveElectricityData } from '../data/comprehensive-electricity-data';

/**
 * ElectricityService - Comprehensive service for electricity data management
 * 
 * This service provides a complete API for managing electricity consumption data
 * including CRUD operations, analytics, filtering, and data validation.
 */
export class ElectricityService {
  private static instance: ElectricityService;
  private units: ElectricityUnit[] = [];
  private consumptionRecords: ConsumptionRecord[] = [];

  private constructor() {
    this.initializeData();
  }

  public static getInstance(): ElectricityService {
    if (!ElectricityService.instance) {
      ElectricityService.instance = new ElectricityService();
    }
    return ElectricityService.instance;
  }

  // ===============================
  // INITIALIZATION
  // ===============================

  private initializeData(): void {
    this.units = [...comprehensiveElectricityData];
    this.consumptionRecords = transformToConsumptionRecords(this.units);
    console.log(`ElectricityService initialized with ${this.units.length} units and ${this.consumptionRecords.length} consumption records`);
  }

  public async reinitialize(): Promise<void> {
    this.initializeData();
  }

  // ===============================
  // UNIT MANAGEMENT (CRUD)
  // ===============================

  /**
   * Get all electricity units with optional filtering and pagination
   */
  public async getUnits(options?: ElectricityPaginationOptions): Promise<ElectricityResponse<ElectricityUnit[]>> {
    let filteredUnits = [...this.units];

    // Apply filters
    if (options?.filters) {
      filteredUnits = applyFilters(filteredUnits, options.filters);
    }

    // Apply sorting
    if (options?.sortBy) {
      filteredUnits = applySorting(filteredUnits, options.sortBy);
    }

    const total = filteredUnits.length;

    // Apply pagination
    let paginatedResult = { data: filteredUnits, hasNext: false, hasPrev: false };
    if (options?.page && options?.limit) {
      paginatedResult = applyPagination(filteredUnits, options.page, options.limit);
    }

    return {
      data: paginatedResult.data,
      total,
      page: options?.page || 1,
      limit: options?.limit || total,
      hasNext: paginatedResult.hasNext,
      hasPrev: paginatedResult.hasPrev,
      filters: options?.filters || {},
      timestamp: new Date()
    };
  }

  /**
   * Get a single electricity unit by ID
   */
  public async getUnitById(id: number): Promise<ElectricityUnit | null> {
    return this.units.find(unit => unit.id === id) || null;
  }

  /**
   * Get a single electricity unit by meter account number
   */
  public async getUnitByMeterAccount(meterAccountNo: string): Promise<ElectricityUnit | null> {
    return this.units.find(unit => unit.meterAccountNo === meterAccountNo) || null;
  }

  /**
   * Create a new electricity unit
   */
  public async createUnit(data: ElectricityUnitCreate): Promise<{ success: boolean; unit?: ElectricityUnit; errors?: string[] }> {
    const validation = validateElectricityUnit(data);
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors.map(e => `${e.field}: ${e.message}`)
      };
    }

    // Check for duplicate serial number
    if (this.units.some(unit => unit.slNo === data.slNo)) {
      return {
        success: false,
        errors: ['Serial number already exists']
      };
    }

    // Check for duplicate meter account
    if (data.meterAccountNo && this.units.some(unit => unit.meterAccountNo === data.meterAccountNo)) {
      return {
        success: false,
        errors: ['Meter account number already exists']
      };
    }

    const newUnit: ElectricityUnit = {
      id: Math.max(...this.units.map(u => u.id)) + 1,
      ...data,
      category: data.category || 'Other',
      consumption: {},
      totalConsumption: 0,
      averageConsumption: 0,
      peakConsumption: 0,
      lowestConsumption: 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.units.push(newUnit);

    return {
      success: true,
      unit: newUnit
    };
  }

  /**
   * Update an existing electricity unit
   */
  public async updateUnit(data: ElectricityUnitUpdate): Promise<{ success: boolean; unit?: ElectricityUnit; errors?: string[] }> {
    const existingUnit = await this.getUnitById(data.id);
    if (!existingUnit) {
      return {
        success: false,
        errors: ['Unit not found']
      };
    }

    // Check for duplicate meter account (excluding current unit)
    if (data.meterAccountNo && this.units.some(unit => 
      unit.meterAccountNo === data.meterAccountNo && unit.id !== data.id
    )) {
      return {
        success: false,
        errors: ['Meter account number already exists']
      };
    }

    const updatedUnit: ElectricityUnit = {
      ...existingUnit,
      ...data,
      lastUpdated: new Date()
    };

    const unitIndex = this.units.findIndex(unit => unit.id === data.id);
    this.units[unitIndex] = updatedUnit;

    return {
      success: true,
      unit: updatedUnit
    };
  }

  /**
   * Delete an electricity unit
   */
  public async deleteUnit(id: number): Promise<{ success: boolean; errors?: string[] }> {
    const unitIndex = this.units.findIndex(unit => unit.id === id);
    
    if (unitIndex === -1) {
      return {
        success: false,
        errors: ['Unit not found']
      };
    }

    // Remove unit and all related consumption records
    this.units.splice(unitIndex, 1);
    this.consumptionRecords = this.consumptionRecords.filter(record => record.unitId !== id);

    return { success: true };
  }

  // ===============================
  // CONSUMPTION RECORD MANAGEMENT
  // ===============================

  /**
   * Get consumption records for a unit
   */
  public async getConsumptionByUnit(unitId: number): Promise<ConsumptionRecord[]> {
    return this.consumptionRecords.filter(record => record.unitId === unitId);
  }

  /**
   * Add consumption record
   */
  public async addConsumptionRecord(data: ConsumptionRecordCreate): Promise<{ success: boolean; record?: ConsumptionRecord; errors?: string[] }> {
    const validation = validateConsumptionRecord(data);
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors.map(e => `${e.field}: ${e.message}`)
      };
    }

    // Check if unit exists
    const unit = await this.getUnitById(data.unitId);
    if (!unit) {
      return {
        success: false,
        errors: ['Unit not found']
      };
    }

    // Check for duplicate month/year for the same unit
    if (this.consumptionRecords.some(record => 
      record.unitId === data.unitId && 
      record.month === data.month && 
      record.year === data.year
    )) {
      return {
        success: false,
        errors: ['Consumption record already exists for this month/year']
      };
    }

    const newRecord: ConsumptionRecord = {
      id: Math.max(...this.consumptionRecords.map(r => r.id), 0) + 1,
      ...data,
      cost: data.cost || data.consumption * 0.025,
      billingDate: data.billingDate || new Date(),
      readingDate: data.readingDate || new Date(),
      isEstimated: data.isEstimated || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.consumptionRecords.push(newRecord);

    // Update unit's consumption data
    unit.consumption[data.month] = data.consumption;
    await this.recalculateUnitStatistics(data.unitId);

    return {
      success: true,
      record: newRecord
    };
  }

  /**
   * Bulk import consumption records
   */
  public async bulkImportConsumption(records: ConsumptionRecordCreate[]): Promise<BulkOperationResult> {
    let success = 0;
    let failed = 0;
    const errors: Array<{ index: number; error: string; data: any }> = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const result = await this.addConsumptionRecord(record);
      
      if (result.success) {
        success++;
      } else {
        failed++;
        errors.push({
          index: i,
          error: result.errors?.join(', ') || 'Unknown error',
          data: record
        });
      }
    }

    return {
      success,
      failed,
      errors,
      totalProcessed: records.length
    };
  }

  // ===============================
  // ANALYTICS & REPORTING
  // ===============================

  /**
   * Get consumption analytics for all units
   */
  public async getConsumptionAnalytics(): Promise<ConsumptionAnalytics[]> {
    return calculateAnalytics(this.units);
  }

  /**
   * Get analytics for a specific unit
   */
  public async getUnitAnalytics(unitId: number): Promise<ConsumptionAnalytics | null> {
    const unit = await this.getUnitById(unitId);
    if (!unit) return null;

    const analytics = calculateAnalytics([unit]);
    return analytics[0] || null;
  }

  /**
   * Get summary statistics
   */
  public async getSummaryStatistics(): Promise<{
    totalUnits: number;
    activeUnits: number;
    totalConsumption: number;
    totalCost: number;
    averageConsumption: number;
    categoryCounts: Record<string, number>;
    zoneCounts: Record<string, number>;
  }> {
    const activeUnits = this.units.filter(unit => unit.isActive);
    const totalConsumption = this.units.reduce((sum, unit) => sum + unit.totalConsumption, 0);

    const categoryCounts: Record<string, number> = {};
    const zoneCounts: Record<string, number> = {};

    this.units.forEach(unit => {
      categoryCounts[unit.category] = (categoryCounts[unit.category] || 0) + 1;
      zoneCounts[unit.zone] = (zoneCounts[unit.zone] || 0) + 1;
    });

    return {
      totalUnits: this.units.length,
      activeUnits: activeUnits.length,
      totalConsumption,
      totalCost: totalConsumption * 0.025,
      averageConsumption: totalConsumption / this.units.length,
      categoryCounts,
      zoneCounts
    };
  }

  /**
   * Get top consumers
   */
  public async getTopConsumers(limit: number = 10): Promise<ElectricityUnit[]> {
    return this.units
      .filter(unit => unit.totalConsumption > 0)
      .sort((a, b) => b.totalConsumption - a.totalConsumption)
      .slice(0, limit);
  }

  /**
   * Get monthly consumption trends
   */
  public async getMonthlyTrends(): Promise<Array<{
    month: string;
    totalConsumption: number;
    unitCount: number;
    averageConsumption: number;
    cost: number;
  }>> {
    const availableMonths = ['November-24', 'December-24', 'January-25', 'February-25', 'March-25', 'April-25'];
    
    return availableMonths.map(month => {
      const monthConsumption = this.units.reduce((sum, unit) => sum + (unit.consumption[month] || 0), 0);
      const unitsWithConsumption = this.units.filter(unit => (unit.consumption[month] || 0) > 0);
      
      return {
        month,
        totalConsumption: monthConsumption,
        unitCount: unitsWithConsumption.length,
        averageConsumption: unitsWithConsumption.length > 0 ? monthConsumption / unitsWithConsumption.length : 0,
        cost: monthConsumption * 0.025
      };
    });
  }

  /**
   * Get consumption by category
   */
  public async getConsumptionByCategory(): Promise<Array<{
    category: string;
    unitCount: number;
    totalConsumption: number;
    percentage: number;
    cost: number;
  }>> {
    const totalConsumption = this.units.reduce((sum, unit) => sum + unit.totalConsumption, 0);
    const categories = [...new Set(this.units.map(unit => unit.category))];

    return categories.map(category => {
      const categoryUnits = this.units.filter(unit => unit.category === category);
      const categoryConsumption = categoryUnits.reduce((sum, unit) => sum + unit.totalConsumption, 0);

      return {
        category,
        unitCount: categoryUnits.length,
        totalConsumption: categoryConsumption,
        percentage: totalConsumption > 0 ? (categoryConsumption / totalConsumption) * 100 : 0,
        cost: categoryConsumption * 0.025
      };
    }).sort((a, b) => b.totalConsumption - a.totalConsumption);
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * Recalculate statistics for a specific unit
   */
  private async recalculateUnitStatistics(unitId: number): Promise<void> {
    const unit = await this.getUnitById(unitId);
    if (!unit) return;

    const consumptionValues = Object.values(unit.consumption).filter(v => v > 0);
    
    unit.totalConsumption = consumptionValues.reduce((sum, val) => sum + val, 0);
    unit.averageConsumption = consumptionValues.length > 0 ? unit.totalConsumption / consumptionValues.length : 0;
    unit.peakConsumption = consumptionValues.length > 0 ? Math.max(...consumptionValues) : 0;
    unit.lowestConsumption = consumptionValues.length > 0 ? Math.min(...consumptionValues) : 0;
    unit.lastUpdated = new Date();
  }

  /**
   * Search units by text
   */
  public async searchUnits(query: string): Promise<ElectricityUnit[]> {
    const searchTerm = query.toLowerCase();
    
    return this.units.filter(unit => 
      unit.unitName.toLowerCase().includes(searchTerm) ||
      unit.zone.toLowerCase().includes(searchTerm) ||
      unit.category.toLowerCase().includes(searchTerm) ||
      unit.meterAccountNo.toLowerCase().includes(searchTerm) ||
      unit.type.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Export data in various formats
   */
  public async exportData(format: 'json' | 'csv' = 'json'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify({
        exportDate: new Date().toISOString(),
        totalUnits: this.units.length,
        units: this.units,
        consumptionRecords: this.consumptionRecords
      }, null, 2);
    } else {
      // CSV format
      const headers = ['ID', 'Unit Name', 'Zone', 'Category', 'Type', 'Meter Account', 'Total Consumption', 'Average Consumption'];
      const rows = this.units.map(unit => [
        unit.id,
        unit.unitName,
        unit.zone,
        unit.category,
        unit.type,
        unit.meterAccountNo,
        unit.totalConsumption,
        unit.averageConsumption
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }

  /**
   * Get data validation report
   */
  public async getDataValidation(): Promise<{
    duplicateSerialNumbers: number[];
    duplicateMeterAccounts: string[];
    missingMeterAccounts: number;
    zeroConsumptionUnits: number;
    incompleteData: number;
  }> {
    const serialNumbers = this.units.map(unit => unit.slNo);
    const meterAccounts = this.units.map(unit => unit.meterAccountNo);

    return {
      duplicateSerialNumbers: serialNumbers.filter((slNo, index) => serialNumbers.indexOf(slNo) !== index),
      duplicateMeterAccounts: meterAccounts.filter((meter, index) => 
        meterAccounts.indexOf(meter) !== index && meter !== 'MISSING_METER' && meter !== 'N/A'
      ),
      missingMeterAccounts: this.units.filter(unit => 
        unit.meterAccountNo === 'MISSING_METER' || 
        unit.meterAccountNo === 'N/A' || 
        !unit.meterAccountNo.trim()
      ).length,
      zeroConsumptionUnits: this.units.filter(unit => unit.totalConsumption === 0).length,
      incompleteData: this.units.filter(unit => 
        !unit.unitName || 
        !unit.zone || 
        !unit.type || 
        unit.unitName === 'N/A' || 
        unit.zone === 'N/A'
      ).length
    };
  }
}

// Export singleton instance
export const electricityService = ElectricityService.getInstance();

// Export service class for testing
export default ElectricityService;
