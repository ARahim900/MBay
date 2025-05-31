import { NextRequest, NextResponse } from 'next/server';
import { electricityService } from '@/lib/services/electricity-service';
import { ElectricityFilters, ElectricityPaginationOptions } from '@/lib/types/electricity';

/**
 * GET /api/electricity/units
 * Fetch electricity units with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Parse sorting parameters
    const sortBy = searchParams.get('sortBy') as any;
    const sortDirection = searchParams.get('sortDirection') as 'asc' | 'desc';
    
    // Parse filter parameters
    const filters: ElectricityFilters = {
      zone: searchParams.get('zone') || undefined,
      category: searchParams.get('category') || undefined,
      type: searchParams.get('type') || undefined,
      unitName: searchParams.get('unitName') || undefined,
      meterAccountNo: searchParams.get('meterAccountNo') || undefined,
      month: searchParams.get('month') || undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
      minConsumption: searchParams.get('minConsumption') ? parseFloat(searchParams.get('minConsumption')!) : undefined,
      maxConsumption: searchParams.get('maxConsumption') ? parseFloat(searchParams.get('maxConsumption')!) : undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key as keyof ElectricityFilters] === undefined && delete filters[key as keyof ElectricityFilters]
    );

    const options: ElectricityPaginationOptions = {
      page,
      limit,
      filters,
      sortBy: sortBy && sortDirection ? { field: sortBy, direction: sortDirection } : undefined
    };

    const result = await electricityService.getUnits(options);

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
        filters: result.filters
      },
      timestamp: result.timestamp
    });

  } catch (error) {
    console.error('GET /api/electricity/units error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch electricity units',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/electricity/units
 * Create a new electricity unit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await electricityService.createUnit(body);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.unit,
        message: 'Electricity unit created successfully'
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        errors: result.errors,
        message: 'Failed to create electricity unit'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('POST /api/electricity/units error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create electricity unit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
