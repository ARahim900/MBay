import { NextRequest, NextResponse } from 'next/server';
import { electricityService } from '@/lib/services/electricity-service';

/**
 * GET /api/electricity/units/[id]
 * Get a specific electricity unit by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unitId = parseInt(params.id);
    
    if (isNaN(unitId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid unit ID'
      }, { status: 400 });
    }

    const unit = await electricityService.getUnitById(unitId);
    
    if (!unit) {
      return NextResponse.json({
        success: false,
        error: 'Unit not found'
      }, { status: 404 });
    }

    // Get analytics for this unit
    const analytics = await electricityService.getUnitAnalytics(unitId);
    
    // Get consumption records for this unit
    const consumptionRecords = await electricityService.getConsumptionByUnit(unitId);

    return NextResponse.json({
      success: true,
      data: {
        unit,
        analytics,
        consumptionRecords,
        totalRecords: consumptionRecords.length
      }
    });

  } catch (error) {
    console.error(`GET /api/electricity/units/${params.id} error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch electricity unit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/electricity/units/[id]
 * Update a specific electricity unit
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unitId = parseInt(params.id);
    
    if (isNaN(unitId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid unit ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const updateData = { ...body, id: unitId };
    
    const result = await electricityService.updateUnit(updateData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.unit,
        message: 'Electricity unit updated successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        errors: result.errors,
        message: 'Failed to update electricity unit'
      }, { status: 400 });
    }

  } catch (error) {
    console.error(`PUT /api/electricity/units/${params.id} error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update electricity unit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/electricity/units/[id]
 * Delete a specific electricity unit
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unitId = parseInt(params.id);
    
    if (isNaN(unitId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid unit ID'
      }, { status: 400 });
    }

    const result = await electricityService.deleteUnit(unitId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Electricity unit deleted successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        errors: result.errors,
        message: 'Failed to delete electricity unit'
      }, { status: 400 });
    }

  } catch (error) {
    console.error(`DELETE /api/electricity/units/${params.id} error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete electricity unit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
