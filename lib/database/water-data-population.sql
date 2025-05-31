-- =====================================================
-- Muscat Bay Water System Data Population Script
-- =====================================================
-- Created: 2025-01-31
-- Purpose: Insert actual water meter data from CSV
-- Note: Run this after running water-system.sql schema
-- =====================================================

-- First, let's insert the water meters from the provided data
-- This script processes the CSV data and inserts it into the normalized database

BEGIN;

-- =====================================================
-- 1. INSERT WATER METERS
-- =====================================================

-- Function to get zone_id by zone code
CREATE OR REPLACE FUNCTION get_zone_id(zone_code TEXT) 
RETURNS INTEGER AS $$
DECLARE
    zone_id_val INTEGER;
BEGIN
    SELECT zone_id INTO zone_id_val 
    FROM water_zones 
    WHERE water_zones.zone_code = $1;
    
    IF zone_id_val IS NULL THEN
        -- Insert unknown zone if not exists
        INSERT INTO water_zones (zone_code, zone_name, zone_type, description)
        VALUES ($1, $1, 'UNKNOWN', 'Auto-created zone')
        RETURNING zone_id INTO zone_id_val;
    END IF;
    
    RETURN zone_id_val;
END;
$$ LANGUAGE plpgsql;

-- Function to get meter_type_id by type code
CREATE OR REPLACE FUNCTION get_meter_type_id(type_code TEXT) 
RETURNS INTEGER AS $$
DECLARE
    type_id_val INTEGER;
BEGIN
    SELECT type_id INTO type_id_val 
    FROM water_meter_types 
    WHERE water_meter_types.type_code = $1;
    
    IF type_id_val IS NULL THEN
        -- Insert unknown type if not exists
        INSERT INTO water_meter_types (type_code, type_name, category, billing_rate)
        VALUES ($1, $1, 'UNKNOWN', 0.025)
        RETURNING type_id INTO type_id_val;
    END IF;
    
    RETURN type_id_val;
END;
$$ LANGUAGE plpgsql;

-- Function to get parent_meter_id by name
CREATE OR REPLACE FUNCTION get_parent_meter_id(parent_name TEXT, zone_code TEXT) 
RETURNS INTEGER AS $$
DECLARE
    parent_id_val INTEGER;
    zone_id_val INTEGER;
BEGIN
    SELECT parent_meter_id INTO parent_id_val 
    FROM water_parent_meters 
    WHERE parent_meter_name = $1;
    
    IF parent_id_val IS NULL THEN
        -- Get zone_id for the parent meter
        SELECT get_zone_id($2) INTO zone_id_val;
        
        -- Insert unknown parent meter if not exists
        INSERT INTO water_parent_meters (parent_meter_name, zone_id, meter_type)
        VALUES ($1, zone_id_val, 'Unknown')
        RETURNING parent_meter_id INTO parent_id_val;
    END IF;
    
    RETURN parent_id_val;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. INSERT WATER METERS DATA
-- =====================================================

-- Insert all water meters from the CSV data
INSERT INTO water_meters (meter_label, account_number, zone_id, meter_type_id, parent_meter_id, meter_level, status) VALUES
('Z5-17', '4300001', get_zone_id('Zone_05'), get_meter_type_id('Residential (Villa)'), get_parent_meter_id('ZONE 5 (Bulk Zone 5)', 'Zone_05'), 'L3', 'OPERATIONAL'),
('Z3-42 (Villa)', '4300002', get_zone_id('Zone_03_(A)'), get_meter_type_id('Residential (Villa)'), get_parent_meter_id('ZONE 3A (BULK ZONE 3A)', 'Zone_03_(A)'), 'L3', 'OPERATIONAL'),
('Z3-46(5) (Building)', '4300003', get_zone_id('Zone_03_(A)'), get_meter_type_id('Residential (Apart)'), get_parent_meter_id('D-46 Building Bulk Meter', 'Zone_03_(A)'), 'L3', 'OPERATIONAL'),
('Z3-49(3) (Building)', '4300004', get_zone_id('Zone_03_(A)'), get_meter_type_id('Residential (Apart)'), get_parent_meter_id('D-49 Building Bulk Meter', 'Zone_03_(A)'), 'L3', 'OPERATIONAL'),
('Z3-38 (Villa)', '4300005', get_zone_id('Zone_03_(A)'), get_meter_type_id('Residential (Villa)'), get_parent_meter_id('ZONE 3A (BULK ZONE 3A)', 'Zone_03_(A)'), 'L3', 'OPERATIONAL'),
('Z3-75(4) (Building)', '4300006', get_zone_id('Zone_03_(A)'), get_meter_type_id('Residential (Apart)'), get_parent_meter_id('D-75 Building Bulk Meter', 'Zone_03_(A)'), 'L3', 'OPERATIONAL'),
('Z3-46(3A) (Building)', '4300007', get_zone_id('Zone_03_(A)'), get_meter_type_id('Residential (Apart)'), get_parent_meter_id('D-46 Building Bulk Meter', 'Zone_03_(A)'), 'L3', 'OPERATIONAL'),
('Z3-52(6) (Building)', '4300008', get_zone_id('Zone_03_(B)'), get_meter_type_id('Residential (Apart)'), get_parent_meter_id('D-52 Building Bulk Meter', 'Zone_03_(B)'), 'L3', 'OPERATIONAL'),
('Z3-21 (Villa)', '4300009', get_zone_id('Zone_03_(B)'), get_meter_type_id('Residential (Villa)'), get_parent_meter_id('ZONE 3B (BULK ZONE 3B)', 'Zone_03_(B)'), 'L3', 'OPERATIONAL'),
('Z3-049(4) (Building)', '4300010', get_zone_id('Zone_03_(A)'), get_meter_type_id('Residential (Apart)'), get_parent_meter_id('D-49 Building Bulk Meter', 'Zone_03_(A)'), 'L3', 'OPERATIONAL'),
('Z8-11', '4300023', get_zone_id('Zone_08'), get_meter_type_id('Residential (Villa)'), get_parent_meter_id('BULK ZONE 8', 'Zone_08'), 'L3', 'OPERATIONAL'),
('Z8-13', '4300024', get_zone_id('Zone_08'), get_meter_type_id('Residential (Villa)'), get_parent_meter_id('BULK ZONE 8', 'Zone_08'), 'L3', 'OPERATIONAL'),
('Hotel Main Building', '4300334', get_zone_id('Direct Connection'), get_meter_type_id('Retail'), get_parent_meter_id('Main Bulk (NAMA)', 'Direct Connection'), 'DC', 'OPERATIONAL'),
('Village Square (Zone Bulk)', '4300335', get_zone_id('Zone_VS'), get_meter_type_id('Zone Bulk'), get_parent_meter_id('Main Bulk (NAMA)', 'Zone_VS'), 'L2', 'OPERATIONAL'),
('ZONE 8 (Bulk Zone 8)', '4300342', get_zone_id('Zone_08'), get_meter_type_id('Zone Bulk'), get_parent_meter_id('Main Bulk (NAMA)', 'Zone_08'), 'L2', 'OPERATIONAL'),
('ZONE 3A (Bulk Zone 3A)', '4300343', get_zone_id('Zone_03_(A)'), get_meter_type_id('Zone Bulk'), get_parent_meter_id('Main Bulk (NAMA)', 'Zone_03_(A)'), 'L2', 'OPERATIONAL'),
('ZONE 3B (Bulk Zone 3B)', '4300344', get_zone_id('Zone_03_(B)'), get_meter_type_id('Zone Bulk'), get_parent_meter_id('Main Bulk (NAMA)', 'Zone_03_(B)'), 'L2', 'OPERATIONAL'),
('ZONE 5 (Bulk Zone 5)', '4300345', get_zone_id('Zone_05'), get_meter_type_id('Zone Bulk'), get_parent_meter_id('Main Bulk (NAMA)', 'Zone_05'), 'L2', 'OPERATIONAL'),
('ZONE FM ( BULK ZONE FM )', '4300346', get_zone_id('Zone_01_(FM)'), get_meter_type_id('Zone Bulk'), get_parent_meter_id('Main Bulk (NAMA)', 'Zone_01_(FM)'), 'L2', 'OPERATIONAL'),
('Main Bulk (NAMA)', 'C43659', get_zone_id('Main Bulk'), get_meter_type_id('Main BULK'), get_parent_meter_id('NAMA', 'Main Bulk'), 'L1', 'OPERATIONAL');

-- =====================================================
-- 3. INSERT MONTHLY CONSUMPTION DATA
-- =====================================================

-- Create a function to insert consumption data for all months
CREATE OR REPLACE FUNCTION insert_meter_consumption(
    p_account_number VARCHAR(50),
    p_jan24 DECIMAL(12,2), p_feb24 DECIMAL(12,2), p_mar24 DECIMAL(12,2), p_apr24 DECIMAL(12,2),
    p_may24 DECIMAL(12,2), p_jun24 DECIMAL(12,2), p_jul24 DECIMAL(12,2), p_aug24 DECIMAL(12,2),
    p_sep24 DECIMAL(12,2), p_oct24 DECIMAL(12,2), p_nov24 DECIMAL(12,2), p_dec24 DECIMAL(12,2),
    p_jan25 DECIMAL(12,2), p_feb25 DECIMAL(12,2), p_mar25 DECIMAL(12,2), p_apr25 DECIMAL(12,2)
) RETURNS VOID AS $$
DECLARE
    meter_id_val INTEGER;
BEGIN
    -- Get meter_id
    SELECT meter_id INTO meter_id_val FROM water_meters WHERE account_number = p_account_number;
    
    IF meter_id_val IS NOT NULL THEN
        -- Insert 2024 data
        INSERT INTO water_monthly_consumption (meter_id, reading_year, reading_month, consumption_m3) VALUES
        (meter_id_val, 2024, 1, COALESCE(p_jan24, 0)),
        (meter_id_val, 2024, 2, COALESCE(p_feb24, 0)),
        (meter_id_val, 2024, 3, COALESCE(p_mar24, 0)),
        (meter_id_val, 2024, 4, COALESCE(p_apr24, 0)),
        (meter_id_val, 2024, 5, COALESCE(p_may24, 0)),
        (meter_id_val, 2024, 6, COALESCE(p_jun24, 0)),
        (meter_id_val, 2024, 7, COALESCE(p_jul24, 0)),
        (meter_id_val, 2024, 8, COALESCE(p_aug24, 0)),
        (meter_id_val, 2024, 9, COALESCE(p_sep24, 0)),
        (meter_id_val, 2024, 10, COALESCE(p_oct24, 0)),
        (meter_id_val, 2024, 11, COALESCE(p_nov24, 0)),
        (meter_id_val, 2024, 12, COALESCE(p_dec24, 0)),
        -- Insert 2025 data
        (meter_id_val, 2025, 1, COALESCE(p_jan25, 0)),
        (meter_id_val, 2025, 2, COALESCE(p_feb25, 0)),
        (meter_id_val, 2025, 3, COALESCE(p_mar25, 0)),
        (meter_id_val, 2025, 4, COALESCE(p_apr25, 0));
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert sample consumption data for key meters
SELECT insert_meter_consumption('4300001', 99, 51, 53, 62, 135, 140, 34, 132, 63, 103, 54, 148, 112, 80, 81, 90);
SELECT insert_meter_consumption('4300002', 61, 33, 36, 47, 39, 42, 25, 20, 44, 57, 51, 75, 32, 46, 19, 62);
SELECT insert_meter_consumption('4300334', 14012, 12880, 11222, 13217, 13980, 15385, 12810, 13747, 13031, 17688, 15156, 14668, 18048, 19482, 22151, 27676);
SELECT insert_meter_consumption('4300335', 26, 19, 72, 60, 125, 277, 143, 137, 145, 63, 34, 17, 14, 12, 21, 13);
SELECT insert_meter_consumption('4300342', 2170, 1825, 2021, 2753, 2722, 3193, 3639, 3957, 3947, 4296, 3569, 3018, 1547, 1498, 2605, 3203);
SELECT insert_meter_consumption('4300343', 1234, 1099, 1297, 1892, 2254, 2227, 3313, 3172, 2698, 3715, 3501, 3796, 4235, 4273, 3591, 4041);
SELECT insert_meter_consumption('4300344', 2653, 2169, 2315, 2381, 2634, 2932, 3369, 3458, 3742, 2906, 2695, 3583, 3256, 2962, 3331, 2157);
SELECT insert_meter_consumption('4300345', 4286, 3897, 4127, 4911, 2639, 4992, 5305, 4039, 2736, 3383, 1438, 3788, 4267, 4231, 3862, 3737);
SELECT insert_meter_consumption('4300346', 1595, 1283, 1255, 1383, 1411, 2078, 2601, 1638, 1550, 2098, 1808, 1946, 2008, 1740, 1880, 1880);
SELECT insert_meter_consumption('C43659', 32803, 27996, 23860, 31869, 30737, 41953, 35166, 35420, 41341, 31519, 35290, 36733, 32580, 44043, 34915, 46039);

-- =====================================================
-- 4. UPDATE STATISTICS AND ANALYZE
-- =====================================================

-- Update table statistics for better query performance
ANALYZE water_zones;
ANALYZE water_meter_types;
ANALYZE water_parent_meters;
ANALYZE water_meters;
ANALYZE water_monthly_consumption;

-- =====================================================
-- 5. VERIFICATION QUERIES
-- =====================================================

-- Verify the data has been inserted correctly
SELECT 'Data Verification Results:' as status;

SELECT 
    'Total Zones:' as metric, 
    COUNT(*) as count 
FROM water_zones;

SELECT 
    'Total Meter Types:' as metric, 
    COUNT(*) as count 
FROM water_meter_types;

SELECT 
    'Total Meters:' as metric, 
    COUNT(*) as count 
FROM water_meters;

SELECT 
    'Total Consumption Records:' as metric, 
    COUNT(*) as count 
FROM water_monthly_consumption;

-- Show sample data
SELECT 
    'Sample Zone Summary:' as info;

SELECT * FROM water_zone_summary LIMIT 5;

SELECT 
    'Sample Monthly Summary:' as info;

SELECT * FROM water_monthly_summary 
WHERE reading_year = 2024 AND reading_month = 12 
LIMIT 5;

-- Clean up temporary functions
DROP FUNCTION IF EXISTS get_zone_id(TEXT);
DROP FUNCTION IF EXISTS get_meter_type_id(TEXT);
DROP FUNCTION IF EXISTS get_parent_meter_id(TEXT, TEXT);
DROP FUNCTION IF EXISTS insert_meter_consumption(VARCHAR(50), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2), DECIMAL(12,2));

COMMIT;

-- =====================================================
-- 6. SUCCESS MESSAGE
-- =====================================================

SELECT 
    'Water System Database Successfully Populated!' as status,
    'Schema and sample data have been created.' as message,
    'Ready for use with Muscat Bay Water Analysis Module.' as next_step;
