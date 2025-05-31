import { NextRequest, NextResponse } from 'next/server';
import { electricityService } from '@/lib/services/electricity-service';

/**
 * GET /api/electricity/analytics
 * Get comprehensive electricity consumption analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse parameters
    const type = searchParams.get('type') || 'summary';
    const unitId = searchParams.get('unitId');
    const category = searchParams.get('category');
    const zone = searchParams.get('zone');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    let result: any = {};

    switch (type) {
      case 'summary':
        // Get overall summary statistics
        result = await electricityService.getSummaryStatistics();
        break;

      case 'consumption':
        // Get consumption analytics for all units
        result = await electricityService.getConsumptionAnalytics();
        break;

      case 'unit':
        // Get analytics for a specific unit
        if (!unitId) {
          return NextResponse.json({
            success: false,
            error: 'Unit ID is required for unit analytics'
          }, { status: 400 });
        }
        result = await electricityService.getUnitAnalytics(parseInt(unitId));
        break;

      case 'trends':
        // Get monthly consumption trends
        result = await electricityService.getMonthlyTrends();
        break;

      case 'categories':
        // Get consumption by category
        result = await electricityService.getConsumptionByCategory();
        break;

      case 'top-consumers':
        // Get top electricity consumers
        result = await electricityService.getTopConsumers(limit);
        break;

      case 'validation':
        // Get data validation report
        result = await electricityService.getDataValidation();
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid analytics type. Supported types: summary, consumption, unit, trends, categories, top-consumers, validation'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      data: result,
      timestamp: new Date().toISOString(),
      meta: {
        unitId: unitId || null,
        category: category || null,
        zone: zone || null,
        limit: type === 'top-consumers' ? limit : null
      }
    });

  } catch (error) {
    console.error('GET /api/electricity/analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch electricity analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/electricity/analytics/custom
 * Generate custom analytics based on provided parameters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      filters = {}, 
      metrics = ['totalConsumption'], 
      groupBy = 'category',
      dateRange = null 
    } = body;

    // Get filtered units based on the provided filters
    const unitsResponse = await electricityService.getUnits({
      page: 1,
      limit: 1000, // Get all units for analytics
      filters,
      sortBy: { field: 'totalConsumption', direction: 'desc' }
    });

    const units = unitsResponse.data;

    // Calculate custom metrics
    const analytics = {
      totalUnits: units.length,
      totalConsumption: units.reduce((sum, unit) => sum + unit.totalConsumption, 0),
      averageConsumption: units.length > 0 ? units.reduce((sum, unit) => sum + unit.totalConsumption, 0) / units.length : 0,
      groupedData: {} as any,
      trends: [] as any[],
      insights: [] as any[]
    };

    // Group data by specified field
    if (groupBy) {
      const grouped: { [key: string]: any } = {};
      
      units.forEach(unit => {
        const key = (unit as any)[groupBy] || 'Unknown';
        if (!grouped[key]) {
          grouped[key] = {
            count: 0,
            totalConsumption: 0,
            averageConsumption: 0,
            units: []
          };
        }
        
        grouped[key].count += 1;
        grouped[key].totalConsumption += unit.totalConsumption;
        grouped[key].units.push(unit);
      });

      // Calculate averages
      Object.keys(grouped).forEach(key => {
        grouped[key].averageConsumption = grouped[key].totalConsumption / grouped[key].count;
      });

      analytics.groupedData = grouped;
    }

    // Generate insights
    if (units.length > 0) {
      const topConsumer = units.reduce((max, unit) => unit.totalConsumption > max.totalConsumption ? unit : max);
      const bottomConsumer = units.filter(u => u.totalConsumption > 0).reduce((min, unit) => unit.totalConsumption < min.totalConsumption ? unit : min);
      
      analytics.insights = [
        {
          type: 'top_consumer',
          message: `${topConsumer.unitName} is the highest consumer with ${topConsumer.totalConsumption.toFixed(2)} kWh`,
          value: topConsumer.totalConsumption,
          unit: topConsumer
        },
        {
          type: 'bottom_consumer',
          message: `${bottomConsumer.unitName} is the lowest active consumer with ${bottomConsumer.totalConsumption.toFixed(2)} kWh`,
          value: bottomConsumer.totalConsumption,
          unit: bottomConsumer
        },
        {
          type: 'total_cost',
          message: `Total estimated cost: ${(analytics.totalConsumption * 0.025).toFixed(2)} OMR`,
          value: analytics.totalConsumption * 0.025
        }
      ];
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      parameters: {
        filters,
        metrics,
        groupBy,
        dateRange
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('POST /api/electricity/analytics/custom error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate custom analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
