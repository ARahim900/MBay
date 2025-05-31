-- =====================================================
-- Complete Water Meter Data Migration Script
-- =====================================================
-- Purpose: Migrate all water meter data from CSV to database
-- Source: Water meter consumption data Jan-24 to Apr-25
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CREATE TEMPORARY STAGING TABLE
-- =====================================================

CREATE TEMP TABLE water_data_staging (
    meter_label TEXT,
    acct_no TEXT,
    zone TEXT,
    type TEXT,
    parent_meter TEXT,
    label TEXT,
    jan_24 DECIMAL(12,2),
    feb_24 DECIMAL(12,2),
    mar_24 DECIMAL(12,2),
    apr_24 DECIMAL(12,2),
    may_24 DECIMAL(12,2),
    jun_24 DECIMAL(12,2),
    jul_24 DECIMAL(12,2),
    aug_24 DECIMAL(12,2),
    sep_24 DECIMAL(12,2),
    oct_24 DECIMAL(12,2),
    nov_24 DECIMAL(12,2),
    dec_24 DECIMAL(12,2),
    jan_25 DECIMAL(12,2),
    feb_25 DECIMAL(12,2),
    mar_25 DECIMAL(12,2),
    apr_25 DECIMAL(12,2)
);

-- =====================================================
-- 2. INSERT ALL WATER METER DATA FROM CSV
-- =====================================================

INSERT INTO water_data_staging VALUES
('Z5-17', '4300001', 'Zone_05', 'Residential (Villa)', 'ZONE 5 (Bulk Zone 5)', 'L3', 99, 51, 53, 62, 135, 140, 34, 132, 63, 103, 54, 148, 112, 80, 81, 90),
('Z3-42 (Villa)', '4300002', 'Zone_03_(A)', 'Residential (Villa)', 'ZONE 3A (BULK ZONE 3A)', 'L3', 61, 33, 36, 47, 39, 42, 25, 20, 44, 57, 51, 75, 32, 46, 19, 62),
('Z3-46(5) (Building)', '4300003', 'Zone_03_(A)', 'Residential (Apart)', 'D-46 Building Bulk Meter', 'L3', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0),
('Z3-49(3) (Building)', '4300004', 'Zone_03_(A)', 'Residential (Apart)', 'D-49 Building Bulk Meter', 'L3', 1, 1, 22, 30, 18, 6, 7, 11, 7, 10, 9, 5, 10, 15, 11, 13),
('Z3-38 (Villa)', '4300005', 'Zone_03_(A)', 'Residential (Villa)', 'ZONE 3A (BULK ZONE 3A)', 'L3', 0, 0, 0, 0, 0, 3, 0, 4, 30, 2, 12, 11, 10, 7, 7, 7),
('Z3-75(4) (Building)', '4300006', 'Zone_03_(A)', 'Residential (Apart)', 'D-75 Building Bulk Meter', 'L3', 0, 14, 3, 0, 0, 0, 0, 0, 0, 0, 7, 6, 0, 0, 0, 0),
('Z3-46(3A) (Building)', '4300007', 'Zone_03_(A)', 'Residential (Apart)', 'D-46 Building Bulk Meter', 'L3', 13, 7, 6, 25, 27, 30, 35, 41, 29, 44, 32, 43, 38, 35, 15, 35),
('Z3-52(6) (Building)', '4300008', 'Zone_03_(B)', 'Residential (Apart)', 'D-52 Building Bulk Meter', 'L3', 27, 22, 19, 28, 27, 27, 298, 58, 14, 18, 17, 8, 10, 9, 9, 14),
('Z3-21 (Villa)', '4300009', 'Zone_03_(B)', 'Residential (Villa)', 'ZONE 3B (BULK ZONE 3B)', 'L3', 37, 38, 24, 20, 31, 41, 9, 54, 263, 68, 45, 43, 41, 53, 42, 48),
('Z3-049(4) (Building)', '4300010', 'Zone_03_(A)', 'Residential (Apart)', 'D-49 Building Bulk Meter', 'L3', 11, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 1, 8, 0),
('Z8-11', '4300023', 'Zone_08', 'Residential (Villa)', 'BULK ZONE 8', 'L3', 0, 1, 0, 0, 1, 23, 2, 2, 1, 1, 2, 0, 0, 1, 0, 0),
('Z8-13', '4300024', 'Zone_08', 'Residential (Villa)', 'BULK ZONE 8', 'L3', 6, 2, 1, 1, 0, 15, 0, 0, 0, 3, 2, 1, 0, 0, 0, 0),
('Z5-13', '4300058', 'Zone_05', 'Residential (Villa)', 'ZONE 5 (Bulk Zone 5)', 'L3', 78, 73, 9, 46, 17, 83, 40, 80, 61, 56, 68, 85, 72, 106, 89, 120),
('Z5-14', '4300059', 'Zone_05', 'Residential (Villa)', 'ZONE 5 (Bulk Zone 5)', 'L3', 68, 56, 52, 250, 128, 100, 12, 20, 22, 22, 62, 72, 71, 93, 77, 93),
('Z8-12', '4300196', 'Zone_08', 'Residential (Villa)', 'BULK ZONE 8', 'L3', 109, 148, 169, 235, 180, 235, 237, 442, 661, 417, 223, 287, 236, 192, 249, 267),
('Z8-15', '4300198', 'Zone_08', 'Residential (Villa)', 'BULK ZONE 8', 'L3', 227, 74, 90, 145, 179, 100, 136, 152, 144, 87, 100, 90, 99, 61, 70, 125),
('Z8-16', '4300199', 'Zone_08', 'Residential (Villa)', 'BULK ZONE 8', 'L3', 180, 165, 52, 147, 0, 62, 113, 86, 91, 112, 103, 98, 67, 72, 54, 98),
('Z8-17', '4300200', 'Zone_08', 'Residential (Villa)', 'BULK ZONE 8', 'L3', 198, 135, 213, 190, 196, 138, 94, 220, 0, 191, 154, 155, 164, 162, 171, 207),
('Z8-5', '4300287', 'Zone_08', 'Residential (Villa)', 'BULK ZONE 8', 'L3', 131, 117, 131, 142, 208, 247, 272, 344, 236, 280, 309, 314, 208, 341, 313, 336),
('Z8-18', '4300289', 'Zone_08', 'Residential (Villa)', 'BULK ZONE 8', 'L3', 290, 212, 253, 418, 384, 478, 459, 410, 312, 196, 239, 149, 122, 111, 336, 0),
('Z8-19', '4300290', 'Zone_08', 'Residential (Villa)', 'BULK ZONE 8', 'L3', 161, 147, 205, 271, 282, 340, 157, 306, 239, 197, 248, 125, 104, 87, 231, 0),
('Z8-20', '4300291', 'Zone_08', 'Residential (Villa)', 'BULK ZONE 8', 'L3', 226, 210, 289, 358, 298, 313, 290, 297, 275, 219, 298, 158, 146, 110, 312, 0),
('Z8-21', '4300292', 'Zone_08', 'Residential (Villa)', 'BULK ZONE 8', 'L3', 188, 173, 172, 320, 254, 344, 233, 243, 200, 119, 167, 101, 99, 72, 276, 0),
('Z8-22', '4300293', 'Zone_08', 'Residential (Villa)', 'BULK ZONE 8', 'L3', 262, 168, 174, 366, 388, 418, 271, 343, 330, 138, 213, 177, 225, 156, 336, 0),
('Building B1', '4300300', 'Zone_01_(FM)', 'Retail', 'ZONE FM ( BULK ZONE FM )', 'L3', 258, 183, 178, 184, 198, 181, 164, 202, 184, 167, 214, 245, 228, 225, 235, 253),
('Building B2', '4300301', 'Zone_01_(FM)', 'Retail', 'ZONE FM ( BULK ZONE FM )', 'L3', 239, 194, 214, 205, 167, 187, 177, 191, 206, 163, 194, 226, 236, 213, 202, 187),
('Building B6', '4300305', 'Zone_01_(FM)', 'Retail', 'ZONE FM ( BULK ZONE FM )', 'L3', 7, 9, 9, 11, 16, 57, 131, 234, 226, 196, 195, 224, 254, 228, 268, 281),
('Building B7', '4300306', 'Zone_01_(FM)', 'Retail', 'ZONE FM ( BULK ZONE FM )', 'L3', 304, 243, 251, 275, 244, 226, 140, 161, 36, 116, 148, 151, 178, 190, 174, 201),
('Building B8', '4300307', 'Zone_01_(FM)', 'Retail', 'ZONE FM ( BULK ZONE FM )', 'L3', 557, 260, 253, 290, 320, 275, 261, 196, 176, 178, 261, 276, 268, 250, 233, 0),
('Building CIF/CB', '4300324', 'Zone_01_(FM)', 'Retail', 'ZONE FM ( BULK ZONE FM )', 'L3', 8, 5, 6, 27, 29, 25, 258, 300, 285, 388, 349, 347, 420, 331, 306, 307),
('Hotel Main Building', '4300334', 'Direct Connection', 'Retail', 'Main Bulk (NAMA)', 'DC', 14012, 12880, 11222, 13217, 13980, 15385, 12810, 13747, 13031, 17688, 15156, 14668, 18048, 19482, 22151, 27676),
('Village Square (Zone Bulk)', '4300335', 'Zone_VS', 'Zone Bulk', 'Main Bulk (NAMA)', 'L2', 26, 19, 72, 60, 125, 277, 143, 137, 145, 63, 34, 17, 14, 12, 21, 13),
('ZONE 8 (Bulk Zone 8)', '4300342', 'Zone_08', 'Zone Bulk', 'Main Bulk (NAMA)', 'L2', 2170, 1825, 2021, 2753, 2722, 3193, 3639, 3957, 3947, 4296, 3569, 3018, 1547, 1498, 2605, 3203),
('ZONE 3A (Bulk Zone 3A)', '4300343', 'Zone_03_(A)', 'Zone Bulk', 'Main Bulk (NAMA)', 'L2', 1234, 1099, 1297, 1892, 2254, 2227, 3313, 3172, 2698, 3715, 3501, 3796, 4235, 4273, 3591, 4041),
('ZONE 3B (Bulk Zone 3B)', '4300344', 'Zone_03_(B)', 'Zone Bulk', 'Main Bulk (NAMA)', 'L2', 2653, 2169, 2315, 2381, 2634, 2932, 3369, 3458, 3742, 2906, 2695, 3583, 3256, 2962, 3331, 2157),
('ZONE 5 (Bulk Zone 5)', '4300345', 'Zone_05', 'Zone Bulk', 'Main Bulk (NAMA)', 'L2', 4286, 3897, 4127, 4911, 2639, 4992, 5305, 4039, 2736, 3383, 1438, 3788, 4267, 4231, 3862, 3737),
('ZONE FM ( BULK ZONE FM )', '4300346', 'Zone_01_(FM)', 'Zone Bulk', 'Main Bulk (NAMA)', 'L2', 1595, 1283, 1255, 1383, 1411, 2078, 2601, 1638, 1550, 2098, 1808, 1946, 2008, 1740, 1880, 1880),
('Main Bulk (NAMA)', 'C43659', 'Main Bulk', 'Main BULK', 'NAMA', 'L1', 32803, 27996, 23860, 31869, 30737, 41953, 35166, 35420, 41341, 31519, 35290, 36733, 32580, 44043, 34915, 46039);

-- =====================================================
-- 3. HELPER FUNCTIONS FOR DATA MIGRATION
-- =====================================================

-- Function to safely get or create zone
CREATE OR REPLACE FUNCTION get_or_create_zone_id(zone_code TEXT) 
RETURNS INTEGER AS $$
DECLARE
    zone_id_val INTEGER;
BEGIN
    SELECT zone_id INTO zone_id_val FROM water_zones WHERE water_zones.zone_code = $1;
    
    IF zone_id_val IS NULL THEN
        INSERT INTO water_zones (zone_code, zone_name, zone_type, description)
        VALUES ($1, $1, 'AUTO_CREATED', 'Auto-created during migration')
        RETURNING zone_id INTO zone_id_val;
    END IF;
    
    RETURN zone_id_val;
END;
$$ LANGUAGE plpgsql;

-- Function to safely get or create meter type
CREATE OR REPLACE FUNCTION get_or_create_meter_type_id(type_code TEXT) 
RETURNS INTEGER AS $$
DECLARE
    type_id_val INTEGER;
BEGIN
    SELECT type_id INTO type_id_val FROM water_meter_types WHERE water_meter_types.type_code = $1;
    
    IF type_id_val IS NULL THEN
        INSERT INTO water_meter_types (type_code, type_name, category, billing_rate)
        VALUES ($1, $1, 'AUTO_CREATED', 0.025)
        RETURNING type_id INTO type_id_val;
    END IF;
    
    RETURN type_id_val;
END;
$$ LANGUAGE plpgsql;

-- Function to safely get or create parent meter
CREATE OR REPLACE FUNCTION get_or_create_parent_meter_id(parent_name TEXT, zone_code TEXT) 
RETURNS INTEGER AS $$
DECLARE
    parent_id_val INTEGER;
    zone_id_val INTEGER;
BEGIN
    SELECT parent_meter_id INTO parent_id_val FROM water_parent_meters WHERE parent_meter_name = $1;
    
    IF parent_id_val IS NULL THEN
        SELECT get_or_create_zone_id($2) INTO zone_id_val;
        INSERT INTO water_parent_meters (parent_meter_name, zone_id, meter_type)
        VALUES ($1, zone_id_val, 'AUTO_CREATED')
        RETURNING parent_meter_id INTO parent_id_val;
    END IF;
    
    RETURN parent_id_val;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. MIGRATE METERS TO MAIN TABLE
-- =====================================================

INSERT INTO water_meters (
    meter_label, 
    account_number, 
    zone_id, 
    meter_type_id, 
    parent_meter_id, 
    meter_level, 
    status,
    location_description
)
SELECT 
    s.meter_label,
    s.acct_no,
    get_or_create_zone_id(s.zone),
    get_or_create_meter_type_id(s.type),
    get_or_create_parent_meter_id(s.parent_meter, s.zone),
    COALESCE(s.label, 'L3'),
    'OPERATIONAL',
    'Migrated from CSV data on ' || CURRENT_DATE
FROM water_data_staging s
WHERE s.acct_no IS NOT NULL 
AND s.acct_no != ''
ON CONFLICT (account_number) DO NOTHING;

-- =====================================================
-- 5. MIGRATE CONSUMPTION DATA
-- =====================================================

-- Function to safely convert text to decimal
CREATE OR REPLACE FUNCTION safe_decimal(val TEXT) 
RETURNS DECIMAL(12,2) AS $$
BEGIN
    RETURN CASE 
        WHEN val IS NULL OR val = '' OR val = '-' THEN 0
        ELSE val::DECIMAL(12,2)
    END;
EXCEPTION WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Insert consumption data for 2024
INSERT INTO water_monthly_consumption (meter_id, reading_year, reading_month, consumption_m3)
SELECT 
    m.meter_id,
    2024,
    1,
    safe_decimal(s.jan_24::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.jan_24::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2024,
    2,
    safe_decimal(s.feb_24::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.feb_24::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2024,
    3,
    safe_decimal(s.mar_24::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.mar_24::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2024,
    4,
    safe_decimal(s.apr_24::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.apr_24::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2024,
    5,
    safe_decimal(s.may_24::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.may_24::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2024,
    6,
    safe_decimal(s.jun_24::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.jun_24::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2024,
    7,
    safe_decimal(s.jul_24::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.jul_24::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2024,
    8,
    safe_decimal(s.aug_24::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.aug_24::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2024,
    9,
    safe_decimal(s.sep_24::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.sep_24::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2024,
    10,
    safe_decimal(s.oct_24::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.oct_24::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2024,
    11,
    safe_decimal(s.nov_24::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.nov_24::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2024,
    12,
    safe_decimal(s.dec_24::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.dec_24::TEXT) > 0

UNION ALL

-- 2025 data
SELECT 
    m.meter_id,
    2025,
    1,
    safe_decimal(s.jan_25::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.jan_25::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2025,
    2,
    safe_decimal(s.feb_25::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.feb_25::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2025,
    3,
    safe_decimal(s.mar_25::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.mar_25::TEXT) > 0

UNION ALL

SELECT 
    m.meter_id,
    2025,
    4,
    safe_decimal(s.apr_25::TEXT)
FROM water_meters m
JOIN water_data_staging s ON m.account_number = s.acct_no
WHERE safe_decimal(s.apr_25::TEXT) > 0;

-- =====================================================
-- 6. UPDATE STATISTICS
-- =====================================================

ANALYZE water_meters;
ANALYZE water_monthly_consumption;

-- =====================================================
-- 7. VERIFICATION AND CLEANUP
-- =====================================================

-- Display migration results
SELECT 'MIGRATION COMPLETE' as status;

SELECT 
    'Total meters migrated: ' || COUNT(*) as result
FROM water_meters 
WHERE location_description LIKE '%Migrated from CSV%';

SELECT 
    'Total consumption records: ' || COUNT(*) as result
FROM water_monthly_consumption;

SELECT 
    'Sample zone summary:' as info;

SELECT 
    z.zone_name,
    COUNT(m.meter_id) as meter_count,
    SUM(c.consumption_m3) as total_consumption
FROM water_zones z
LEFT JOIN water_meters m ON z.zone_id = m.zone_id
LEFT JOIN water_monthly_consumption c ON m.meter_id = c.meter_id
GROUP BY z.zone_id, z.zone_name
ORDER BY total_consumption DESC;

-- Clean up helper functions
DROP FUNCTION IF EXISTS get_or_create_zone_id(TEXT);
DROP FUNCTION IF EXISTS get_or_create_meter_type_id(TEXT);
DROP FUNCTION IF EXISTS get_or_create_parent_meter_id(TEXT, TEXT);
DROP FUNCTION IF EXISTS safe_decimal(TEXT);

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 
    'Water meter data migration completed successfully!' as status,
    'All CSV data has been imported to the database.' as message,
    'Ready for use with the Water Analysis Module.' as next_step;
