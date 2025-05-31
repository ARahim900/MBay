import { NextRequest, NextResponse } from 'next/server';
import { electricityService } from '@/lib/services/electricity-service';
import { exportToCSV, exportToJSON } from '@/lib/utils/electricity-db';

/**
 * GET /api/electricity/export
 * Export electricity data in various formats
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse parameters
    const format = searchParams.get('format') || 'csv'; // csv, json, excel
    const type = searchParams.get('type') || 'units'; // units, consumption, analytics
    const unitId = searchParams.get('unitId');
    const category = searchParams.get('category');
    const zone = searchParams.get('zone');
    const month = searchParams.get('month');
    const includeAnalytics = searchParams.get('includeAnalytics') === 'true';

    // Build filters from query parameters
    const filters: any = {};
    if (category) filters.category = category;
    if (zone) filters.zone = zone;
    if (month) filters.month = month;

    let data: any;
    let filename: string;
    let contentType: string;

    switch (type) {
      case 'units':
        // Export electricity units
        const unitsResponse = await electricityService.getUnits({
          page: 1,
          limit: 10000, // Export all units
          filters,
          sortBy: { field: 'totalConsumption', direction: 'desc' }
        });
        
        data = unitsResponse.data;
        filename = `electricity-units-${new Date().toISOString().split('T')[0]}`;
        
        if (includeAnalytics) {
          // Add analytics data for each unit
          const analyticsPromises = data.map((unit: any) => 
            electricityService.getUnitAnalytics(unit.id)
          );
          const analyticsResults = await Promise.all(analyticsPromises);
          
          data = data.map((unit: any, index: number) => ({
            ...unit,
            analytics: analyticsResults[index]
          }));
        }
        break;

      case 'consumption':
        // Export consumption records
        if (!unitId) {
          return NextResponse.json({
            success: false,
            error: 'Unit ID is required for consumption export'
          }, { status: 400 });
        }
        
        data = await electricityService.getConsumptionByUnit(parseInt(unitId));
        filename = `consumption-unit-${unitId}-${new Date().toISOString().split('T')[0]}`;
        break;

      case 'analytics':
        // Export analytics data
        const analyticsType = searchParams.get('analyticsType') || 'summary';
        
        switch (analyticsType) {
          case 'summary':
            data = await electricityService.getSummaryStatistics();
            break;
          case 'trends':
            data = await electricityService.getMonthlyTrends();
            break;
          case 'categories':
            data = await electricityService.getConsumptionByCategory();
            break;
          case 'top-consumers':
            const limit = parseInt(searchParams.get('limit') || '20');
            data = await electricityService.getTopConsumers(limit);
            break;
          default:
            data = await electricityService.getConsumptionAnalytics();
        }
        
        filename = `electricity-analytics-${analyticsType}-${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid export type. Supported types: units, consumption, analytics'
        }, { status: 400 });
    }

    // Generate export content based on format
    let content: string;
    
    switch (format.toLowerCase()) {
      case 'csv':
        if (Array.isArray(data)) {
          content = exportToCSV(data);
        } else {
          // Convert single object to array for CSV export
          content = exportToCSV([data]);
        }
        contentType = 'text/csv';
        filename += '.csv';
        break;

      case 'json':
        content = exportToJSON(data);
        contentType = 'application/json';
        filename += '.json';
        break;

      case 'excel':
        // For Excel export, we'll use CSV format with Excel-friendly headers
        if (Array.isArray(data)) {
          content = exportToCSV(data);
        } else {
          content = exportToCSV([data]);
        }
        contentType = 'application/vnd.ms-excel';
        filename += '.xlsx';
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid format. Supported formats: csv, json, excel'
        }, { status: 400 });
    }

    // Create response with appropriate headers for file download
    const response = new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
        'X-Export-Type': type,
        'X-Export-Format': format,
        'X-Export-Timestamp': new Date().toISOString(),
        'X-Export-Records': Array.isArray(data) ? data.length.toString() : '1'
      }
    });

    return response;

  } catch (error) {
    console.error('GET /api/electricity/export error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export electricity data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/electricity/export/custom
 * Custom export with specific data selection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      format = 'csv',
      unitIds = [],
      fields = [],
      filters = {},
      includeAnalytics = false,
      includeConsumption = false,
      dateRange = null
    } = body;

    let data: any[] = [];

    if (unitIds.length > 0) {
      // Export specific units
      const unitPromises = unitIds.map((id: number) => electricityService.getUnitById(id));
      const units = await Promise.all(unitPromises);
      data = units.filter(unit => unit !== null);
    } else {
      // Export all units with filters
      const unitsResponse = await electricityService.getUnits({
        page: 1,
        limit: 10000,
        filters,
        sortBy: { field: 'totalConsumption', direction: 'desc' }
      });
      data = unitsResponse.data;
    }

    // Add analytics if requested
    if (includeAnalytics) {
      const analyticsPromises = data.map(unit => electricityService.getUnitAnalytics(unit.id));
      const analyticsResults = await Promise.all(analyticsPromises);
      
      data = data.map((unit, index) => ({
        ...unit,
        analytics: analyticsResults[index]
      }));
    }

    // Add consumption data if requested
    if (includeConsumption) {
      const consumptionPromises = data.map(unit => electricityService.getConsumptionByUnit(unit.id));
      const consumptionResults = await Promise.all(consumptionPromises);
      
      data = data.map((unit, index) => ({
        ...unit,
        consumptionRecords: consumptionResults[index]
      }));
    }

    // Filter fields if specified
    if (fields.length > 0) {
      data = data.map(item => {
        const filtered: any = {};
        fields.forEach(field => {
          if (item.hasOwnProperty(field)) {
            filtered[field] = item[field];
          }
        });
        return filtered;
      });
    }

    // Generate export content
    let content: string;
    let contentType: string;
    let filename: string;

    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (format.toLowerCase()) {
      case 'csv':
        content = exportToCSV(data);
        contentType = 'text/csv';
        filename = `electricity-custom-export-${timestamp}.csv`;
        break;

      case 'json':
        content = exportToJSON(data);
        contentType = 'application/json';
        filename = `electricity-custom-export-${timestamp}.json`;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid format. Supported formats: csv, json'
        }, { status: 400 });
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
        'X-Export-Type': 'custom',
        'X-Export-Format': format,
        'X-Export-Timestamp': new Date().toISOString(),
        'X-Export-Records': data.length.toString(),
        'X-Include-Analytics': includeAnalytics.toString(),
        'X-Include-Consumption': includeConsumption.toString()
      }
    });

  } catch (error) {
    console.error('POST /api/electricity/export/custom error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create custom export',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
